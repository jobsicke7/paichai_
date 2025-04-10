"use client";

import styles from "./not-found.module.css";
import Link from "next/link";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 | paichai.',
};
export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <p className={styles.message}>페이지를 찾을 수 없습니다.</p>
      <Link href="/" className={styles.homeLink}>
        홈으로 돌아가기
      </Link>
    </div>
  );
}