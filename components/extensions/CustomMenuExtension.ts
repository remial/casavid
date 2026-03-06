import { Extension, AnyExtension } from '@tiptap/core'; // Importing the required types
import { Plugin, PluginKey, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import tippy, { Instance, Props } from 'tippy.js';
import './CustomMenu.css';
import { Editor } from '@tiptap/core'; // Importing the Editor type

interface MenuItem {
  command: string;
  label: string;
}

export const CustomMenuExtension = Extension.create({
  name: 'customMenu',

  addOptions() {
    return {
      items: [
        { command: 'toggleBold', label: 'Bold' },
        { command: 'toggleItalic', label: 'Italic' },
        // Add more default commands here or customize as needed
      ] as MenuItem[],
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('customMenu');

    return [
      new Plugin({
        key: pluginKey,
        view: (editorView: EditorView) => {
          return new CustomMenuView(editorView, this.editor);
        },
      }) as Plugin<any>,
    ];
  },
});

class CustomMenuView {
  menu: HTMLElement | null = null;
  tooltip: Instance<Props>[] = [];

  constructor(private view: EditorView, private editor: Editor) {
    console.log('CustomMenuView initialized');
  }

  update(view: EditorView, prevState: EditorState) {
    const { state } = view;
    const { from, to } = state.selection;
    const isActive = from !== to;

    if (isActive) {
        console.log('Rendering custom menu');
        this.renderMenu(view, this.editor);
      } else {
        console.log('Destroying custom menu');
        this.destroyMenu();
      }
    }

  renderMenu(view: EditorView, editor: Editor) {
    if (!this.menu) {
      this.menu = document.createElement('div');
      this.menu.className = 'custom-menu';
      document.body.appendChild(this.menu);
    }

    const items = (editor.extensionManager.extensions.find((ext: AnyExtension) => ext.name === 'customMenu')?.options.items as MenuItem[]).map((item: MenuItem) => {
      const button = document.createElement('button');
      button.textContent = item.label;
      button.addEventListener('click', () => {
        (editor.commands as any)[item.command]();
      });
      return button;
    });

    this.menu.innerHTML = '';
    items.forEach(item => this.menu!.appendChild(item));

    const { from, to } = view.state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const box = this.menu.getBoundingClientRect();

    this.menu.style.left = `${(start.left + end.left) / 2 - box.width / 2}px`;
    this.menu.style.top = `${start.top - box.height - 10}px`;


    if (this.tooltip) {
      this.tooltip.forEach(t => t.destroy());
    }

    this.tooltip = tippy(this.menu, {
        content: this.menu,
        trigger: 'manual',
        placement: 'bottom',
      }) as unknown as Instance<Props>[];
  
      if (this.tooltip && this.tooltip[0]) {
        this.tooltip[0].show();
      }
    }

  destroyMenu() {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }

    if (this.tooltip) {
      this.tooltip.forEach(t => t.destroy());
      this.tooltip = [];
    }
  }
}
