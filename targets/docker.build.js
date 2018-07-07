'use strict';

const requireDir = require('require-dir');
const { toArgs } = requireDir('../lib');

const path = require('path');
const execa = require('execa');
const kebabCase = require('lodash/kebabCase');

const optionals = [
    '--add-host',
    '--build-arg',
    '--cache-from',
    '--cgroup-parent',
    '--compress',
    '--cpu-period',
    '--cpu-quota',
    '--cpu-shares',
    '--cpuset-cpus',
    '--cpuset-mems',
    '--disable-content-trust',
    '--force-rm',
    '--iidfile',
    '--isolation',
    '--label',
    '--memory',
    '--memory-swap',
    '--network',
    '--no-cache',
    '--platform',
    '--pull',
    '--quiet',
    '--rm',
    '--security-opt',
    '--shm-size',
    '--squash',
    '--stream',
    '--target',
    '--ulimit'
];

function build(options, print) {
    const {
        registry,
        name,
        tag = 'latest',
        context = '.',
        file = path.resolve(process.cwd(), 'Dockerfile')
    } = options;
    const args = [
        'build',
        '-t', `${registry ? `${registry}/` : ''}${name}:${tag}`,
        ...optionals.reduce((acc, opt) => [ ...acc, ...toArgs(opt, options[kebabCase(opt)]) ], []),
        context
    ];
    const cmd = 'docker';
    print(`Running: ${cmd} ${args.join(' ')}`);
    return execa('docker', args);
}

build.label = 'Docker Build';

build.prompts = [
    {
        type: 'input',
        name: 'registry',
        message: '`registry` portion of the ‘registry/name:tag’ format',
        optional: true
    },
    {
        type: 'input',
        name: 'name',
        message: '`name` portion of the ‘registry/name:tag’ format'
    },
    {
        type: 'input',
        name: 'tag',
        message: '`tag` portion of the ‘registry/name:tag’ format',
        optional: true
    },
    {
        type: 'input',
        name: 'tag',
        message: 'Name and optionally a tag in the ‘name:tag’ format'
    },
    {
        type: 'input',
        name: 'context',
        message: 'Build context',
        optional: true,
        default: '.'
    },
    {
        type: 'input',
        name: 'file',
        message: 'Name of the Dockerfile (Default is ‘PATH/Dockerfile’)',
        optional: true
    },
    {
        type: 'editor',
        name: 'add-host',
        message: 'add other hosts into a container’s /etc/hosts',
        optional: true
    },
    {
        type: 'editor',
        name: 'build-arg',
        message: 'Set build-time variables (leave blank for none or add one build-arg per line)',
        optional: true
    },
    {
        type: 'editor',
        name: 'cache-from',
        message: 'Images to consider as cache sources',
        optional: true
    },
    {
        type: 'input',
        name: 'cgroup-parent',
        message: 'Optional parent cgroup for the container',
        optional: true
    },
    {
        type: 'confirm',
        name: 'compress',
        message: 'Compress the build context using gzip',
        optional: true
    },
    {
        type: 'input',
        name: 'cpu-period',
        message: 'Limit the CPU CFS (Completely Fair Scheduler) period',
        optional: true
    },
    {
        type: 'input',
        name: 'cpu-quota',
        message: 'Limit the CPU CFS (Completely Fair Scheduler) quota',
        optional: true
    },
    {
        type: 'input',
        name: 'cpu-shares',
        message: 'CPU shares (relative weight)',
        optional: true
    },
    {
        type: 'input',
        name: 'cpuset-cpus',
        message: 'CPUs in which to allow execution (0-3, 0,1)',
        optional: true
    },
    {
        type: 'input',
        name: 'cpuset-mems',
        message: 'MEMs in which to allow execution (0-3, 0,1)',
        optional: true
    },
    {
        type: 'confirm',
        name: 'disable-content-trust',
        message: 'Skip image verification',
        default: true,
        optional: true
    },
    {
        type: 'input',
        name: 'force-rm',
        message: 'Always remove intermediate containers',
        optional: true
    },
    {
        type: 'input',
        name: 'iidfile',
        message: 'Write the image ID to the file',
        optional: true
    },
    {
        type: 'input',
        name: 'isolation',
        message: 'Container isolation technology',
        optional: true
    },
    {
        type: 'input',
        name: 'label',
        message: 'Set metadata for an image',
        optional: true
    },
    {
        type: 'input',
        name: 'memory',
        message: 'Memory limit',
        optional: true
    },
    {
        type: 'input',
        name: 'memory-swap',
        message: 'Swap limit equal to memory plus swap: ‘-1’ to enable unlimited swap',
        optional: true
    },
    {
        type: 'input',
        name: 'network',
        message: 'Set the networking mode for the RUN instructions during build',
        optional: true
    },
    {
        type: 'input',
        name: 'no-cache',
        message: 'Do not use cache when building the image',
        optional: true
    },
    {
        type: 'input',
        name: 'platform',
        message: 'Set platform if server is multi-platform capable',
        optional: true
    },
    {
        type: 'input',
        name: 'pull',
        message: 'Always attempt to pull a newer version of the image',
        optional: true
    },
    {
        type: 'input',
        name: 'quiet',
        message: 'Suppress the build output and print image ID on success',
        optional: true
    },
    {
        type: 'input',
        name: 'rm',
        message: 'Remove intermediate containers after a successful build',
        optional: true
    },
    {
        type: 'input',
        name: 'security-opt',
        message: 'Security options',
        optional: true
    },
    {
        type: 'input',
        name: 'shm-size',
        message: 'Size of /dev/shm',
        optional: true
    },
    {
        type: 'input',
        name: 'squash',
        message: 'Squash newly built layers into a single new layer',
        optional: true
    },
    {
        type: 'input',
        name: 'stream',
        message: 'Stream attaches to server to negotiate build context',
        optional: true
    },
    {
        type: 'input',
        name: 'target',
        message: 'Set the target build stage to build.',
        optional: true
    },
    {
        type: 'input',
        name: 'ulimit',
        message: 'Ulimit options',
        optional: true
    }
];

module.exports = build;
