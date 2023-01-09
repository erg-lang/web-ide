import * as monaco from "monaco-editor";
import * as wasm from "erg-playground";

var completer = wasm.Playground.new(); // ~9ms
// To keep the load down. If the inspection has already been turned around, it will be finished.
var suggest_on_running = false;

export function dir(range: monaco.IRange): monaco.languages.CompletionItem[] {
	let vars: wasm.ErgVarEntry[] = completer.dir();
	return vars.map((ent) => {
		return {
			label: ent.name(),
			kind: ent.item_kind(),
			insertText: ent.name(),
			range: range,
		};
	});
}

export async function suggest(
	model: monaco.editor.ITextModel,
	position: monaco.IPosition,
) {
	if (suggest_on_running) {
		return { suggestions: [] };
	} else {
		suggest_on_running = true;
	}
	try {
		completer.check(model.getValue());
	} catch (_e) {
		completer = wasm.Playground.new();
	}
	const word = model.getWordUntilPosition(position);
	const range = {
		startLineNumber: position.lineNumber,
		endLineNumber: position.lineNumber,
		startColumn: word.startColumn,
		endColumn: word.endColumn,
	};
	let suggestions = dir(range);
	completer.clear();
	suggest_on_running = false;
	return { suggestions };
}
