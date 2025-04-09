'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageBanner.module.css';

const ImageBanner: React.FC = () => {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [usePublicBanners, setUsePublicBanners] = useState(false);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimestampRef = useRef<number>(Date.now());

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
  
    try {
      const cachedData = localStorage.getItem('bannerCache');
      const cachedTimestamp = localStorage.getItem('bannerCacheTimestamp');
      const currentTime = Date.now();
      
      const isReload = performance.navigation && performance.navigation.type === 1;
      
      if (cachedData && cachedTimestamp && 
          !isReload &&
          currentTime - parseInt(cachedTimestamp) < 3600000) {
        setBanners(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }
  
      const res = await fetch('/api/banners', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
  
      if (data.fallback) {
        setUsePublicBanners(true);
        const defaultBanners = ['/banners/1.jpg', '/banners/2.jpg', '/banners/3.jpg'];
        setBanners(defaultBanners);
        localStorage.setItem('bannerCache', JSON.stringify(defaultBanners));
      } else {
        setBanners(data.banners);
        localStorage.setItem('bannerCache', JSON.stringify(data.banners));
      }
      
      localStorage.setItem('bannerCacheTimestamp', currentTime.toString());
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      setUsePublicBanners(true);
      const defaultBanners = ['/banners/1.jpg', '/banners/2.jpg', '/banners/3.jpg'];
      setBanners(defaultBanners);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageError = useCallback((index: number) => {
    setBanners(prevBanners => {
      const newBanners = [...prevBanners];
      newBanners.splice(index, 1);
      if (currentBannerIndex >= newBanners.length && newBanners.length > 0) {
        setCurrentBannerIndex(0);
      }
      return newBanners;
    });
  }, [currentBannerIndex]);

  const changeBanner = useCallback((direction: 'next' | 'prev' | number) => {
    if (banners.length === 0) return;

    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    setCurrentBannerIndex(prevIndex => {
      if (typeof direction === 'number') {
        return direction;
      } else if (direction === 'next') {
        return (prevIndex + 1) % banners.length;
      } else {
        return prevIndex === 0 ? banners.length - 1 : prevIndex - 1;
      }
    });

    startAutoSlideTimer();
  }, [banners.length]);

  const startAutoSlideTimer = useCallback(() => {
    if (banners.length <= 1) return;

    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    const isReload = performance.navigation && performance.navigation.type === 1;
    
    if (isReload) {
      localStorage.removeItem('bannerCache');
      localStorage.removeItem('bannerCacheTimestamp');
      refreshTimestampRef.current = Date.now();
    }
    
    loadBanners();
    
    window.addEventListener('focus', () => {
      const now = Date.now();
      if (now - refreshTimestampRef.current > 300000) {
        loadBanners();
        refreshTimestampRef.current = now;
      }
    });
    
  }, [loadBanners]);

  useEffect(() => {
    startAutoSlideTimer();

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [banners, startAutoSlideTimer]);

  useEffect(() => {
    const preloadNextImage = () => {
      if (banners.length <= 1) return;
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      const preloadImg = document.createElement('img');
      preloadImg.src = banners[nextIndex];
    };
    
    preloadNextImage();
  }, [currentBannerIndex, banners]);

  if (isLoading) {
    return (
      <div className={styles.bannerSkeleton}>
        <div className={styles.skeletonAnimation}></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className={styles.noBanner}>
        <p>이미지 로드 실패</p>
      </div>
    );
  }

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        {banners.map((banner, index) => (
          <div 
            key={`banner-${index}`}
            className={`${styles.bannerItem} ${index === currentBannerIndex ? styles.active : ''}`}
          >
            {usePublicBanners ? (
              <Image 
                src={banner} 
                alt={`Banner ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={index === 0}
                className={styles.bannerImage}
                onError={() => handleImageError(index)}
              />
            ) : (
              <img 
                src={banner} 
                className={styles.bannerImage}
                alt={`Banner ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                onError={() => handleImageError(index)}
              />
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <div className={styles.navigation}>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={() => changeBanner('prev')}
              aria-label="Previous banner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() => changeBanner('next')}
              aria-label="Next banner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {banners.length > 1 && (
          <div className={styles.indicators}>
            {banners.map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`${styles.indicator} ${index === currentBannerIndex ? styles.activeIndicator : ''}`}
                onClick={() => changeBanner(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBanner;