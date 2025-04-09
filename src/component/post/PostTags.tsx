'use client'

import styles from './PostTags.module.css'

type PostTagsProps = {
  tags: string[]
  selectedTag: string | null
  onSelectAction: (tag: string | null) => void
}

export default function PostTags({ tags, selectedTag, onSelectAction }: PostTagsProps) {
  const handleClick = (tag: string) => {
    
    if (selectedTag === tag) {
      onSelectAction(null)
    } else {
      onSelectAction(tag)
    }
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.tag} ${selectedTag === null ? styles.active : ''}`}
        onClick={() => onSelectAction(null)}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`${styles.tag} ${selectedTag === tag ? styles.active : ''}`}
          onClick={() => handleClick(tag)}
        >
          # {tag}
        </button>
      ))}
    </div>
  )
}
