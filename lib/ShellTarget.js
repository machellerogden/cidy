'use strict';

module.exports = ShellTarget;

const pty = require('node-pty');
const { spawn } = require('child_process');
const camelCase = require('lodash/camelCase');
const mapKeys = require('lodash/mapKeys');

const run = require('./runInNewContext');
const compile = (template, context) => run(`\`${template}\``, context);

function ShellTarget(definition) {
    const { spec, tty } = definition;
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
            if (derived && type === 'option') {
                acc.templates[name] = `--${name} ${entry.template}`;
            } else if (derived && type === 'flag') {
                acc.templates[name] = `-${name} ${entry.template}`;
            } else if (type === 'option') {
                acc.templates[name] = '${' + cname + ' ? "--' + name + ' " : ""}' + entry.template;
            } else if (type === 'flag') {
                acc.templates[name] = '${' + cname + ' ? "-' + name + ' " : ""}' + entry.template;
            } else {
                acc.templates[name] = entry.template;
            }
            return acc;
        }

        const templatePrefix = '${(Array.isArray(' + cname + ') ? ' + cname + ' : [' + cname + ']).reduce((a, n) => `${a ? `${a} ` : ""}';
        const templatePostfix = '`, "")}';

        if (type === 'command') {
            acc.templates[name] = `${templatePrefix}${name}${templatePostfix}`;
            return acc;
        }

        if (type === 'value') {
            acc.templates[name] = templatePrefix + '${' + cname + '}' + templatePostfix;
            return acc;
        }

        if ([ 'option', 'flag' ].includes(type)) {
            const prefix = (type === 'option') ? '--' : '-';
            const delim = (entry.useEquals) ? '=' : ' ';
            if (entry.useValue) {
                acc.templates[name] = templatePrefix + '${(n == null || n == "") ? "" : `' + prefix + name + delim + '${n}`}' + templatePostfix;
            } else {
                acc.templates[name] = templatePrefix + '${(!n || n == "false") ? "" : ![ "true", "1", 1, true ].includes(n) ? `' + prefix + name + delim + '${n}` :  "' + prefix + name + '"}' + templatePostfix;
            }
            return acc;
        }

        throw new Error('not sure what to do with:', name);

        return acc;
    }, { names: [], templates: {}, prompts: [] });

    const fallbackContext = names.reduce((acc, name) => {
        acc[camelCase(name)] = '';
        return acc;
    }, {});

    function cmdTarget(options, print) {
        const templateContext = mapKeys(options, (v, k) => camelCase(k));
        const context = { ...fallbackContext, ...templateContext };
        const argv = names.reduce((acc, name) => {
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
        const [ cmd, ...args ] = argv;
        const isTTY = tty
            ? run(tty, { ...context, argv })
            : false;
        print(`isTTY? ${isTTY}`);
        print(`Running: ${argv.join(' ')}`);
        if (isTTY) {
            const stream = pty.spawn(cmd, args, {
                name: 'xterm-color',
                cols: process.stdout.columns,
                rows: process.stdout.rows,
                cwd: process.cwd(),
                env: process.env
            });
            process.stdout.on('resize', () => stream.resize(process.stdout.columns, process.stout.rows));
            stream.on('close', data => {
              process.stdin.unpipe(stream);
              process.stdin.setRawMode(false);
            });
            process.stdin.setEncoding("utf8")
            process.stdin.setRawMode(true);
            process.stdin.pipe(stream);
            stream.pipe(process.stdout);
            return '';
        } else {
            return spawn(cmd, args);
        }
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
