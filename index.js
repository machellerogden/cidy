#!/usr/bin/env node
'use strict';

const Targets = require('targets');
const requireDir = require('require-dir');
const targets = requireDir('./targets');

Targets({ name: 'cidy', targets });

