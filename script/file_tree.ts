import { Application } from "./index";
import * as monaco from "monaco-editor";

export class FileTree {
	app: Application;
	current_file: string;
	tree_area: HTMLDivElement;
	tree: HTMLElement;
	file_count: number;

	load_files(this: this) {
		for (let i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i);
			if (key === null || key.startsWith(".config")) {
				continue;
			}
			this.create_tree_entry(key);
		}
		if (this.tree.children.length === 0) {
			this.create_file("playground.er");
		}
		let main_file = this.tree.children.namedItem(
			"playground-file-playground-er",
		);
		if (main_file != null && this.tree.children.length > 1) {
			this.tree.removeChild(main_file);
			this.tree.insertBefore(main_file, this.tree.firstChild);
		}
	}

	remove_file(this: this, filename: string) {
		let file = this.get_file_node(filename);
		if (file != null) {
			this.tree.removeChild(file);
			localStorage.removeItem(filename);
		} else {
			console.log(`Could not find file: ${filename}`);
		}
		// load first child file
		if (this.tree.children.length > 0) {
			const firstKey = localStorage.key(0);
			if (firstKey === null) {
				return;
			}
			const code = localStorage.getItem(firstKey) ?? "";
			this.set_current(firstKey);
			this.app.editor.setValue(code);
		}
	}

	rename_file(this: this, old_name: string, new_name: string) {
		if (this.get_file_node(new_name) != null) {
			alert("File with same name already exists");
			return;
		}
		let file = this.get_file_node(old_name);
		if (file != null) {
			file.lastChild!.textContent = new_name;
			file.id = `playground-file-${new_name.replace(".", "-")}`;
			localStorage.setItem(new_name, localStorage.getItem(old_name) ?? "");
			localStorage.removeItem(old_name);
		} else {
			console.log(`Could not find file: ${old_name}`);
		}
	}

	create_file(this: this, filename: string, content?: string) {
		localStorage.setItem(filename, content ?? "");
		this.create_tree_entry(filename);
	}

	create_file_if_not_exist(
		this: this,
		filename: string,
		content?: string,
		override: boolean = false,
	) {
		const file_not_exist = localStorage.getItem(filename) == null;
		if (override || file_not_exist) {
			localStorage.setItem(filename, content ?? "");
		}
		if (file_not_exist) {
			this.create_tree_entry(filename);
		}
	}

	save_code(this: this) {
		localStorage.setItem(this.current_file, this.app.editor.getValue());
	}

	get_file_node(this: this, filename: string): HTMLAnchorElement | null {
		let id = `playground-file-${filename.replace(".", "-")}`;
		return this.tree.children.namedItem(id) as HTMLAnchorElement | null;
	}

	set_current(this: this, filename: string) {
		let new_current = this.get_file_node(filename);
		if (new_current == null) {
			return;
		}
		let old_file = this.get_file_node(this.current_file);
		if (old_file != null) {
			old_file.classList.remove("is-active");
			old_file.classList.remove("dropdown");
		}
		this.current_file = filename;
		new_current.classList.add("is-active");
	}

	set_current_and_load(this: this, filename: string) {
		this.set_current(filename);
		const lang = filename.endsWith(".er") ? "erg" : "plaintext";
		monaco.editor.setModelLanguage(this.app.editor.getModel()!, lang);
		this.app.editor.setValue(localStorage.getItem(filename) ?? "");
	}

	gen_dropdown(this: this, file: HTMLAnchorElement) {
		let dropdown_menu = document.createElement("div");
		dropdown_menu.className = "dropdown-menu";
		dropdown_menu.ariaRoleDescription = "menu";
		let dropdown_content = document.createElement("div");
		dropdown_content.className = "dropdown-content";
		let remove_btn = document.createElement("a");
		remove_btn.className = "dropdown-item";
		remove_btn.innerHTML = "Remove";
		remove_btn.onclick = (_event) => {
			this.remove_file(file.lastChild!.textContent!);
			_event.stopPropagation();
		};
		dropdown_content.appendChild(remove_btn);
		let rename_btn = document.createElement("a");
		rename_btn.className = "dropdown-item";
		rename_btn.innerHTML = "Rename";
		rename_btn.onclick = (_event) => {
			let new_name = prompt("Enter new name", file.lastChild!.textContent!);
			if (new_name == null) {
				_event.stopPropagation();
				return;
			}
			this.save_code();
			this.rename_file(file.lastChild!.textContent!, new_name);
			this.set_current_and_load(new_name);
			_event.stopPropagation();
		};
		dropdown_content.appendChild(rename_btn);
		dropdown_menu.appendChild(dropdown_content);
		return dropdown_menu;
	}

	create_tree_entry(this: this, filename: string) {
		let file = document.createElement("a");
		file.className = "panel-block tree-entry";
		file.id = `playground-file-${filename.replace(".", "-")}`;
		let file_icon = document.createElement("span");
		file_icon.className = "panel-icon";
		file_icon.innerHTML = '<i class="fas fa-file" aria-hidden="true"></i>';
		file.appendChild(file_icon);
		file.appendChild(this.gen_dropdown(file));
		file.oncontextmenu = (_event) => {
			file.classList.add("dropdown");
			file.classList.add("is-active");
			return false;
		};
		file.onclick = (_event) => {
			if (_event.button === 0) {
				this.save_code();
				this.set_current_and_load(file.lastChild!.textContent!);
			}
		};
		file.appendChild(document.createTextNode(filename));
		if (this.tree.childNodes.length > 0) {
			let add_file_btn = this.tree.removeChild(this.tree.lastChild!);
			this.tree.appendChild(file);
			this.tree.appendChild(add_file_btn);
		} else {
			this.tree.appendChild(file);
		}
	}

	constructor(app: Application) {
		this.app = app;
		this.current_file = "playground.er";
		this.tree_area = document.createElement("div");
		this.tree_area.className = "column container is-one-fifth";
		this.file_count = 1;
		this.tree = document.createElement("nav");
		this.tree.className = "panel";
		this.tree.id = "file-tree";
		this.load_files();
		this.set_current("playground.er");
		let create_file_btn_area = document.createElement("a");
		create_file_btn_area.className = "panel-block";
		let add_file_btn = document.createElement("button");
		add_file_btn.className = "button is-link is-outlined is-small is-fullwidth";
		add_file_btn.innerHTML = "Create a File";
		add_file_btn.onclick = (_event) => {
			let file = `file${this.file_count}.er`;
			while (localStorage.getItem(file) != null) {
				this.file_count += 1;
				file = `file${this.file_count}.er`;
			}
			this.create_file(file);
			this.file_count++;
		};
		create_file_btn_area.appendChild(add_file_btn);
		this.tree.appendChild(create_file_btn_area);
		this.tree_area.appendChild(this.tree);
	}
}
