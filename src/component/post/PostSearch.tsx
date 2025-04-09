'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import styles from './PostSearch.module.css'

type PostSearchProps = {
  onSearchAction: (keyword: string) => void
  defaultValue?: string
}

export default function PostSearch({ onSearchAction, defaultValue = '' }: PostSearchProps) {
  const [keyword, setKeyword] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchAction(keyword.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={styles.searchBox}>
      <Search size={20} className={styles.icon} />
      <input
        type="text"
        className={styles.input}
        placeholder="검색어를 입력하세요"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
    </form>
  )
}
