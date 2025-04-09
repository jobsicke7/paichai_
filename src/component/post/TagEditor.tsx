'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import styles from './TagEditor.module.css'
import { X } from 'lucide-react'

interface Props {
  tags: string[]
  setTagsAction: (tags: string[]) => void
}

export default function TagEditor({ tags, setTagsAction }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        setTagsAction([...tags, input.trim()])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input) {
      setTagsAction(tags.slice(0, -1))
    }
  }

  const handleRemove = (tag: string) => {
    setTagsAction(tags.filter((t) => t !== tag))
  }

  return (
    <div className={styles.wrapper}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button onClick={() => handleRemove(tag)} className={styles.remove}>
            <X size={14} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder="태그 입력 후 Enter"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
