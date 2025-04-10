import { notFound } from 'next/navigation'
import styles from './page.module.css'
import { formatDate } from '@/lib/utils/date'
import TableOfContents from '@/component/post/TableOfContents'
import ShareButton from '@/component/post/ShareButton'
import ProfileMenu from '@/component/auth/ProfileMenu'
import ActionButtons from './button'
import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'

type PostDetailProps = {
  params: { id: string }
}

type PostWithProfile = {
  id: string
  title: string
  content: string
  created_at: string
  tags: string[]
  profiles: {
    name: string
    avatar_url: string | null
  } | null
}
export async function generateMetadata({ params }: PostDetailProps): Promise<Metadata> {
  const { data } = await supabase
    .from('posts')
    .select('title')
    .eq('id', (await params).id)
    .single<{ title: string }>()

  return {
    title: data?.title + ' | paichai.' || '게시글',
  }
}

export default async function PostDetailPage({ params }: PostDetailProps) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      tags,
      profiles!fk_author(name, avatar_url)
    `)
    .eq('id', (await params).id)
    .single<PostWithProfile>()

  if (error || !data) return notFound()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user || null

  const post = {
    id: data.id,
    title: data.title,
    content: data.content,
    createdAt: data.created_at,
    tags: data.tags,
    author: {
      name: data.profiles?.name ?? '알 수 없음',
      avatarUrl: data.profiles?.avatar_url ?? null,
    },
  }

  return (
    <main className={styles.wrapper}>
      {user && (
        <div className={styles.profileSection}>
          <ProfileMenu user={user} />
        </div>
      )}
      <article className={styles.content}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          {post.author.avatarUrl && (
            <img src={post.author.avatarUrl} alt="작성자" className={styles.avatar} />
          )}
          <span className={styles.author}>{post.author.name}</span>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
          <ShareButton />
          <ActionButtons postId={post.id} />
        </div>

        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className={styles.tags}>
          {post.tags.map((tag: string) => (
            <span key={tag} className={styles.tag}># {tag}</span>
          ))}
        </div>
      </article>
      <aside className={styles.sidebar}>
        <TableOfContents content={post.content} />
      </aside>
    </main>
  )
}