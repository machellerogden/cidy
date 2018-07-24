#!/usr/bin/env node

const blessed  = require("blessed")
const XTerm    = require("blessed-xterm")

const screen = blessed.screen({
    title:       "sample",
    smartCSR:    true,
    autoPadding: false,
    warnings:    false
});

let focused = 0;

const dashboard = blessed.box({
    border: "line",
    left: 0,
    top: 0,
    width: Math.floor(screen.width / 4),
    height: screen.height,
    style: {
        fg: "default",
        bg: "default",
        border: { fg: "default" },
        focus: { border: { fg: "green" } },
        scrolling: { border: { fg: "red" } }
    },
});

const terminal = [];

terminal.push(new XTerm({
    shell: "sleep",
    args: [ 10 ],
    env: process.env,
    cwd: process.cwd(),
    cursorType: "block",
    border: "line",
    scrollback: 1000,
    style: {
        fg: "default",
        bg: "default",
        border: { fg: "default" },
        focus: { border: { fg: "cyan" } },
        scrolling: { border: { fg: "red" } }
    },
    left: Math.floor(screen.width / 4),
    top: 0,
    width: Math.floor(screen.width / 4) * 3,
    height: screen.height,
    label: "A place to run our targets..."
}));

let hint = "\r\nPress CTRL+q to quit.\r\n" +
    "Press C-n to switch between terminals.\r\n\r\n";

dashboard.setContent("welcome...");

terminal[focused].focus();

terminal.forEach(term => {
    term.write(hint);
    term.key("pagedown", () => {
        if (!term.scrolling) term.scroll(0);
        let n = Math.max(1, Math.floor(term.height * 0.10));
        term.scroll(+n);
        if (Math.ceil(term.getScrollPerc()) === 100) term.resetScroll();
    });

    term.key("pageup", () => {
        if (!term.scrolling)
            term.scroll(0)
        let n = Math.max(1, Math.floor(term.height * 0.10));
        term.scroll(-n);
        if (Math.ceil(term.getScrollPerc()) === 100) term.resetScroll();
    });
});

const terminate = () => {
    screen.destroy();
    process.exit(0);
};

screen.key([ "C-n" ], (ch, key) => {
    if (focused < terminal.length) focused += 1;
    if (focused == terminal.length) focused = 0;
});

screen.key([ "C-q" ], (ch, key) => {
    terminate();
});

screen.append(dashboard);
terminal.forEach((term) => {
    screen.append(term);
});
screen.render();

let terminated = 0;

terminal.forEach((term) => {
    term.on("exit", () => {
        terminated++;
        if (terminated === terminal.length) terminate();
    });
});
