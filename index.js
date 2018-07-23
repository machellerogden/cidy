#!/usr/bin/env node
'use strict';
const Targets = require('targets');
const dir = require('require-dir');

const commands = require('./lib/loadCommands')('./commands');
const targets = dir('./targets');

Targets({ name: 'cidy', targets: { ...commands, ...targets } });
