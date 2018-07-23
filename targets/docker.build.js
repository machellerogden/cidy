'use strict';

const createCommand = require('../lib/createCommand');
const dockerCommand = require('../commands/docker.build');

module.exports = createCommand(dockerCommand);
