'use client';

import styles from '@/app/page.module.css';
import { supabase, getProfile, UserProfile } from '@/lib/supabase';
import Timetable from '@/component/timetable';
import React, { useEffect, useState, useCallback } from 'react';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    const userProfile = await getProfile(session.user.id);
    
    if (userProfile) {
      setProfile(userProfile);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.contentSection}>

      <Timetable profile={profile} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}