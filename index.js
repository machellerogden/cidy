#!/usr/bin/env node
'use strict';
const Targets = require('targets');
const targets = require('./lib/load')('./targets');

Targets({ name: 'cidy', targets });
