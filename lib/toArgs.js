'use strict';

module.exports = toArgs;

const isArray = require('lodash/isArray');
const os = require('os');

function toArgs(flag, value) {
    const arr = typeof value === 'string' && value.length
        ? splitLines(value)
        : typeof value === 'number' || (typeof value === 'boolean' && value)
            ? [ value ]
            : isArray(value)
                ? value
                : [];
    return arr.reduce((acc, v, i) => [
        ...acc,
        ...(typeof v === 'boolean'
            ? [ flag ]
            : [ flag, `${v}` ])
    ], []);
}

function splitLines(value) {
    return value
        .replace(new RegExp(`^${os.EOL}*`), '')
        .replace(new RegExp(`${os.EOL}*$`), '')
        .split(os.EOL);
}
