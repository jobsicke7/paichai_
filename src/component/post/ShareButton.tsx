'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'
import styles from './ShareButton.module.css'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button className={styles.button} onClick={handleCopy}>
      <Copy size={16} />
      {copied ? '링크 복사됨!' : '공유'}
    </button>
  )
}
