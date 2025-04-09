'use client'

import { useState } from 'react'
import styles from './TagInput.module.css'

interface TagInputProps {
  tags: string[]
  setTagsAction: (tags: string[]) => void
}

export default function TagInput({ tags, setTagsAction }: TagInputProps) {
  const [input, setInput] = useState('')

  const handleAddTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTagsAction([...tags, trimmed])
      setInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTagsAction(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.remove}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        className={styles.input}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="태그를 입력하고 Enter를 누르세요"
      />
    </div>
  )
}
