import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import type { Editor as TipTapEditor } from '@tiptap/core';

// Define a type for the component's props
type BWBubbleMenuProps = {
  editor?: TipTapEditor; // Mark the editor prop as optional
}

// Use the defined props type in your component
const BWBubbleMenu: React.FC<BWBubbleMenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
     
    </BubbleMenu>
  )
}

export default BWBubbleMenu;
