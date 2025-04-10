'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './GNB.module.css';
import { useTheme } from './ThemeProvider';
import LoginButton from './auth/LoginButton';

const GNB = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">paichai.</Link>
        </div>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link 
                href="/" 
                className={`${styles.navLink} ${pathname === '/' ? styles.activeLink : ''}`}
              >
                홈
              </Link>
            </li>
            <li>
              <Link 
                href="/post" 
                className={`${styles.navLink} ${pathname.startsWith('/post') ? styles.activeLink : ''}`}
              >
                게시글
              </Link>
            </li>
            <li>
              <Link 
                href="/schedule" 
                className={`${styles.navLink} ${pathname.startsWith('/schedule') ? styles.activeLink : ''}`}
              >
                시간표
              </Link>
            </li>
            <li>
              <Link 
                href="/memo" 
                className={`${styles.navLink} ${pathname.startsWith('/memo') ? styles.activeLink : ''}`}
              >
                메모
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className={styles.actions}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          <LoginButton className={styles.loginButton} />
        </div>
      </div>
    </header>
  );
};

export default GNB;