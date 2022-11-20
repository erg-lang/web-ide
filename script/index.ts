import * as monaco from 'monaco-editor';
import * as wasm from "erg-playground";

import './index.css';
import { erg_syntax_def } from './syntax';
import { escape_ansi } from './escape';
import { validate } from './check';
// import { escape_ansi } from './escape';

monaco.languages.register({ id: 'erg' });
monaco.languages.setMonarchTokensProvider('erg', erg_syntax_def);

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

var hero = document.createElement('section');
hero.id = 'hero';
hero.className = 'hero block is-info';
document.body.appendChild(hero);
var hero_body = document.createElement('div');
hero_body.className = 'hero-body';
hero.appendChild(hero_body);
var title = document.createElement('p');
title.className = 'title';
title.innerHTML = 'Erg Playground';
hero_body.appendChild(title);
var note = document.createElement('div');
note.className = 'notification is-small has-text-grey-dark';
note.innerHTML = 'Web-REPL is here: <a href="https://erg-lang.org/erg-playground/">https://erg-lang.org/erg-playground</a>';
hero_body.appendChild(note);
var close_btn = document.createElement('button');
close_btn.className = 'delete';
close_btn.onclick = function (_event) {
    hero_body.removeChild(note);
};
note.appendChild(close_btn);

var code_area = document.createElement('div');
code_area.className = 'container block';
document.body.appendChild(code_area);

var editor_area = document.createElement('div');
editor_area.id = 'editor';
editor_area.className = 'block';
code_area.appendChild(editor_area);

let py_code_area = document.createElement('div');
py_code_area.id = 'py-code-area';
py_code_area.className = 'notification';
py_code_area.hidden = true;
code_area.appendChild(py_code_area);
let py_code_message = document.createElement('div');
py_code_message.className = 'message-header';
py_code_message.innerHTML = 'Transpiled Python code';
py_code_area.appendChild(py_code_message);
const py_uri = monaco.Uri.parse('inmemory://playground.py');
const py_model = monaco.editor.createModel("", 'erg', py_uri);
let py_code_editor = document.createElement('div');
py_code_editor.id = 'py-code-editor';
py_code_editor.className = 'block';
py_code_area.appendChild(py_code_editor);
var py_code_display = monaco.editor.create(document.getElementById("py-code-editor"), {
    language: 'erg',
    theme: 'vs-dark',
    model: py_model,
    readOnly: true,
    scrollbar: {
        handleMouseWheel: false,
    },
});
var close_btn = document.createElement('button');
close_btn.className = 'delete';
close_btn.onclick = function (_event) {
    py_code_area.hidden = true;
};
py_code_area.appendChild(close_btn);

var value = 'print! "Hello, world!"';
let query = window.location.search.slice(1); // ?code=
query.split('&').forEach(function (part) {
    var item = part.split('=');
    if (item[0] === 'code') {
        value = decodeURIComponent(item[1]);
    }
});
// load code from local storage (if exists)
let cached = localStorage.getItem("saved_code");
if (cached != null) {
    value = cached;
}
const uri = monaco.Uri.parse('inmemory://playground.er');
const model = monaco.editor.createModel(value, 'erg', uri);
var editor = monaco.editor.create(document.getElementById("editor"), {
	language: 'erg',
    theme: 'vs-dark',
    model: model,
    scrollbar: {
        handleMouseWheel: false,
    },
});
model.onDidChangeContent(() => {
	validate(model);
});

let palette_area = document.createElement('div');
palette_area.className = 'container block';
document.body.appendChild(palette_area);
var palette = document.createElement('div');
palette.className = 'buttons block';
palette_area.appendChild(palette);

var run_btn = document.createElement('button');
run_btn.id = 'run-button';
run_btn.className = 'button is-primary is-medium';
run_btn.innerHTML = 'Run';
palette.appendChild(run_btn);

var transpile_btn = document.createElement('button');
transpile_btn.id = 'transpile-button';
transpile_btn.className = 'button is-warning is-light';
transpile_btn.innerHTML = 'Transpile';
palette.appendChild(transpile_btn);

var share_btn = document.createElement('button');
share_btn.id = 'share-button';
share_btn.className = 'button is-link is-light';
share_btn.innerHTML = 'Share';
palette.appendChild(share_btn);

var res_area = document.createElement('div');
res_area.className = 'block container';
document.body.appendChild(res_area);
var res = document.createElement('div');
res.id = 'result';
res.className = 'box content textarea block';
// res.readOnly = true;
res_area.appendChild(res);

var footer = document.createElement('div');
footer.className = 'box';
document.body.appendChild(footer);

const dump = function (data: string) {
    res.innerHTML += escape_ansi(data);
};
const render_py_code = function (code: string) {
    py_code_area.hidden = false;
    py_code_display.setValue(code);
    py_code_display.layout();
};
const clear = function () {
    res.innerHTML = "";
};

const handle_result = function(result: string, code: string) {
    if (result.startsWith("<<CompileError>>")) {
        result = result.replace("<<CompileError>>", "");
        // TODO: multiline error messages
        result = result.replace("1 | ", `1 | ${code}`);
        dump(result);
    } else if (result.startsWith("<<RuntimeError>>")) {
        result = result.replace("<<RuntimeError>>", "");
        dump("runtime error caused:\n");
        dump(result);
    } else if (result.length > 0) {
        dump(result);
    }
}

const run = async function (_event) {
    run_btn.className = 'button is-primary is-medium is-loading';
    await sleep(1);
    clear();
    var playground = wasm.Playground.new();
    let code = editor.getValue();
    playground.set_stdout(dump);
    let result = playground.exec(code);
    handle_result(result, code);
    localStorage.setItem("saved_code", code);
    run_btn.className = 'button is-primary is-medium';
};

const transpile = async function (_event) {
    transpile_btn.className = 'button is-warning is-light is-loading';
    await sleep(1);
    clear();
    var playground = wasm.Playground.new();
    let code = editor.getValue();
    playground.set_stdout(dump);
    let opt_code = playground.transpile(code);
    if (opt_code != null) {
        render_py_code(opt_code);
        localStorage.setItem("saved_code", code);
    }
    transpile_btn.className = 'button is-warning is-light';
};

const share_url = async function (_event) {
    share_btn.className = 'button is-link is-light is-loading';
    await sleep(1);
    let code = editor.getValue();
    let url = `https://erg-lang.org/web-ide/?code=${encodeURIComponent(code)}`;
    clear();
    dump(url);
    localStorage.setItem("saved_code", code);
    share_btn.className = 'button is-link is-light';
};

run_btn.addEventListener('click', run);
transpile_btn.addEventListener('click', transpile);
share_btn.addEventListener('click', share_url);
