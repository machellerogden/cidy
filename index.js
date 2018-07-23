#!/usr/bin/env node
'use strict';
const Targets = require('targets');
const requireDir = require('require-dir');
const mapValues = require('lodash/mapValues');

const createCommand = require('./lib/createCommand');

const commands = mapValues(requireDir('./commands'), createCommand);
const targets = requireDir('./targets');

Targets({ name: 'cidy', targets: { ...commands, ...targets } });

