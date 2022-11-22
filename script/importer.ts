function transpile_import(code: string, mod_name: string, mod_ident: string) {
	return `from types import ModuleType as ModuleType__; c__ = compile("""${code}""", mod_name, 'exec'); ${mod_ident} = ModuleType__("${mod_name}"); exec(c__, ${mod_ident}.__dict__); sys.modules["${mod_name}"] = ${mod_ident};`;
}

export function replace_import(code: string) {
	const replacer = function (
		match: string,
		mod_ident: string,
		mod_name: string,
	) {
		let code = localStorage.getItem(mod_name + ".er");
		if (code != null) {
			return transpile_import(code, mod_name, mod_ident);
		} else {
			return match;
		}
	};
	return code
		.replace(/(.*)= import "(.*)"/g, replacer)
		.replace(/(.*)= import\("(.*)"\)/g, replacer);
}
