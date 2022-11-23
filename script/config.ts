import { Playground, sleep } from "./index";
import { validate } from "./check";
import * as wasm from "erg-playground";

export function set_dark(playground: Playground) {
	playground.editor.updateOptions({
		theme: "vs-dark",
	});
	document.body.classList.add("has-background-dark");
	document.getElementById("hero")!.classList.add("has-background-black-ter");
	document.getElementById("result")!.classList.add("has-text-light");
	document.getElementById("result")!.classList.add("has-background-black-ter");
	document.getElementById("foot")!.classList.add("has-background-dark");
	// document.getElementById("run-button")!.classList.remove("is-primary");
	// document.getElementById("run-button")!.classList.add("has-background-danger-dark");
	document.getElementById("transpile-button")!.classList.remove("is-warning");
	document.getElementById("share-button")!.classList.remove("is-link");
	document
		.getElementById("config-button")!
		.classList.add("has-background-grey");
	document
		.getElementById("file-tree")!
		.classList.add("has-background-black-ter");
	let css = document.createElement("style");
	css.id = "dark-css";
	css.appendChild(document.createTextNode(`
.tree-entry {
	color: #dbdbdb!important;
}
.tree-entry:hover {
	background-color: #343434;
}
.tree-entry:not(:last-child) {
    border-bottom: 1px solid #343434;
}
`));
	document.body.appendChild(css);
}

export function set_light(playground: Playground) {
	playground.editor.updateOptions({
		theme: "vs",
	});
	document.body.classList.remove("has-background-dark");
	document.getElementById("hero")!.classList.remove("has-background-black-ter");
	document.getElementById("result")!.classList.remove("has-text-light");
	document
		.getElementById("result")!
		.classList.remove("has-background-black-ter");
	document.getElementById("foot")!.classList.remove("has-background-dark");
	// document.getElementById("run-button")!.classList.add("is-primary");
	// document.getElementById("run-button")!.classList.remove("has-background-danger-dark");
	document.getElementById("transpile-button")!.classList.add("is-warning");
	document.getElementById("share-button")!.classList.add("is-link");
	document
		.getElementById("config-button")!
		.classList.remove("has-background-grey");
	document
		.getElementById("file-tree")!
		.classList.remove("has-background-black-ter");
	let dark_css = document.getElementById("dark-css");
	if (dark_css != null) { document.body.removeChild(dark_css); }
}

export class ConfigModal {
	config_btn: HTMLButtonElement;

	add_modal_header(menu: HTMLElement, modal: HTMLDivElement) {
		const menu_heading = document.createElement("header");
		menu_heading.className = "modal-card-head";
		menu.appendChild(menu_heading);
		const menu_title = document.createElement("p");
		menu_title.className = "modal-card-title";
		menu_title.innerHTML = "Configuration";
		menu_heading.appendChild(menu_title);
		const close_btn = document.createElement("button");
		close_btn.className = "delete";
		close_btn.ariaLabel = "close";
		close_btn.addEventListener("click", function () {
			modal.classList.remove("is-active");
		});
		menu_heading.appendChild(close_btn);
		menu.appendChild(menu_heading);
	}

	add_complete_menu(section: HTMLElement, playground: Playground) {
		const completion = document.createElement("div");
		completion.className = "panel-block columns config-item";
		const label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Completion";
		completion.appendChild(label);
		const toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		const on_btn = document.createElement("button");
		on_btn.className = "button is-small is-success is-selected";
		on_btn.innerHTML = "On";
		on_btn.onclick = function (_event) {
			playground.editor.updateOptions({ quickSuggestions: true });
			on_btn.className = "button is-small is-success is-selected";
			off_btn.className = "button is-small";
		};
		const off_btn = document.createElement("button");
		off_btn.className = "button is-small";
		off_btn.innerHTML = "Off";
		off_btn.onclick = function (_event) {
			playground.editor.updateOptions({ quickSuggestions: false });
			off_btn.className = "button is-small is-danger is-selected";
			on_btn.className = "button is-small";
		};
		toggle_btn.appendChild(on_btn);
		toggle_btn.appendChild(off_btn);
		completion.appendChild(toggle_btn);
		section.appendChild(completion);
	}

