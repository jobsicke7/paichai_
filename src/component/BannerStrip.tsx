
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './BannerStrip.module.css';

interface BannerStripItem {
  img: string;
  text1: string;   
  text2: string;   
  url: string;
}
const bannerItems: BannerStripItem[] = [
  {
    img: '/emoji/notebook.png',
    text1: '새로워진 paichai.',
    text2: '패치노트 확인하기',
    url: '/post'
  },
  {
    img: '/emoji/pencil.png',
    text1: '시험 기간이 다가왔어요',
    text2: '학사일정 확인하기',
    url: 'https://paichai.hs.kr/academic_info/academic_calendar.php'
  }
];

const BannerStrip: React.FC = () => {
  const [selectedBanner, setSelectedBanner] = useState<BannerStripItem | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * bannerItems.length);
    setSelectedBanner(bannerItems[randomIndex]);
  }, []);

  if (!selectedBanner) return null;

  const isExternalUrl = selectedBanner.url.startsWith('http');

  return (
    <div className={styles.stripContainer}>
      <Link 
        href={selectedBanner.url}
        target={isExternalUrl ? "_blank" : "_self"}
        rel={isExternalUrl ? "noopener noreferrer" : ""}
        className={styles.stripLink}
      >
        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <Image 
              src={selectedBanner.img} 
              alt="Icon" 
              width={24} 
              height={24}
              className={styles.icon}
            />
          </div>
          <div className={styles.textContent}>
            <span className={styles.text1}>{selectedBanner.text1}</span>
            <span className={styles.text2}>{selectedBanner.text2}</span>
          </div>
          <div className={styles.arrow}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BannerStrip;