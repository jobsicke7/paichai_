'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/component/post/ui/Input'
import { Button } from '@/component/post/ui/button'
import dynamic from 'next/dynamic'
import ImageUploader from '@/component/post/ImageUploader'
import { toast } from 'sonner'
import TagEditor from '@/component/post/TagEditor'
import styles from './page.module.css'


const Editor = dynamic(() => import('@/component/post/Editor'), { ssr: false })

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [banner, setBanner] = useState('')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('유저 정보를 가져올 수 없습니다:', error)
        toast.error('로그인이 필요합니다')
        router.back()
        return
      }
  
      setUserId(user.id)
      setUserEmail(user.email ?? null)
  
      if (user.email !== 'doh292929@gmail.com') {
        toast.error('권한이 없습니다')
        router.back()
      }
    }
  
    getUser()
  }, [router])
  
  if (userEmail && userEmail !== 'doh292929@gmail.com') {
    return null
  }
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setTags(data.tags || [])
        setBanner(data.banner_url || '')
      }
      if (error) toast.error('게시글을 불러오지 못했습니다')
      setLoading(false)
    }

    fetchPost()
  }, [id, supabase])

  const handleSubmit = async () => {
    const { error } = await supabase.from('posts').update({
      title,
      content,
      tags,
      banner_url: banner,
    }).eq('id', id)
    if (error) return toast.error('게시글 수정에 실패했습니다')

    toast.success('게시글이 수정되었습니다')
    router.push(`/post/${id}`)
  }

  if (loading) return <p className={styles.loading}>로딩 중...</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>게시글 수정</h1>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목을 입력하세요"
        className={styles.input}
      />
      <ImageUploader
        imageUrl={banner}
        onUploadAction={(url) => setBanner(url)}
        onDeleteAction={() => setBanner('')}
      />
      <Editor content={content} onChangeAction={setContent} />
      <TagEditor tags={tags} setTagsAction={setTags} />
      <Button onClick={handleSubmit} className={styles.button}>수정 완료</Button>
    </div>
  )
}
