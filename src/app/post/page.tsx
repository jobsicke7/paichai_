"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import PostSearch from '@/component/post/PostSearch';
import PostTags from '@/component/post/PostTags';
import PostList from '@/component/post/PostList';
import styles from './page.module.css';

type Post = {
  id: string;
  title: string;
  content: string;
  banner_url?: string;
  created_at: string;
  author: {
    name: string;
    avatar_url?: string;
  };
  tags: string[];
};

type PaginatedResponse = {
  data: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PostPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: response, isLoading } = useSWR<PaginatedResponse>(
    `/api/post?page=${page}&limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  const posts = response?.data || [];
  const pagination = response?.pagination;
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !search || 
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        setUserEmail(user.email ?? null);
      }
    };
    getUser();
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => p.tags))];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>게시글</h1>
      </div>

      <PostSearch onSearchAction={setSearch} />

      <div className={styles.tagbar}>
        <PostTags tags={allTags} selectedTag={selectedTag} onSelectAction={setSelectedTag} />
        {userEmail === 'doh292929@gmail.com' && (
          <button className={styles.writebt} onClick={() => router.push('/post/write')}>
            글쓰기
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>게시글을 불러오는 중...</div>
      ) : (
        <>
          <PostList posts={filteredPosts} />
          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className={styles.pageButton}
              >
                이전
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`${styles.pageButton} ${pageNum === page ? styles.activePage : ''}`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                disabled={page === pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className={styles.pageButton}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}