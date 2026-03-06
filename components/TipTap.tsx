'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
    ],
    content: '<p>Hello World! 🌎️</p>',
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap