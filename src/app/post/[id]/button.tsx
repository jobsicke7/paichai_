'use client'

import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
type Props = {
  postId: string
}

export default function ActionButtons({ postId }: Props) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        return
      }
  
      setUserId(user.id)
      setUserEmail(user.email ?? null)
  
    }
  
    getUser()
  }, [router])
  
  const handleDelete = async () => {
    const confirmed = confirm('정말 이 게시글을 삭제하시겠습니까?')
    if (!confirmed) return

    const res = await fetch(`/api/post/${postId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      router.push('/post')
    } else {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleEdit = () => {
    router.push(`/post/edit/${postId}`)
  }

  return (
    <div className={styles.buttonGroup}>
        {userEmail === 'doh292929@gmail.com' && (
        <div className={styles.buttonGroup}>
        <button onClick={handleEdit} className={`${styles.actionButton} ${styles.editButton}`}>
            수정
        </button>
        <button onClick={handleDelete} className={`${styles.actionButton} ${styles.deleteButton}`}>
            삭제
        </button>
        </div>
      )}
    </div>
  )
}
