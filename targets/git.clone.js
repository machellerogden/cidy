'use strict';
module.exports = clone;

const { spawn } = require('child_process');
const path = require('path');

function clone(options, print) {
    const {
        dest,
        url
    } = options;
    return spawn('git', [ 'clone', url, path.resolve(dest) ]);
}

clone.label = 'Git Clone';

clone.prompts = [
    {
        type: 'input',
        name: 'url',
        message: 'clone url for remote repository'
    },
    {
        type: 'input',
        name: 'dest',
        message: 'What directory would you like to clone to?'
    }
];
