import fs from 'fs'
import mineflayer from 'mineflayer'
import bp from 'bedrock-protocol'
import { startBedrockServer, startJavaServer } from './server'
import { iterators } from 'prismarine-world'

const options = {
  anvil: fs.readFileSync('./mc-java.properties', 'utf-8'),
  bedrock: fs.readFileSync('./mc-bedrock.properties', 'utf-8'),
}

export class Generate {
  config: Record<string, string> = {}
  format: 'anvil' | 'bedrock'
  location: string
  version: string
  server
  client
  // The list of saved chunks so far
  saved = new Set()

  wanted = new Set()

  constructor(format: 'anvil' | 'bedrock', version: string) {
    this.format = format
    this.version = version
    const opt = options[format]
    for (const line of opt.split('\n')) {
      if (line.startsWith('#')) {
        continue
      }
      const [key, ...val] = line.split('=')
      this.config[key] = val.join('=').trim()
    }
  }

  getConfiguration() {

  }

  setOptions({ levelName, gamemode, seed, generator, difficulty, location }: {
    levelName: string,
    gamemode: 'creative' | 'survival' | 'adventure',
    seed: string,
    generator: 'default' | 'flat',
    difficulty: 'peaceful' | 'easy' | 'normal' | 'hard',
    location: string
  }) {
    this.setOption('level-name', levelName)
    this.setOption('gamemode', gamemode)
    if (this.format === 'anvil') {
      this.setOption('generator', generator)
    } else if (this.format === 'bedrock') {
      this.setOption('generator', generator.toUpperCase())
    }
    this.setOption('difficulty', difficulty)
    this.setOption('level-seed', seed)
    this.location = location
  }

  setOption(key, val) {
    this.config[key] = val
  }

  async run() {
    if (!this.location) throw Error('needs setup')
    console.log('SERVER OPTS', this.config)
    const handle = await { anvil: startJavaServer, bedrock: startBedrockServer }[this.format](this.version, this.config)

    const options = {
      username: `WorldGen${Math.random() * 100 | 0}`,
      port: 6961,
      offline: true,
      host: 'localhost',
      // @ts-ignore
      version: this.version
    }

    if (this.format === 'anvil') {
      this.client = mineflayer.createBot(options)
    } else if (this.format === 'bedrock') {
      // no mineflayer at the moment :(
      this.client = bp.createClient(options)
    }

    this.client.on('close', console.warn)

    return new Promise<void>(res => {
      this.client.on('state', now => {
        if (now === 'play') res()
      })
  
      this.server = handle
      // Anvil chunk
      this.client.on('map_chunk', ({ x, z }) => {
        this.saved.add(x + ',' + z)
      })
  
      // Bedrock chunk
      this.client.on('level_chunk', ({ x, z }) => {
        this.saved.add(x + ',' + z)
      })
    })
  }

  async crop({ minX, minZ, maxX, maxZ }) {
    for (const saved of this.saved) {
      if (!this.wanted.has(saved)) {
        // TODO: delete this chunk
      }
    }
  }

  /**
   * 
   * @param { minX, minY, maxX, maxZ } bounds The chunk coordinates to generate the world between.
   */
  async generate({ minX, minZ, maxX, maxZ }, crop) {
    if (!this.server || !this.client) throw Error('Server and/or client has not been started')
    // const count0 = (maxX - minX) * (maxZ - minZ)
    // console.log('Generating', count0, 'chunks. ETA:', ((100 * count0) / 1000) * 1.5, 'seconds')
    // for (let x = minX; x < maxX; x++) {
    //   for (let z = minZ; z < maxZ; z++) {
    //     console.log(`tp @a ${x << 8} 200 ${z << 8}`)
    //     await this.server.tp([x << 8, 200, z << 8])
    //     await new Promise(r => setTimeout(r, 100))
    //     ++done
    //   }
    // }
    let done = 0

    // Not using a manhattan iterator causes the java edition server to lock up and crash
    // probably because we jump around the world so fast..
    const [centerX, centerZ] = [(minX + maxX) / 2, (minZ + maxZ) / 2]
    const radius = Math.sqrt((maxX - centerX) ** 2 + (maxZ - centerZ) ** 2)
    const count = 2 * (radius ** 2)

    const it = new iterators.ManhattanIterator(centerX, centerZ, Math.ceil(radius))

    console.log('Generating', count, 'chunks. ETA:', ((100 * count) / 1000) * 1.5, 'seconds', radius)

    let val
    while (val = it.next()) {
      console.log(`tp @a ${val.x << 8} 200 ${val.z << 8}`, done)
      await this.server.tp([val.x << 8, 200, val.z << 8])
      await new Promise(r => setTimeout(r, 100))
      done++
    }
    console.log('done!')

    console.log('Generated', done, 'chunks')
    if (crop) this.crop({ minX, minZ, maxX, maxZ })
  }
}

async function test() {
  const generator = new Generate('anvil', '1.16')
  await generator.setOptions({
    levelName: 'Hallo', gamemode: 'creative', seed: null,
    generator: 'default', difficulty: 'peaceful', location: '.'
  })
  await generator.run()
  await generator.generate({ minX: -10, minZ: -10, maxX: 10, maxZ: 10 }, true)
}

async function testBedrock() {
  const generator = new Generate('bedrock', '1.16')
  await generator.setOptions({
    levelName: 'Hallo', gamemode: 'creative', seed: null,
    generator: 'default', difficulty: 'peaceful', location: '.'
  })
  await generator.run()
  await generator.generate({ minX: -10, minZ: -10, maxX: 10, maxZ: 10 }, true)
}

test()