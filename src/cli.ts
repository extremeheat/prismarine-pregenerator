#!/usr/bin/env node
const { ArgumentParser } = require('argparse');
const { version } = require('../package.json');

const parser = new ArgumentParser({
  description: `prismarine world pre-generator ${version}`
});
 
parser.add_argument('-v', '--version', { help: 'minecraft version', type: 'string' });
parser.add_argument('-f', '--format', { help: 'format, "anvil" or "bedrock"' });
parser.add_argument('--center', { help: 'center position', });
parser.add_argument('--radius', { help: 'generation radius' });

parser.add_argument('--levelName', { help: 'world name' });
parser.add_argument('--gamemode', { help: 'gamemode' });
parser.add_argument('--seed', { help: 'seed' });
parser.add_argument('--generator', { help: 'generator, flat or normal' })
parser.add_argument('-o', '--output', { help: 'output dir' })

const args = parser.parse_args(); 

console.dir(args)

if (!args.version || !args.format || !args.center || !args.radius) {
  parser.print_help()
  process.exit(1)
}

