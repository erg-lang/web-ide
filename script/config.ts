import { Playground, sleep } from "./index";
import { validate } from "./check";

export function set_dark(playground: Playground) {
	playground.editor.updateOptions({
		theme: "vs-dark",
	});
	document.body.classList.add("has-background-dark");
	document.getElementById("hero").classList.add("has-background-black-ter");
	document.getElementById("result").classList.add("has-text-light");
	document.getElementById("result").classList.add("has-background-black-ter");
	document.getElementById("foot").classList.add("has-background-dark");
	document.getElementById("transpile-button").classList.remove("is-light");
	document.getElementById("transpile-button").classList.add("is-dark");
	document.getElementById("share-button").classList.remove("is-light");
	document.getElementById("share-button").classList.add("is-dark");
	document.getElementById("config-button").classList.add("has-background-grey");
	document
		.getElementById("file-tree")
		.classList.add("has-background-black-ter");
	var panes = document.body.getElementsByClassName("panel-block");
	for (var i = 0; i < panes.length; i++) {
		panes[i].classList.add("has-text-grey-lighter");
	}
}

export function set_light(playground: Playground) {
	playground.editor.updateOptions({
		theme: "vs",
	});
	document.body.classList.remove("has-background-dark");
	document.getElementById("hero").classList.remove("has-background-black-ter");
	document.getElementById("result").classList.remove("has-text-light");
	document
		.getElementById("result")
		.classList.remove("has-background-black-ter");
	document.getElementById("foot").classList.remove("has-background-dark");
	document.getElementById("transpile-button").classList.add("is-light");
	document.getElementById("transpile-button").classList.remove("is-dark");
	document.getElementById("share-button").classList.add("is-light");
	document.getElementById("share-button").classList.remove("is-dark");
	document
		.getElementById("config-button")
		.classList.remove("has-background-grey");
	document
		.getElementById("file-tree")
		.classList.remove("has-background-black-ter");
	var panes = document.body.getElementsByClassName("panel-block");
	for (var i = 0; i < panes.length; i++) {
		panes[i].classList.remove("has-text-grey-lighter");
	}
}

export class ConfigModal {
	config_btn: HTMLButtonElement;

	add_modal_header(menu: HTMLElement, modal: HTMLDivElement) {
		var menu_heading = document.createElement("header");
		menu_heading.className = "modal-card-head";
		menu.appendChild(menu_heading);
		var menu_title = document.createElement("p");
		menu_title.className = "modal-card-title";
		menu_title.innerHTML = "Configuration";
		menu_heading.appendChild(menu_title);
		var close_btn = document.createElement("button");
		close_btn.className = "delete";
		close_btn.ariaLabel = "close";
		close_btn.addEventListener("click", function () {
			modal.classList.remove("is-active");
		});
		menu_heading.appendChild(close_btn);
		menu.appendChild(menu_heading);
	}

	add_complete_menu(section, playground: Playground) {
		var completion = document.createElement("div");
		completion.className = "panel-block columns config-item";
		var label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Completion";
		completion.appendChild(label);
		var toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		var on_btn = document.createElement("button");
		on_btn.className = "button is-small is-success is-selected";
		on_btn.innerHTML = "On";
		on_btn.onclick = function (_event) {
			playground.editor.updateOptions({ quickSuggestions: true });
			on_btn.className = "button is-small is-success is-selected";
			off_btn.className = "button is-small";
		};
		var off_btn = document.createElement("button");
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

	add_check_menu(section, playground: Playground) {
		var checking = document.createElement("div");
		checking.className = "panel-block columns config-item";
		var label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Code check";
		checking.appendChild(label);
		var toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		var on_btn = document.createElement("button");
		on_btn.className = "button is-small is-success is-selected";
		on_btn.innerHTML = "On";
		on_btn.onclick = function (_event) {
			let model = playground.editor.getModel();
			playground.on_did_change_listener = model.onDidChangeContent(() => {
				validate(model);
			});
			on_btn.className = "button is-small is-success is-selected";
			off_btn.className = "button is-small";
		};
		var off_btn = document.createElement("button");
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

	add_color_theme_menu(section, playground: Playground) {
		var checking = document.createElement("div");
		checking.className = "panel-block columns config-item";
		var label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Color theme";
		checking.appendChild(label);
		var toggle_btn = document.createElement("div");
		toggle_btn.className = "column buttons has-addons";
		var dark_btn = document.createElement("button");
		if (localStorage.getItem(".config:color-theme") == "dark") {
			dark_btn.className = "button is-small is-dark is-selected";
		} else {
			dark_btn.className = "button is-small is-light";
		}
		dark_btn.innerHTML = "Dark";
		dark_btn.onclick = function (_event) {
			set_dark(playground);
			localStorage.setItem(".config:color-theme", "dark");
			dark_btn.className = "button is-small is-dark is-selected";
			light_btn.className = "button is-light is-small";
		};
		var light_btn = document.createElement("button");
		if (localStorage.getItem(".config:color-theme") == "dark") {
			light_btn.className = "button is-small is-light";
		} else {
			light_btn.className = "button is-small is-selected";
		}
		light_btn.innerHTML = "Light";
		light_btn.onclick = function (_event) {
			set_light(playground);
			localStorage.setItem(".config:color-theme", "light");
			light_btn.className = "button is-small is-selected";
			dark_btn.className = "button is-light is-small";
		};
		toggle_btn.appendChild(dark_btn);
		toggle_btn.appendChild(light_btn);
		checking.appendChild(toggle_btn);
		section.appendChild(checking);
	}

	add_clean_storage_menu(section, _playground: Playground) {
		var clean = document.createElement("div");
		clean.className = "panel-block columns config-item";
		var label = document.createElement("div");
		label.className = "column";
		label.innerHTML = "Clean local storage";
		clean.appendChild(label);
		var clean_btn = document.createElement("div");
		clean_btn.className = "column";
		var button = document.createElement("button");
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

	constructor(playground: Playground, palette) {
		var modal = document.createElement("div");
		modal.className = "modal";
		modal.id = "config-modal";
		document.body.appendChild(modal);
		var modal_background = document.createElement("div");
		modal_background.className = "modal-background";
		modal.appendChild(modal_background);
		var modal_content = document.createElement("div");
		modal_content.className = "modal-card";
		modal_content.id = "config-modal-content";
		var menu = document.createElement("nav");
		menu.className = "panel";
		this.add_modal_header(menu, modal);
		var section = document.createElement("section");
		section.className = "modal-card-body";
		this.add_complete_menu(section, playground);
		this.add_check_menu(section, playground);
		this.add_color_theme_menu(section, playground);
		this.add_clean_storage_menu(section, playground);
		menu.appendChild(section);
		modal_content.appendChild(menu);
		modal.appendChild(modal_content);
		this.config_btn = document.createElement("button");
		this.config_btn.id = "config-button";
		this.config_btn.className = "button modal-button";
		this.config_btn.ariaHasPopup = "true";
		var span = document.createElement("span");
		span.className = "icon";
		var icon = document.createElement("i");
		icon.className = "fas fa-cog";
		span.appendChild(icon);
		this.config_btn.appendChild(span);
		this.config_btn.addEventListener("click", function () {
			modal.classList.add("is-active");
		});
		palette.appendChild(this.config_btn);
	}
}
