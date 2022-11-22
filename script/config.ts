import { Playground } from './index';
import { validate } from './check';

export class ConfigModal {
    config_btn: HTMLButtonElement;

    add_complete_menu(section, playground: Playground) {
        var completion = document.createElement('div');
        completion.className = 'panel-block columns config-item';
        var label = document.createElement('div');
        label.className = 'column';
        label.innerHTML = 'Completion';
        completion.appendChild(label);
        var toggle_btn = document.createElement('div');
        toggle_btn.className = 'column buttons has-addons';
        var on_btn = document.createElement('button');
        on_btn.className = 'button is-small is-success is-selected';
        on_btn.innerHTML = 'On';
        on_btn.onclick = function (_event) {
            playground.editor.updateOptions(
                { quickSuggestions: true }
            );
            on_btn.className = 'button is-small is-success is-selected';
            off_btn.className = 'button is-small';
        };
        var off_btn = document.createElement('button');
        off_btn.className = 'button is-small';
        off_btn.innerHTML = 'Off';
        off_btn.onclick = function (_event) {
            playground.editor.updateOptions(
                { quickSuggestions: false }
            );
            off_btn.className = 'button is-small is-danger is-selected';
            on_btn.className = 'button is-small';
        };
        toggle_btn.appendChild(on_btn);
        toggle_btn.appendChild(off_btn);
        completion.appendChild(toggle_btn);
        section.appendChild(completion);
    }

    add_check_menu(section, playground: Playground) {
        var checking = document.createElement('div');
        checking.className = 'panel-block columns config-item';
        var label = document.createElement('div');
        label.className = 'column';
        label.innerHTML = 'Code check';
        checking.appendChild(label);
        var toggle_btn = document.createElement('div');
        toggle_btn.className = 'column buttons has-addons';
        var on_btn = document.createElement('button');
        on_btn.className = 'button is-small is-success is-selected';
        on_btn.innerHTML = 'On';
        on_btn.onclick = function (_event) {
            let model = playground.editor.getModel();
            playground.on_did_change_listener = model.onDidChangeContent(() => {
                validate(model);
            });
            on_btn.className = 'button is-small is-success is-selected';
            off_btn.className = 'button is-small';
        };
        var off_btn = document.createElement('button');
        off_btn.className = 'button is-small';
        off_btn.innerHTML = 'Off';
        off_btn.onclick = function (_event) {
            playground.on_did_change_listener.dispose();
            off_btn.className = 'button is-small is-danger is-selected';
            on_btn.className = 'button is-small';
        };
        toggle_btn.appendChild(on_btn);
        toggle_btn.appendChild(off_btn);
        checking.appendChild(toggle_btn);
        section.appendChild(checking);
    }

    constructor(playground: Playground, palette) {
        var modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'config-modal';
        document.body.appendChild(modal);
        var modal_background = document.createElement('div');
        modal_background.className = 'modal-background';
        modal.appendChild(modal_background);
        var modal_content = document.createElement('div');
        modal_content.className = 'modal-card';
        modal_content.id = 'config-modal-content';
        var menu = document.createElement('nav');
        menu.className = 'panel';
        var menu_heading = document.createElement('header');
        menu_heading.className = 'modal-card-head';
        menu.appendChild(menu_heading);
        var menu_title = document.createElement('p');
        menu_title.className = 'modal-card-title';
        menu_title.innerHTML = 'Configuration';
        menu_heading.appendChild(menu_title);
        menu.appendChild(menu_heading);
        var section = document.createElement('section');
        section.className = 'modal-card-body';
        this.add_complete_menu(section, playground);
        this.add_check_menu(section, playground);
        menu.appendChild(section);
        modal_content.appendChild(menu);
        modal.appendChild(modal_content);
        this.config_btn = document.createElement('button');
        this.config_btn.id = 'config-button';
        this.config_btn.className = 'button modal-button';
        this.config_btn.ariaHasPopup = 'true';
        var span = document.createElement('span');
        span.className = 'icon';
        var icon = document.createElement('i');
        icon.className = 'fas fa-cog';
        span.appendChild(icon);
        this.config_btn.appendChild(span);
        this.config_btn.addEventListener('click', function () {
            modal.classList.add('is-active');
        });
        var close_btn = document.createElement('button');
        close_btn.className = 'modal-close is-large';
        close_btn.ariaLabel = 'close';
        close_btn.addEventListener('click', function () {
            modal.classList.remove('is-active');
        });
        modal.appendChild(close_btn);
        palette.appendChild(this.config_btn);
    }
}
