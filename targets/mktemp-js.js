'use strict';

module.exports = mktemp;

const tmp = require('tmp');

function mktemp({ type = 'dir', prefix = 'cidy', cleanup = true }) {
    return new Promise((resolve, reject) => {
        return tmp[type]({
            template: `/tmp/${prefix}-XXXXXX`,
            unsafeCleanup: cleanup,
            keep: !cleanup
        }, (err, path) => {
            if (err) return reject(err);
            return resolve(path);
        });
    });
}

mktemp.prompts = [
    {
        name: 'type',
        type: 'list',
        choices: [
            {
                name: 'directory',
                value: 'dir'
            },
            'file'
        ],
        default: 'dir',
        optional: true
    },
    {
        name: 'prefix',
        message: ({ type }) => `enter a prefix for the temp ${type} you wish to create`,
        default: 'cidy',
        optional: true
    },
    {
        name: 'cleanup',
        type: 'confirm',
        message: ({ type }) => `would you like the ${type} to be removed on process exit?`,
        optional: true
    }
];
