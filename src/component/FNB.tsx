'use client';

import React from 'react';
import Link from 'next/link';
import styles from './FNB.module.css';

const FNB = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.copyright}>
            © 2025 paichai. All right reserve
            <span className={styles.textSeparator}>paichai. 는 배재고등학교에서 공식적으로 운영되는 서비스가 아닙니다.</span>
          </div>
          
          <div className={styles.menu}>
            <div className={styles.menuColumn}>
              <h3>약관 및 방침</h3>
              <div className={styles.links}>
                <Link href="/privacy">개인정보 처리방침</Link>
                <Link href="/terms">서비스 이용약관</Link>
              </div>
            </div>
            
            <div className={styles.menuColumn}>
              <h3>지원/문의</h3>
              <div className={styles.links}>
                <Link href="mailto:support@paichai.com" className={styles.iconLink}>
                  <svg className={styles.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                  </svg>
                  이메일
                </Link>
                <Link href="/contact" className={styles.iconLink}>
                  <svg className={styles.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" />
                  </svg>
                  질문하기
                </Link>
                <Link href="https://status.jobsickes.shop" className={styles.iconLink}>
                  <svg className={styles.icon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                            10-4.48 10-10S17.52 2 12 2zm8 10c0 1.29-.31 2.5-.85 3.58-.2-.04-.41-.07-.63-.07-1.1 0-2 .9-2 2
                            0 .34.09.65.24.93-1.04.35-2.15.56-3.3.56-1.15 0-2.26-.21-3.3-.56.15-.28.24-.59.24-.93
                            0-1.1-.9-2-2-2-.22 0-.43.03-.63.07C4.31 14.5 4 13.29 4 12c0-4.42 3.58-8 8-8s8 3.58 8 8z"/>
                  </svg>
                  서비스 상태
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FNB;