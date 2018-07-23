'use strict';

module.exports = YAMLTarget;

const YAML = require('yamljs');
const ShellTarget = require('./ShellTarget');

function YAMLTarget(file) {
  const { kind, spec } = YAML.load(file);
  if (kind === 'shell') return ShellTarget(spec);
  if (kind === 'composition') return spec;
}
