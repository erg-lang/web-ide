import { Application } from "./index";

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
		let main_file = this.tree.children.namedItem("playground-file-playground");
		if (main_file != null && this.tree.children.length > 1) {
			this.tree.removeChild(main_file);
			this.tree.insertBefore(main_file, this.tree.firstChild);
		}
	}

	remove_file(this: this, filename: string) {
		let id = `playground-file-${filename.split(".")[0]}`;
		let file = this.tree.children.namedItem(id);
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
			let firstItem = localStorage.getItem(firstKey);
			if (firstItem === null) {
				return;
			}
			this.app.editor.setValue(firstItem);
			this.set_current(firstKey);
		}
	}

	create_file(this: this, filename: string, content?: string) {
		localStorage.setItem(filename, content ?? "");
		this.create_tree_entry(filename);
	}

	create_file_if_not_exist(this: this, filename: string, content?: string, override: boolean = false) {
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

	set_current(this: this, filename: string) {
		let new_id = `playground-file-${filename.split(".")[0]}`;
		let new_current = this.tree.children.namedItem(new_id);
		if (new_current == null) {
			return;
		}
		let id = `playground-file-${this.current_file.split(".")[0]}`;
		let current_file = this.tree.children.namedItem(id);
		if (current_file != null) {
			current_file.classList.remove("is-active");
		}
		this.current_file = filename;
		new_current.classList.add("is-active");
	}

	gen_dropdown(filename: string) {
		let dropdown_menu = document.createElement("div");
		dropdown_menu.className = "dropdown-menu";
		dropdown_menu.ariaRoleDescription = "menu";
		let dropdown_content = document.createElement("div");
		dropdown_content.className = "dropdown-content";
		let remove_btn = document.createElement("a");
		remove_btn.className = "dropdown-item";
		remove_btn.innerHTML = "Remove";
		remove_btn.onclick = (_event) => {
			this.remove_file(filename);
		};
		dropdown_content.appendChild(remove_btn);
		dropdown_menu.appendChild(dropdown_content);
		return dropdown_menu;
	}

	create_tree_entry(this: this, filename: string) {
		let file = document.createElement("a");
		file.className = "panel-block tree-entry";
		file.id = `playground-file-${filename.split(".")[0]}`;
		let file_icon = document.createElement("span");
		file_icon.className = "panel-icon";
		file_icon.innerHTML = '<i class="fas fa-file" aria-hidden="true"></i>';
		file.appendChild(file_icon);
		file.appendChild(this.gen_dropdown(filename));
		file.oncontextmenu = (_event) => {
			file.classList.add("dropdown");
			file.classList.add("is-active");
			return false;
		};
		file.onclick = (_event) => {
			if (_event.button === 0) {
				this.save_code();
				this.set_current(filename);
				this.app.editor.setValue(localStorage.getItem(filename) ?? "");
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
