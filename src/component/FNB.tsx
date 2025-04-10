'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './FNB.module.css';
import { MdEmail, MdContactSupport, MdPrivacyTip, MdGavel } from 'react-icons/md';
import { AiOutlineDeploymentUnit } from 'react-icons/ai';

const FNB = () => {
  const [buildInfo, setBuildInfo] = useState<{ sha: string; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/build-info')
      .then(res => res.json())
      .then(data => setBuildInfo(data))
      .catch(err => console.error('빌드 정보 로딩 실패:', err));
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.leftColumns}>
            <div className={styles.menuColumn}>
              <h3>약관 및 방침</h3>
              <div className={styles.links}>
                <Link href="/privacy" className={styles.iconLink}>
                  <MdPrivacyTip size={16} />
                  <span>개인정보 처리방침</span>
                </Link>
                <Link href="/terms" className={styles.iconLink}>
                  <MdGavel size={16} />
                  <span>서비스 이용약관</span>
                </Link>
              </div>
            </div>
            <div className={styles.menuColumn}>
              <h3>지원/문의</h3>
              <div className={styles.links}>
                <Link href="mailto:support@paichai.com" className={styles.iconLink}>
                  <MdEmail size={16} />
                  <span>이메일</span>
                </Link>
                <Link href="/contact" className={styles.iconLink}>
                  <MdContactSupport size={16} />
                  <span>질문하기</span>
                </Link>
                <Link href="https://status.jobsickes.shop" className={styles.iconLink}>
                  <AiOutlineDeploymentUnit size={16} />
                  <span>서비스 상태</span>
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.infoColumn}>
            {buildInfo?.sha ? (
              <div className={styles.buildInfo}>
                최근 빌드: <code>{buildInfo.sha.slice(0, 7)}</code> – {buildInfo.message || ''}
              </div>
            ) : (
              <div className={styles.buildInfo}>빌드 정보 없음</div>
            )}
            <div className={styles.copyright}>
              © 2025 paichai. All rights reserved.
              <span className={styles.textSeparator}>
                본 서비스는 배재고등학교에서 공식적으로 운영하고 있지 않습니다.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FNB;
