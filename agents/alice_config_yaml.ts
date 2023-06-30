import { IConfig } from "../interfaces.ts";
import { Sapial } from "../sapial.ts";
import fs from 'node:fs';
import YAML from 'yaml';

const alice_config = YAML.parse(fs.readFileSync('./config.yml', 'utf8'))
const config: IConfig = {
    name: alice_config.name,
    primaryModel: alice_config.primaryModel,
    secondaryModel: alice_config.secondaryModel,
    memory: alice_config.memory,
}

const alice = await Sapial.init(config);

console.log("Alice is online");



