'use strict';

module.exports = compile;

const vm = require('vm');

function compile(template, context) {
    const script = new vm.Script(`\`${template}\``);
    return script.runInNewContext(context);
}
