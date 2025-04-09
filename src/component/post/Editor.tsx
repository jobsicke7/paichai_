'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Link as LinkIcon,
  Undo, Redo, Table, CheckSquare, Quote, Code2, Highlighter
} from 'lucide-react'

import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TableExt from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';

const lowlight = createLowlight({ javascript, css, html });

import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Heading from '@tiptap/extension-heading'
import Typography from '@tiptap/extension-typography'

import { useCallback } from 'react'
import styles from './Editor.module.css'

type Props = {
  content: string
  onChangeAction: (content: string) => void
}

export default function Editor({ content, onChangeAction }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '여기에 내용을 입력하세요...' }),
      Image,
      Link,
      TableExt.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem,
      Highlight,
      Heading,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => {
        onChangeAction(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  })

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/post/upload', {
        method: 'POST',
        body: formData,
      })

      const { url } = await res.json()
      console.log('Uploaded image URL:', url)
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const setLink = () => {
    const url = window.prompt('링크 URL을 입력하세요')
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  const IconButton = ({
    icon: Icon,
    onClick,
    label,
  }: {
    icon: React.ElementType
    onClick: () => void
    label: string
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={label}
      aria-label={label}
      className={styles.button}
      type="button"
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.toolbar}>
        <IconButton icon={Bold} onClick={() => editor?.chain().focus().toggleBold().run()} label="Bold" />
        <IconButton icon={Italic} onClick={() => editor?.chain().focus().toggleItalic().run()} label="Italic" />
        <IconButton icon={Strikethrough} onClick={() => editor?.chain().focus().toggleStrike().run()} label="Strikethrough" />
        <IconButton icon={Code} onClick={() => editor?.chain().focus().toggleCode().run()} label="Inline Code" />
        <IconButton icon={Code2} onClick={() => editor?.chain().focus().toggleCodeBlock().run()} label="Code Block" />
        <IconButton icon={List} onClick={() => editor?.chain().focus().toggleBulletList().run()} label="Bullet List" />
        <IconButton icon={ListOrdered} onClick={() => editor?.chain().focus().toggleOrderedList().run()} label="Ordered List" />
        <IconButton icon={CheckSquare} onClick={() => editor?.chain().focus().toggleTaskList().run()} label="Task List" />
        <IconButton icon={Heading1} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} label="Heading 1" />
        <IconButton icon={Heading2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2" />
        <IconButton icon={Heading3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading 3" />
        <IconButton icon={AlignLeft} onClick={() => editor?.chain().focus().setTextAlign('left').run()} label="Align Left" />
        <IconButton icon={AlignCenter} onClick={() => editor?.chain().focus().setTextAlign('center').run()} label="Align Center" />
        <IconButton icon={AlignRight} onClick={() => editor?.chain().focus().setTextAlign('right').run()} label="Align Right" />
        <IconButton icon={Highlighter} onClick={() => editor?.chain().focus().toggleHighlight().run()} label="Highlight" />
        <IconButton icon={LinkIcon} onClick={setLink} label="Add Link" />
        <IconButton icon={ImageIcon} onClick={handleImageUpload} label="Upload Image" />
        <IconButton icon={Table} onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Insert Table" />
        <IconButton icon={Undo} onClick={() => editor?.chain().focus().undo().run()} label="Undo" />
        <IconButton icon={Redo} onClick={() => editor?.chain().focus().redo().run()} label="Redo" />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
