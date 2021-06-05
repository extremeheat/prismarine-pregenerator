import fs from 'fs'
import path from 'path'
import { once } from 'events'
import javaServer, { WrapServer } from 'minecraft-wrap'
import bedrockServer from 'bedrock-protocol/tools/startVanillaServer'
import { waitFor } from 'bedrock-protocol/src/datatypes/util'

type ServerHandle = { wrap?, stop?, tp(position: [number, number, number]): Promise<any> }

export function startJavaServer(minecraftVersion, propOverrides): Promise<ServerHandle> {
  const MC_SERVER_JAR_DIR = path.join(__dirname, '../', 'servers')
  const MC_SERVER_JAR = path.join(MC_SERVER_JAR_DIR, `minecraft_server.${minecraftVersion}.jar`)
  const MC_SERVER_PATH = path.join(MC_SERVER_JAR_DIR, 'java')
  const PORT = 6961
  // fs.rmdirSync(path.join(MC_SERVER_PATH, `${minecraftVersion}`, 'world'), { recursive: true })

  const wrap = new WrapServer(MC_SERVER_JAR, path.join(MC_SERVER_PATH, `${minecraftVersion}`))

  wrap.on('line', (line) => {
    if (line.includes('Teleported')) wrap.emit('tped')
  })

  const handle: ServerHandle = {
    wrap,
    stop() {
      wrap.stopServer((err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('done')
      })
    },
    tp(position: [number, number, number]) {
      wrap.writeServer(`tp @a ${position.join(' ')}\n`)
      return once(wrap, 'tped')
    }
  }

  return new Promise(res => {
    javaServer.download(minecraftVersion, MC_SERVER_JAR, (err) => {
      if (err) {
        console.log(err)
        return
      }
      console.log('🟡 Starting server', minecraftVersion)
      wrap.on('line', console.log)
      wrap.startServer({ ...propOverrides, 'server-port': PORT }, (err) => {
        if (err) {
          console.log(err)
          return
        }
        console.log('✅ Stared server', minecraftVersion)
        res(handle)
      })
    })
  })
}

export async function startBedrockServer(minecraftVersion, propOverrides): Promise<ServerHandle> {
  const handle: any = await bedrockServer.startServerAndWait(minecraftVersion, 220 * 1000, propOverrides)
  handle.stop = handle.kill
  handle.tp = async (pos) => {
    handle.stdin.write(`tp @a ${pos.join(' ')}\n`)
    handle.stdin.end()
    return waitFor(res => {
      handle.stdout.on('line', line => { if (line.includes('Teleported')) res(true) })
    }, 1000 * 60, () => { throw new Error('timed out') })
  }
  return handle
}

async function test() {
  const handle = await startJavaServer('1.16.4', {})
  console.log('Started!')
}

// test()