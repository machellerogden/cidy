'use strict';

module.exports = loadCommands;

const YAML = require('yamljs');
const fs = require('fs');
const path = require('path');
const createCommand = require('./createCommand');
const callsites = require('callsites');

function loadCommands(commandDir) {
    const dir = path.join(path.dirname(callsites()[1].getFileName()), commandDir);
    return fs.readdirSync(dir).reduce((acc, file) => {
        const name = file.includes('.')
            ? file.slice(0, file.lastIndexOf('.'))
            : file;
        acc[name] = createCommand(YAML.load(path.join(dir, file)));
        return acc;
    }, {});
}
