import * as monaco from 'monaco-editor';
import * as wasm from "erg-playground";

import './index.css';

// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

var title = document.createElement('h2');
title.id = 'title';
title.innerHTML = 'Erg Playground';
document.body.appendChild(title);

var edt = document.createElement('div');
edt.id = 'editor';
document.body.appendChild(edt);

var editor = monaco.editor.create(document.getElementById("editor"), {
	value: 'print! "Hello, world!"',
	language: 'python',
    theme: 'vs-dark',
});

var res = document.createElement('div');
res.id = 'result';
document.body.appendChild(res);

const dump = function (data) {
    res.innerHTML += data;
};
const clear = function () {
    res.innerHTML = "";
};

const run = function (_event) {
    clear();
    dump("Executing ...<br>");
    var playground = wasm.Playground.new();
    let code = editor.getValue();
    playground.set_stdout(dump);
    let result = playground.exec(code);
    if (result.startsWith("<<CompileError>>")) {
        result = result.replace("<<CompileError>>", "");
        // TODO: multiline error messages
        result = result.replace("1 | ", `1 | ${code}`);
        dump(result);
    } else if (result.startsWith("<<RuntimeError>>")) {
        let codes = result.replace("<<RuntimeError>>", "").split("\n");
        result = codes.join("<br>");
        dump("runtime error caused:<br>");
        dump(result);
    } else if (result.length > 0) {
        dump(result);
    }
};

var btn = document.createElement('button');
btn.id = 'run-button';
btn.innerHTML = 'Run';
btn.addEventListener('click', run);
document.body.appendChild(btn);
