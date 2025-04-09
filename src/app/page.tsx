'use client';

import ImageBanner from '@/component/ImageBanner';
import BannerStrip from '@/component/BannerStrip';
import styles from './page.module.css';
import { supabase, getProfile, UserProfile } from '@/lib/supabase';
import Timetable from '@/component/timetable';
import React, { useEffect, useState, useCallback } from 'react';
import MealInfo from '@/component/mealinfo';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsLoggedIn(false);
        setProfile(null);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      const userProfile = await getProfile(session.user.id);
      
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <div className={styles.container}>
      <BannerStrip />
      <ImageBanner />
      <div className={styles.contentSection}>
        {loading ? (
          <>
          <MealInfo />
          <Timetable profile={profile} isLoggedIn={isLoggedIn} />
        </>
        ) : (
          <>
            <MealInfo />
            <Timetable profile={profile} isLoggedIn={isLoggedIn} />
          </>
        )}
      </div>
    </div>
  );
}