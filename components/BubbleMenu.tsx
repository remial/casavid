import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Define your own props as needed
interface BubbleMenuProps {
  editor: any; // Ideally, you should define a more specific type here
}

const MenuBar: React.FC<BubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        padding: '10px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      {/* Add more buttons as needed */}
    </div>
  );
};

const MyBubbleMenu: React.FC<BubbleMenuProps> = ({ editor }) => {
  return (
    <BubbleMenu editor={editor} >
      <MenuBar editor={editor} />
    </BubbleMenu>
  );
};

export default MyBubbleMenu;
