'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import styles from './PostItem.module.css'
import { UserCircle } from 'lucide-react'

type PostItemProps = {
  id: string
  title: string
  content: string
  banner_url?: string
  created_at: string
  author: {
    name: string
    avatar_url?: string
  }
  tags: string[]
}

function cleanContent(content: string): string {
  let text = content.replace(/<[^>]+>/g, '')
  text = text.replace(/&[a-zA-Z0-9#]+;/g, '')
  return text
}

export default function PostItem({
  id,
  title,
  content,
  banner_url,
  created_at,
  author,
  tags,
}: PostItemProps) {
  const plainText = cleanContent(content)
  const previewText =
    plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText

  const formattedDate =
    typeof formatDate === 'function' ? formatDate(created_at) : created_at

  return (
    <Link href={`/post/${id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={banner_url || '/images/noimg.png'}
          alt={title}
          fill
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.preview}>{previewText}</p>
        <div className={styles.footer}>
          <div className={styles.author}>
            {author.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt={author.name}
                width={24}
                height={24}
                className={styles.avatar}
              />
            ) : (
              <UserCircle size={24} className={styles.avatarFallback} />
            )}
            <span>{author.name}</span>
            <span className={styles.date}>{formattedDate}</span>
          </div>
          <div className={styles.tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.tag}>
                # {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
