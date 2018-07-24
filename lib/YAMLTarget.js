'use strict';

module.exports = YAMLTarget;

const YAML = require('yamljs');
const ShellTarget = require('./ShellTarget');

function YAMLTarget(file) {
  const definition = YAML.load(file);
  const { kind, tty, spec } = definition;
  if (kind === 'shell') return ShellTarget(definition);
  if (kind === 'composition') return spec;
}
