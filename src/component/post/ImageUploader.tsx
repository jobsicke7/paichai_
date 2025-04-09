'use client'

import { useState } from 'react'
import styles from './ImageUploader.module.css'

interface Props {
  onUploadAction: (url: string) => void
  onDeleteAction: (url: string) => void
  imageUrl?: string
}

export default function ImageUploader({ onUploadAction, onDeleteAction, imageUrl }: Props) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)

    const res = await fetch('/api/post/upload', {
      method: 'POST',
      body: formData,
    })

    const json = await res.json()
    if (json.url) {
      onUploadAction(json.url)
    }

    setUploading(false)
  }

  const handleDelete = async () => {
    if (!imageUrl) return
    await fetch('/api/post/upload', {
      method: 'DELETE',
      body: JSON.stringify({ url: imageUrl }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    onDeleteAction(imageUrl)
  }

  return (
    <div className={styles.wrapper}>
      {!imageUrl ? (
        <label className={styles.label}>
          {uploading ? '업로드 중...' : '배너 이미지 업로드'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.input}
          />
        </label>
      ) : (
        <div className={styles.previewContainer}>
          <img
            src={imageUrl}
            alt="업로드된 배너"
            className={styles.previewImage}
          />
          <button className={styles.deleteButton} onClick={handleDelete}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}
