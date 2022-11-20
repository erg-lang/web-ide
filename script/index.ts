import * as monaco from 'monaco-editor';
import * as wasm from "erg-playground";

import './index.css';
import { erg_syntax_def } from './syntax';
import { escape_ansi } from './escape';
import { validate } from './check';
// import { escape_ansi } from './escape';

const WAIT_FOR = 50;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function get_init_code() {
    var value = 'print! "Hello, world!"';
    // load code from local storage (if exists)
    let cached = localStorage.getItem("saved_code");
    if (cached != null) {
        value = cached;
    }
    // load code from URL (if specified)
    let query = window.location.search.slice(1); // ?code=
    query.split('&').forEach(function (part) {
        var item = part.split('=');
        if (item[0] === 'code') {
            value = decodeURIComponent(item[1]);
        }
    });
    return value;
}

monaco.languages.register({ id: 'erg' });
monaco.languages.setMonarchTokensProvider('erg', erg_syntax_def);

// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

class PyCodeArea {
    display: monaco.editor.IStandaloneCodeEditor;
    area: HTMLElement;
    close_btn: HTMLButtonElement;

    constructor(code_area: HTMLDivElement) {
        this.area = document.createElement('div');
        this.area.id = 'py-code-area';
        this.area.className = 'notification';
        this.area.hidden = true;
        code_area.appendChild(this.area);
        let py_code_message = document.createElement('div');
        py_code_message.className = 'message-header';
        py_code_message.innerHTML = 'Transpiled Python code';
        this.area.appendChild(py_code_message);
        const py_uri = monaco.Uri.parse('inmemory://playground.py');
        const py_model = monaco.editor.createModel("", 'erg', py_uri);
        let py_code_editor = document.createElement('div');
        py_code_editor.id = 'py-code-editor';
        py_code_editor.className = 'block';
        this.area.appendChild(py_code_editor);
        this.display = monaco.editor.create(document.getElementById("py-code-editor"), {
            language: 'erg',
            theme: 'vs-dark',
            model: py_model,
            readOnly: true,
            scrollbar: {
                handleMouseWheel: false,
            },
        });
        this.close_btn = document.createElement('button');
        this.close_btn.className = 'delete';
        this.area.appendChild(this.close_btn);
    }
}

class Playground {
    editor: monaco.editor.IStandaloneCodeEditor;
    py_code_area: PyCodeArea;
    output: HTMLDivElement;
    run_btn: HTMLButtonElement;
    transpile_btn: HTMLButtonElement;
    share_btn: HTMLButtonElement;

    dump(this, data: string) {
        this.output.innerHTML += escape_ansi(data);
    };
    render_py_code(this, code: string) {
        this.py_code_area.area.hidden = false;
        this.py_code_area.display.setValue(code);
        this.py_code_area.display.layout();
    };
    clear(this) {
        this.output.innerHTML = "";
    };
    handle_result(this, result: string, code: string) {
        if (result.startsWith("<<CompileError>>")) {
            result = result.replace("<<CompileError>>", "");
            // TODO: multiline error messages
            result = result.replace("1 | ", `1 | ${code}`);
            this.dump(result);
        } else if (result.startsWith("<<RuntimeError>>")) {
            result = result.replace("<<RuntimeError>>", "");
            this.dump("runtime error caused:\n");
            this.dump(result);
        } else if (result.length > 0) {
            this.dump(result);
        }
    }
    close_py_code_area(this, _event) {
        this.py_code_area.area.hidden = true;
    }

    async run(this, _event) {
        this.run_btn.className = 'button is-primary is-medium is-loading';
        await sleep(WAIT_FOR);
        this.clear();
        var playground = wasm.Playground.new();
        let code = this.editor.getValue();
        let _this = this;
        playground.set_stdout(function(data) {
            _this.dump(data);
        });
        let result = playground.exec(code);
        this.handle_result(result, code);
        localStorage.setItem("saved_code", code);
        this.run_btn.className = 'button is-primary is-medium';
    };

    async transpile(this, _event) {
        this.transpile_btn.className = 'button is-warning is-light is-loading';
        await sleep(WAIT_FOR);
        this.clear();
        var playground = wasm.Playground.new();
        let code = this.editor.getValue();
        let _this = this;
        playground.set_stdout(function(data) {
            _this.dump(data);
        });
        let opt_code = playground.transpile(code);
        if (opt_code != null) {
            this.render_py_code(opt_code);
            localStorage.setItem("saved_code", code);
        }
        this.transpile_btn.className = 'button is-warning is-light';
    };

    async share_url(this, _event) {
        this.share_btn.className = 'button is-link is-light is-loading';
        // await sleep(WAIT_FOR);
        let code = this.editor.getValue();
        let url = `https://erg-lang.org/web-ide/?code=${encodeURIComponent(code)}`;
        this.clear();
        this.dump(url);
        localStorage.setItem("saved_code", code);
        this.share_btn.className = 'button is-link is-light';
    };

    constructor() {
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
        note.innerHTML = 'Web-REPL is here: <a href="https://erg-lang.org/web-repl/">https://erg-lang.org/web-repl</a>';
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

        this.py_code_area = new PyCodeArea(code_area);

        let init_code = get_init_code();
        const uri = monaco.Uri.parse('inmemory://playground.er');
        const model = monaco.editor.createModel(init_code, 'erg', uri);
        this.editor = monaco.editor.create(document.getElementById("editor"), {
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

        this.run_btn = document.createElement('button');
        this.run_btn.id = 'run-button';
        this.run_btn.className = 'button is-primary is-medium';
        this.run_btn.innerHTML = 'Run';
        palette.appendChild(this.run_btn);

        this.transpile_btn = document.createElement('button');
        this.transpile_btn.id = 'transpile-button';
        this.transpile_btn.className = 'button is-warning is-light';
        this.transpile_btn.innerHTML = 'Transpile';
        palette.appendChild(this.transpile_btn);

        this.share_btn = document.createElement('button');
        this.share_btn.id = 'share-button';
        this.share_btn.className = 'button is-link is-light';
        this.share_btn.innerHTML = 'Share';
        palette.appendChild(this.share_btn);

        var output_area = document.createElement('div');
        output_area.className = 'block container';
        document.body.appendChild(output_area);
        this.output = document.createElement('div');
        this.output.id = 'result';
        this.output.className = 'box content textarea block';
        output_area.appendChild(this.output);

        var footer = document.createElement('div');
        footer.className = 'box';
        document.body.appendChild(footer);

        let _this = this;
        this.run_btn.addEventListener('click', function(_event) {
            _this.run(_event)
        });
        this.transpile_btn.addEventListener('click', function(_event) {
            _this.transpile(_event)
        });
        this.share_btn.addEventListener('click', function(_event) {
            _this.share_url(_event)
        });
        this.py_code_area.close_btn.onclick = function (_event) {
            _this.close_py_code_area(_event);
        };
    }
}

const _playground = new Playground();
