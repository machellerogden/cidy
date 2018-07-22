'use strict';

const createCommand = require('../lib/createCommand');

const cmdSpec = [
    {
        "name": "docker",
        "type": "command"
    },
    {
        "name": "build",
        "type": "command"
    },
    {
        "name": "tag",
        "type": "option",
        "template": "${registry ? `${registry}/` : ''}${name}:${version}"
    },
    {
        "name": "registry",
        "type": "input",
        "optional": true
    },
    {
        "name": "name",
        "type": "input"
    },
    {
        "name": "version",
        "type": "input",
        "default": "latest"
    },
    {
        "name": "add-host",
        "type": "option",
        "optional": true
    },
    {
        "name": "build-arg",
        "type": "option",
        "optional": true
    },
    {
        "name": "cache-from",
        "type": "option",
        "optional": true
    },
    {
        "name": "cgroup-parent",
        "type": "option",
        "optional": true
    },
    {
        "name": "compress",
        "type": "option",
        "optional": true
    },
    {
        "name": "cpu-period",
        "type": "option",
        "optional": true
    },
    {
        "name": "cpu-quota",
        "type": "option",
        "optional": true
    },
    {
        "name": "cpu-shares",
        "type": "option",
        "optional": true
    },
    {
        "name": "cpuset-cpus",
        "type": "option",
        "optional": true
    },
    {
        "name": "cpuset-mems",
        "type": "option",
        "optional": true
    },
    {
        "name": "disable-content-trust",
        "type": "option",
        "optional": true
    },
    {
        "name": "force-rm",
        "type": "option",
        "optional": true
    },
    {
        "name": "iidfile",
        "type": "option",
        "optional": true
    },
    {
        "name": "isolation",
        "type": "option",
        "optional": true
    },
    {
        "name": "label",
        "type": "option",
        "optional": true
    },
    {
        "name": "memory",
        "type": "option",
        "optional": true
    },
    {
        "name": "memory-swap",
        "type": "option",
        "optional": true
    },
    {
        "name": "network",
        "type": "option",
        "optional": true
    },
    {
        "name": "no-cache",
        "type": "option",
        "optional": true
    },
    {
        "name": "platform",
        "type": "option",
        "optional": true
    },
    {
        "name": "pull",
        "type": "option",
        "optional": true
    },
    {
        "name": "quiet",
        "type": "option",
        "optional": true
    },
    {
        "name": "rm",
        "type": "option",
        "optional": true
    },
    {
        "name": "security-opt",
        "type": "option",
        "optional": true
    },
    {
        "name": "shm-size",
        "type": "option",
        "optional": true
    },
    {
        "name": "squash",
        "type": "option",
        "optional": true
    },
    {
        "name": "stream",
        "type": "option",
        "optional": true
    },
    {
        "name": "target",
        "type": "option",
        "optional": true
    },
    {
        "name": "ulimit",
        "type": "option",
        "optional": true
    },
    {
        "name": "context",
        "type": "value"
    }
];

module.exports = createCommand(cmdSpec);
