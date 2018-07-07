'use strict';
module.exports = clone;

const Git = require('nodegit');
const path = require('path');

function clone(options, print) {
    const {
        dest,
        url
    } = options;
    return Git.Clone(url, path.resolve(dest))
        .then((repository) => {
             return repository.getBranchCommit('master').sha();
        });
}

clone.label = 'Git Clone';

clone.prompts = [
    {
        type: 'input',
        name: 'dest',
        message: 'local path to clone repository to'
    },
    {
        type: 'input',
        name: 'url',
        message: 'clone url for remote repository'
    }
];
