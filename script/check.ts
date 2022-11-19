import * as monaco from 'monaco-editor';
import * as wasm from 'erg-playground';
import { remove_ansi } from './escape';

export function validate(model: monaco.editor.ITextModel) {
    let playground = wasm.Playground.new();
    let code = model.getValue();
    let errors: wasm.ErgError[] = playground.check(code);
    var markers = [];
    errors.forEach(err => {
        console.log(err.desc);
        markers.push({
            message: remove_ansi(err.desc),
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: err.loc.ln_begin(),
            startColumn: err.loc.col_begin() + 1,
            endLineNumber: err.loc.ln_end(),
            endColumn: err.loc.col_end() + 1
        });
    });
    monaco.editor.setModelMarkers(model, 'owner', markers);
}
