import * as monaco from "monaco-editor";

export const erg_syntax_def: monaco.languages.IMonarchLanguage = {
	// Set defaultToken to invalid to see what you do not tokenize yet
	// defaultToken: 'invalid',

	// actually not keywords
	// rome-ignore format: don't want to take up too much vertical width
	keywords: [
		"for", "match", "assert", "do",
		"if", "return", "Class", "Trait", "self", "while",
		"True", "False", "None"
	],

	typeKeywords: ["Int", "Bool", "Bytes", "Str", "NoneType", "Float"],

	// rome-ignore format: don't want to take up too much vertical width
	operators: [
		"=", ">", "<", "!", "~", "?", ":", "==", "<=", ">=", "!=",
		"&&", "||", "++", "--", "+", "-", "*", "/", "&", "|", "^", "%",
		"<<", ">>", ">>>", "+=", "-=", "*=", "/=", "&=", "|=", "^=",
		"%=", "<<=", ">>=", ">>>="
	],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,

	// C# style strings
	escapes:
		/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// identifiers and keywords
			[
				/[a-z_$][\w$]*/,
				{
					cases: {
						"@typeKeywords": "keyword",
						"@keywords": "keyword",
						"@default": "identifier",
					},
				},
			],
			[/[A-Z][\w\$]*/, "type.identifier"], // to show class names nicely

			// whitespace
			{ include: "@whitespace" },

			// delimiters and operators
			[/[{}()\[\]]/, "@brackets"],
			[/[<>](?!@symbols)/, "@brackets"],
			[/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],

			// @ annotations.
			// As an example, we emit a debugging log message on these tokens.
			// Note: message are supressed during the first load -- change some lines to see them.
			[
				/@\s*[a-zA-Z_\$][\w\$]*/,
				{ token: "annotation", log: "annotation token: $0" },
			],

			// numbers
			[/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
			[/0[xX][0-9a-fA-F]+/, "number.hex"],
			[/\d+/, "number"],

			// delimiter: after number because of .\d floats
			[/[;,.]/, "delimiter"],

			// strings
			[/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
			[/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

			// characters
			[/'[^\\']'/, "string"],
			[/(')(@escapes)(')/, ["string", "string.escape", "string"]],
			[/'/, "string.invalid"],
		],

		comment: [
			[/[^\#*]+/, "comment"],
			[/\#\[/, "comment", "@push"], // nested comment
			["\\*]#", "comment", "@pop"], // `]#` will not work, a bug?
			[/[\#*]/, "comment"],
		],

		string: [
			[/[^\\"]+/, "string"],
			[/@escapes/, "string.escape"],
			[/\\./, "string.escape.invalid"],
			[/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
		],

		whitespace: [
			[/[ \t\r\n]+/, "white"],
			[/\#\[/, "comment", "@comment"],
			[/\#.*$/, "comment"],
		],
	},
};
