'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getProfile, UserProfile } from '@/lib/supabase';
import EditProfileModal from './EditPofile';
import styles from './ProfileMenu.module.css';

interface ProfileMenuProps {
  user: User;
  profileData?: UserProfile | null;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, profileData: initialProfileData }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfileData || null);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileFetchedRef = useRef(false);
  
  useEffect(() => {
    if (initialProfileData) {
      setProfile(initialProfileData);
      profileFetchedRef.current = true;
    }
  }, [initialProfileData]);
  const fetchProfile = useCallback(async () => {
    if (profileFetchedRef.current || profileLoading || profile) return;
    
    setProfileLoading(true);
    
    try {
      const data = await getProfile(user.id);
      if (data) {
        setProfile(data);
        profileFetchedRef.current = true;
        
        // 캐시 업데이트
        try {
          const cachedData = localStorage.getItem('cached_user_data');
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            parsed.profileData = data;
            parsed.timestamp = Date.now();
            localStorage.setItem('cached_user_data', JSON.stringify(parsed));
          }
        } catch (error) {
          console.error('캐시 업데이트 오류:', error);
        }
      } else {
        console.log('서버에서 프로필 데이터를 찾을 수 없음');
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user.id, profile]);
  useEffect(() => {
    if (!initialProfileData && user) {
      fetchProfile();
    }
  }, [fetchProfile, initialProfileData, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      setLogoutInProgress(true);
      try {
        localStorage.removeItem('cached_user_data');
        localStorage.removeItem('auth_session_last_check');
        sessionStorage.clear(); 
        document.cookie.split(';').forEach(cookie => {
          const trimmedCookie = cookie.trim();
          const cookieName = trimmedCookie.split('=')[0];
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
      } catch (e) {
        console.error('스토리지 클리어 오류:', e);
      }
      
      void performLogout();
    } catch (error) {
      console.error('로그아웃 처리 중 오류:', error);
      redirectToHome();
    }
  };
  
  const performLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setTimeout(() => {
        redirectToHome();
      }, 300);
    } catch (err) {
      console.error('로그아웃 API 호출 오류:', err);
      redirectToHome();
    }
  };
  
  const redirectToHome = () => {
    try {
      window.location.href = '/';
    } catch (err) {
      console.error('리디렉션 오류:', err);
      window.location.reload();
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return null;
  };
  
  const avatarUrl = getAvatarUrl();
  
  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={styles.avatarButton}
        aria-label="프로필 메뉴"
        disabled={logoutInProgress}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="프로필"
            className={styles.avatarImage}
          />
        ) : (
          <span className="text-white text-sm">
            {(user.user_metadata?.full_name || user.email || '?').charAt(0)}
          </span>
        )}
      </button>
      
      {isMenuOpen && (
        <div className={styles.profileMenu}>
          <div className={styles.profileHeader}>
            <p className={styles.profileName}>
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <p className={styles.profileEmail}>
              {profile ? (
                `${profile.grade}${profile.class
                  .toString()
                  .padStart(2, '0')}${profile.number
                  .toString()
                  .padStart(2, '0')} ${profile.name}`
              ) : (
                user.email || "정보 없음"
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditModalOpen(true);
              setIsMenuOpen(false);
            }}
            className={styles.menuButton}
            disabled={logoutInProgress}
          >
            회원정보 수정
          </button>
          <button 
            onClick={handleLogout} 
            className={styles.menuButton}
            disabled={logoutInProgress}
          >
            {logoutInProgress ? '로그아웃 중...' : '로그아웃'}
          </button>
        </div>
      )}
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          fetchProfile();
        }}
        user={user}
        initialProfile={profile}
      />
    </div>
  );
};

export default ProfileMenu;
