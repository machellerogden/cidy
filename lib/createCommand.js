'use strict';

module.exports = createCommand;

const { spawn } = require('child_process');
const vm = require('vm');
const camelCase = require('lodash/camelCase');
const ary = require('lodash/ary');
const mapKeys = require('lodash/mapKeys');

function applyTemplate(template, context) {
    const script = new vm.Script(`\`${template}\``);
    return script.runInNewContext(context);
}

const createPrompt = (entry) => {
    const { name } = entry;
    const prompt = {
        name,
        type: "input",
        message: entry.message || name
    };
    if (entry.default) prompt.default = entry.default;
    if (entry.optional) prompt.optional = true;
    return prompt;
};

function createCommand(spec) {
    const { names, templates, prompts } = spec.reduce((acc, entry) => {
        if (typeof entry === 'string') {
            acc.names.push(entry);
            acc.templates[entry] = entry;
            return acc;
        }
        const { name, type = 'option' } = entry;

        acc.names.push(name);

        if (!entry.derived) {
            acc.prompts.push(createPrompt(entry));
        }

        if (entry.template != null) {
            acc.templates[name] = entry.template;
            return acc;
        }

        if (type === 'command') {
            acc.templates[name] = name;
            return acc;
        }

        if (type === 'value') {
            acc.templates[name] = '${' + camelCase(name) + '}';
            return acc;
        }

        acc.templates[entry.name] = '${' + camelCase(name) + ' ? `--' + entry.name + ' ${' + camelCase(entry.name) + '}` : ""}';

        return acc;
    }, { names: [], templates: {}, prompts: [] });

    const fallbackContext = names.reduce((acc, name) => {
        acc[camelCase(name)] = '';
        return acc;
    }, {});

    function cmdTarget(options, print) {
        const templateContext = mapKeys(options, (v, k) => camelCase(k));
        const context = { ...fallbackContext, ...templateContext };
        const arr = names.reduce((acc, name) => {
            if (templates[name] != null) {
                const templated = applyTemplate(templates[name], context);
                if (templated) {
                    const di = templated.indexOf(' ');
                    if (di > -1) {
                        const parts = [ templated.slice(0, di), templated.slice(di + 1) ];
                        return [ ...acc, ...parts ];
                    } else {
                        return [ ...acc, templated ];
                    }
                }
            }
            return acc;
        }, []);
        const [ cmd, ...args ] = arr;
        print(`Running: ${cmd} ${args.join(' ')}`);
        return spawn(cmd, [ ...args ]);
    }

    cmdTarget.label = names[0];
    cmdTarget.prompts = prompts;

    return cmdTarget;
}
