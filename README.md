<h1 align="center">prismarine-pregenerator</h1>
<p align="center"><i>A simple world pre-generator for Minecraft</i></p>

[![NPM version](https://img.shields.io/npm/v/leveldb-zlib.svg)](http://npmjs.com/package/prismarine-pregenerator)
[![Build Status](https://github.com/extremeheat/prismarine-pregenerator/workflows/CI/badge.svg)](https://github.com/extremeheat/prismarine-pregenerator/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/extremeheat/prismarine-pregenerator)

---

## Installation

You can use this as a command line tool or as a Node.js library.

As a CLI:
```bash
npm install -g extremeheat/prismarine-pregenerator
# Brand new world:
npx prismarine-pregenerator create --format anvil --levelName "My Level Name" --gamemode "creative" --seed "Notch" --generator flat --bb "-100 -100 100 100" --output ./world
# Add chunks to existing world
npx prismarine-pregenerator append --input ./world
```

As a library:

```bash
npm install extremeheat/prismarine-pregenerator
```

## Library Usage

Example for a flat world:

```js
// Create your bot
const { Generator } = require('prismarine-pregenerator')

// Java Edition
var generator = new Generator('anvil', '1.16')
// Bedrock Edition
var generator = new Generator('bedrock', /* undefined for latest version */)

generator.setOptions({
  levelName: 'Sea World',
  gamemode: 'creative',
  seed: '🌱',
  generator: 'default',
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard',
  location: string
})
// Start the generation server
await generator.run()
// Start generating the world within the specified bounds
await generator.generate({ minX: -100, minZ: -100, maxX: 100, maxZ: 100 }, true)
```

## API

#### Generator

##### setOpt

<!-- Dynamic usage with prismarine-world as a generator, note this will be a slow process:

```js
// Create your bot
const { Generator } = require('prismarine-pregenerator')
const World = require('prismarine-world')('1.12')
const generator = new Generator('anvil', '1.16')

generator.setOptions({
  levelName: 'Sea World',
  gamemode: 'creative',
  seed: '🌱',
  generator: 'default',
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard',
  location: string
})

const world = new World(generator.dynamic)
``` -->

<!-- ### See also -->
<!-- * [cupola-editor](https://github.com/extremeheat/cupola-editor) Cupola Editor, a save editor for Minecraft -->