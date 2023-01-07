import * as monaco from "monaco-editor";

export async function hover(
	model: monaco.editor.ITextModel,
	position: monaco.IPosition,
) {
    return { contents: [] };
}
