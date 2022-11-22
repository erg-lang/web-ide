import * as monaco from "monaco-editor";
import * as wasm from "erg-playground";

export function dir(
	playground: wasm.Playground,
	range: monaco.IRange,
): monaco.languages.CompletionItem[] {
	let vars: wasm.ErgVarEntry[] = playground.dir();
	return vars.map((ent) => {
		return {
			label: ent.name(),
			kind: ent.item_kind(),
			insertText: ent.name(),
			range: range,
		};
	});
}

export function suggest(
	playground: wasm.Playground,
	model: monaco.editor.ITextModel,
	position: monaco.IPosition,
) {
	playground.check(model.getValue());
	var word = model.getWordUntilPosition(position);
	var range = {
		startLineNumber: position.lineNumber,
		endLineNumber: position.lineNumber,
		startColumn: word.startColumn,
		endColumn: word.endColumn,
	};
	let suggestions = dir(playground, range);
	return { suggestions };
}
