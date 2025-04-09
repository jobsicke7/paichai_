'use client'

import PostItem from './PostItem'
import styles from './PostList.module.css'

type Post = {
  id: string
  title: string
  content: string
  bannerUrl?: string
  created_at: string
  author: {
    name: string
    avatar_url?: string
  }
  tags: string[]
}

type PostListProps = {
  posts: Post[]
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <div className={styles.empty}></div>
  }

  return (
    <div className={styles.grid}>
      {posts.map((post) => (

        <PostItem key={post.id} {...post} />
      ))}
    </div>
  )
}