	add_check_menu(section: HTMLElement, playground: Playground) {
		const checking = document.createElement("div");
		checking.className = "panel-block columns config-item";
		const label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Code check";
		checking.appendChild(label);
		const toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		const on_btn = document.createElement("button");
		on_btn.className = "button is-small is-success is-selected";
		on_btn.innerHTML = "On";
		on_btn.onclick = function (_event) {
			let model = playground.editor.getModel();
			if (model === null) {
				return;
			}
			playground.on_did_change_listener = model.onDidChangeContent(() => {
				if (model === null) {
					return;
				}
				validate(model);
			});
			on_btn.className = "button is-small is-success is-selected";
			off_btn.className = "button is-small";
		};
		const off_btn = document.createElement("button");
		off_btn.className = "button is-small";
		off_btn.innerHTML = "Off";
		off_btn.onclick = function (_event) {
			playground.on_did_change_listener.dispose();
			off_btn.className = "button is-small is-danger is-selected";
			on_btn.className = "button is-small";
		};
		toggle_btn.appendChild(on_btn);
		toggle_btn.appendChild(off_btn);
		checking.appendChild(toggle_btn);
		section.appendChild(checking);
	}

	add_color_theme_menu(section: HTMLElement, playground: Playground) {
		const checking = document.createElement("div");
		checking.className = "panel-block columns config-item";
		const label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Color theme";
		checking.appendChild(label);
		const toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		const dark_btn = document.createElement("button");
		if (localStorage.getItem(".config:color-theme") === "dark") {
			dark_btn.className = "button is-small is-dark is-active";
		} else {
			dark_btn.className = "button is-small is-light";
		}
		dark_btn.innerHTML = "Dark";
		dark_btn.onclick = function (_event) {
			set_dark(playground);
			localStorage.setItem(".config:color-theme", "dark");
			dark_btn.className = "button is-small is-dark is-active";
			light_btn.className = "button is-light is-small";
		};
		const light_btn = document.createElement("button");
		if (localStorage.getItem(".config:color-theme") === "dark") {
			light_btn.className = "button is-small is-light";
		} else {
			light_btn.className = "button is-small is-active";
		}
		light_btn.innerHTML = "Light";
		light_btn.onclick = function (_event) {
			set_light(playground);
			localStorage.setItem(".config:color-theme", "light");
			light_btn.className = "button is-small is-active";
			dark_btn.className = "button is-light is-small";
		};
		toggle_btn.appendChild(dark_btn);
		toggle_btn.appendChild(light_btn);
		checking.appendChild(toggle_btn);
		section.appendChild(checking);
	}

	add_clean_storage_menu(section: HTMLElement, _playground: Playground) {
		const clean = document.createElement("div");
		clean.className = "panel-block columns config-item";
		const label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Clean local storage";
		clean.appendChild(label);
		const clean_btn = document.createElement("div");
		clean_btn.className = "column";
		const button = document.createElement("button");
		button.className = "button is-danger is-small";
		button.innerHTML = "Clean";
		button.onclick = async function (_event) {
			button.classList.add("is-loading");
			localStorage.clear();
			await sleep(300); // fake delay
			button.classList.remove("is-loading");
		};
		clean_btn.appendChild(button);
		clean.appendChild(clean_btn);
		section.appendChild(clean);
	}

	add_version_display(section: HTMLElement, playground: Playground) {
		const version = document.createElement("div");
		version.className = "panel-block columns config-item";
		const label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Version";
		version.appendChild(label);
		const version_display = document.createElement("div");
		version_display.className = "column";
		version_display.innerHTML = wasm.Playground.new().start_message();
		version.appendChild(version_display);
		section.appendChild(version);
	}

	constructor(playground: Playground, palette: HTMLElement) {
		const modal = document.createElement("div");
		modal.className = "modal";
		modal.id = "config-modal";
		document.body.appendChild(modal);
		const modal_background = document.createElement("div");
		modal_background.className = "modal-background";
		modal.appendChild(modal_background);
		const modal_content = document.createElement("div");
		modal_content.className = "modal-card";
		modal_content.id = "config-modal-content";
		const menu = document.createElement("nav");
		menu.className = "panel";
		this.add_modal_header(menu, modal);
		const section = document.createElement("section");
		section.className = "modal-card-body";
		this.add_complete_menu(section, playground);
		this.add_check_menu(section, playground);
		this.add_color_theme_menu(section, playground);
		this.add_clean_storage_menu(section, playground);
		this.add_version_display(section, playground);
		menu.appendChild(section);
		modal_content.appendChild(menu);
		modal.appendChild(modal_content);
		this.config_btn = document.createElement("button");
		this.config_btn.id = "config-button";
		this.config_btn.className = "button modal-button";
		this.config_btn.ariaHasPopup = "true";
		const span = document.createElement("span");
		span.className = "icon";
		const icon = document.createElement("i");
		icon.className = "fas fa-cog";
		span.appendChild(icon);
		this.config_btn.appendChild(span);
		this.config_btn.addEventListener("click", function () {
			modal.classList.add("is-active");
		});
		palette.appendChild(this.config_btn);
	}
}
