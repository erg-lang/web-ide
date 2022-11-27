import * as monaco from "monaco-editor";
import * as wasm from "erg-playground";
import { remove_ansi } from "./escape";

var validator = wasm.Playground.new(); // ~9ms
// To keep the load down. If the inspection has already been turned around, it will be finished.
var validate_on_running = false;

export async function validate(model: monaco.editor.ITextModel) {
	if (validate_on_running) {
		return;
	} else {
		validate_on_running = true;
	}
	let code = model.getValue();
	let errors: wasm.ErgError[];
	try {
		errors = validator.check(code);
		validator.clear();
	} catch (_e) {
		errors = [];
		validator = wasm.Playground.new();
	}
	const markers: monaco.editor.IMarkerData[] = [];
	errors.forEach((err) => {
		console.log(err.desc);
		markers.push({
			message: remove_ansi(err.desc),
			severity: monaco.MarkerSeverity.Error,
			startLineNumber: err.loc.ln_begin() ?? 0,
			startColumn: (err.loc.col_begin() ?? 0) + 1,
			endLineNumber: err.loc.ln_end() ?? 0,
			endColumn: (err.loc.col_end() ?? 0) + 1,
		});
	});
	monaco.editor.setModelMarkers(model, "owner", markers);
	validate_on_running = false;
}
