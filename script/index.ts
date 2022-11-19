import * as monaco from 'monaco-editor';
import * as wasm from "erg-playground";

import './index.css';

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
hero.className = 'hero is-small is-info';
document.body.appendChild(hero);
var hero_body = document.createElement('div');
hero_body.className = 'hero-body';
hero.appendChild(hero_body);
var title = document.createElement('p');
title.className = 'subtitle';
title.innerHTML = 'Erg Playground';
hero_body.appendChild(title);

var edt = document.createElement('div');
edt.id = 'editor';
document.body.appendChild(edt);

var editor = monaco.editor.create(document.getElementById("editor"), {
	value: 'print! "Hello, world!"',
	language: 'python',
    theme: 'vs-dark',
});

var res = document.createElement('textarea');
res.id = 'result';
res.className = 'textarea';
res.readOnly = true;
document.body.appendChild(res);

const dump = function (data: string) {
    res.innerHTML += data;
};
const clear = function () {
    res.innerHTML = "";
};

var btn = document.createElement('button');
btn.id = 'run-button';
btn.className = 'button is-primary is-small';
btn.innerHTML = 'Run';

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
    btn.className = 'button is-primary is-small is-loading';
    await sleep(1);
    clear();
    var playground = wasm.Playground.new();
    let code = editor.getValue();
    playground.set_stdout(dump);
    let result = playground.exec(code);
    handle_result(result, code);
    btn.className = 'button is-primary is-small';
};

btn.addEventListener('click', run);
document.body.appendChild(btn);
