const { spawn } = require('child_process');
const vm = require('vm');

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

function template(context, template) {
    const script = new vm.Script(`\`${template}\``)
    return script.runInNewContext({ context })
}

const filters = {
    option: (answer) => ({ type: 'option', value: answer }),
    value: (answer) => ({ type: 'value', value: answer }),
    input: (answer) => ({ type: 'input', value: answer }),
};

const createCommand = (spec) => {
    const r = spec.reduce((acc, { name, type, ...entry }) => {
        if (type === 'command') {
            acc.cmd.push(name);
            return acc;
        }
        if (type === 'option' && entry.template) {
            acc.templates[name] = (options) => template(options, entry.template);
            return acc;
        }
        if (type === 'option') {
            acc.prompts.push({
                name,
                type: "input",
                message: entry.message || name,
                default: entry.default || null,
                optional: !!entry.optional,
                filter: filters.option
            });
            return acc;
        }
        if (type === 'value') {
            acc.prompts.push({
                name,
                type: "input",
                message: entry.message || name,
                default: entry.default || null,
                optional: !!entry.optional,
                filter: filters.value
            });
            return acc;
        }
        if (type === 'input') {
            acc.prompts.push({
                name,
                type: "input",
                message: entry.message || name,
                default: entry.default || null,
                optional: !!entry.optional,
                filter: filters.input
            });
            return acc;
        }
        return acc;
    }, { cmd: [], prompts: [], templates: [] });

    const [ cmd, ...cmdArgs ] = r.cmd;
    const { templates, prompts } = r;
    function cmdTarget(options, print) {
        console.log(options);
        const values = Object.entries(options).map(([ k, { value } ]) => ({[k]: value}));
        const args = Object.entries(options).reduce((acc, [ k, { value, type } ]) => {
            if (value != null) {
                if (templates[k]) {
                    acc = [ ...acc, `--${k} ${templates[k](values)}` ];
                    return acc;
                }
                if (type === 'input') return acc;
                if (type === 'value') {
                    acc = [ ...acc, value ];
                    return acc;
                }
                if (type === 'option') {
                    acc = [ ...acc, `--${k} ${value}` ];
                    return acc;
                }
            }
            return acc;
        }, []);
        print(`Running: ${cmd} ${cmdArgs.join(' ')} ${args.join(' ')}`);
        return spawn(cmd, [ ...cmdArgs, ...args ]);
    }
    cmdTarget.label = `${cmd} ${cmdArgs.join(' ')}`;
    cmdTarget.prompts = prompts;
    return cmdTarget;
}

module.exports = createCommand;
