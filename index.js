#!/usr/bin/env node
'use strict';

const Targets = require('targets');
const targets = Targets.load('./targets');

Targets({ name: 'cidy', targets });

