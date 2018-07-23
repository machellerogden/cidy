'use strict';

module.exports = ShellTarget;

const { spawn } = require('child_process');
const camelCase = require('lodash/camelCase');
const mapKeys = require('lodash/mapKeys');

const compile = require('./compile');

function ShellTarget(spec) {
    const { names, templates, prompts } = spec.reduce((acc, entry) => {
        if (typeof entry === 'string') {
            acc.names.push(entry);
            acc.templates[entry] = entry;
            return acc;
        }
        const { name, type = 'option', derived = false, flag = false } = entry;
        const cname = camelCase(name);

        acc.names.push(name);

        if (!derived) {
            acc.prompts.push(Prompt(entry));
        }

        if (type == 'variable') return acc;

        if (entry.template != null) {
            if (type === 'option') {
              acc.templates[name] = '${' + cname + ' ? "--' + name + ' " : ""}' + acc.templates[name];
            } else if (type === 'flag') {
              acc.templates[name] = '${' + cname + ' ? "-' + name + ' " : ""}' + acc.templates[name];
            } else {
              acc.templates[name] = entry.template;
            }
            return acc;
        }

        if (type === 'command') {
            acc.templates[name] = name;
            return acc;
        }

        if (type === 'value') {
            acc.templates[name] = '${' + cname + '}';
            return acc;
        }

        if (type === 'flag') {
            acc.templates[name] = '${(!' + cname + ' || ' + cname + ' == "false") ? "" : ![ "true", "1", true ].includes(' + cname + ') ? `-' + name + ' ${' + cname + '}` :  "-' + name + '"}';
            return acc;
        }

        // else assume option
        acc.templates[name] = '${' + cname + ' ? `--' + name + ' ${' + cname + '}` : ""}';

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
                const templated = compile(templates[name], context);
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
        if (!process.env.DRY_RUN) return spawn(cmd, [ ...args ]);
    }

    cmdTarget.label = names[0];
    cmdTarget.prompts = prompts;

    return cmdTarget;
}

function Prompt(entry) {
    const { name } = entry;
    const prompt = {
        name,
        type: "input",
        message: entry.message || name
    };
    if (entry.default) prompt.default = entry.default;
    if (entry.optional) prompt.optional = true;
    return prompt;
}
