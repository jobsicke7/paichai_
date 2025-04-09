'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import RegisterModal from './RegistarModal';
import ProfileMenu from './ProfileMenu';
import { getProfile, UserProfile } from '../../lib/supabase';
import styles from './LoginButton.module.css';

interface LoginButtonProps {
  className?: string;
}

interface CachedUserData {
  user: User;
  hasProfile: boolean;
  profileData?: UserProfile | null;
  timestamp: number;
}

const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000; // 7일로 연장
const SESSION_CHECK_KEY = 'auth_session_last_check';
const USER_CACHE_KEY = 'cached_user_data';
const SESSION_REFRESH_INTERVAL = 10 * 60 * 1000; // 10분으로 단축

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const router = useRouter();
  const [returnPath, setReturnPath] = useState('');
  const authCheckAttempts = useRef(0);
  const maxAuthCheckAttempts = 10; // 재시도 횟수 증가
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionInitialized = useRef(false);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityChangeHandled = useRef(false);

  const isStorageAvailable = () => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };
  const storageAvailable = isStorageAvailable();

  // 세션 새로고침 타이머 설정
  const setupSessionRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setInterval(async () => {
      try {
        if (!document.hidden) { // 페이지가 보일 때만 실행
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            console.warn('세션 갱신 실패:', error);
            getCurrentUser(true);
          } else if (data.session) {
            setUser(data.user);
            
            if (storageAvailable && data.user) {
              const cachedData = getCachedUserData();
              if (cachedData?.profileData) {
                setCachedUserData(data.user, cachedData.hasProfile, cachedData.profileData);
              }
            }
          }
        }
      } catch (err) {
        console.error('세션 갱신 타이머 오류:', err);
      }
    }, SESSION_REFRESH_INTERVAL);
  };

  // 페이지 가시성 변경 처리 (모바일에서 앱 복귀 시)
  const handleVisibilityChange = async () => {
    if (!document.hidden && user === null) {
      try {
        const lastCheckStr = localStorage.getItem(SESSION_CHECK_KEY);
        const lastCheck = lastCheckStr ? parseInt(lastCheckStr, 10) : 0;
        const now = Date.now();
        
        // 마지막 체크로부터 5분 이상 경과한 경우 세션 재검사
        if (now - lastCheck > 5 * 60 * 1000) {
          console.log('페이지 가시성 변경 감지: 세션 재검사');
          getCurrentUser(true);
        }
      } catch (e) {
        console.error('가시성 변경 핸들러 오류:', e);
      }
    }
  };

  useEffect(() => {
    setReturnPath(window.location.pathname);
    if (storageAvailable) {
      loadCachedUserData();
    }
    
    initializeAuth();

    // 페이지 가시성 변경 감지 이벤트 리스너 등록
    if (!visibilityChangeHandled.current) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      visibilityChangeHandled.current = true;
    }
    
    // 주기적으로 세션 상태 확인
    sessionCheckRef.current = setInterval(() => {
      if (user === null && !loading) {
        getCurrentUser(false);
      }
    }, 60 * 1000); // 1분마다 확인
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 세션 초기화 함수 개선
  const initializeAuth = async () => {
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          sessionInitialized.current = true;
          
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
            setLoggingIn(false);
            if (session?.user) {
              setUser(session.user);
              const profileResult = await checkProfileCompletion(session.user);
              
              if (storageAvailable) {
                setCachedUserData(session.user, profileResult.hasProfile, profileResult.profileData);
                setLastSessionCheck();
              }
              
              setupSessionRefreshTimer();
            }
          } else if (event === 'SIGNED_OUT') {
            handleSignOut();
          }
          
          setLoading(false);
        }
      );
      
      // 캐시된 세션 체크를 건너뛰고 항상 서버에서 세션 확인
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        getCurrentUser(false);
      } else {
        // 세션이 없으면 캐시된 사용자 데이터 확인
        if (storageAvailable) {
          const cachedData = getCachedUserData();
          if (cachedData) {
            setUser(cachedData.user);
            setIsProfileComplete(cachedData.hasProfile);
            setProfileData(cachedData.profileData || null);
            
            // 캐시된 데이터가 있으면 세션 복구 시도
            refreshSession();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
      
      // 타임아웃으로 로딩 상태 해제 (보험)
      loadingTimeoutRef.current = setTimeout(() => {
        if (loading) {
          setLoading(false);
        }
      }, 3000);
      
      return subscription;
    } catch (error) {
      console.error('인증 초기화 오류:', error);
      setLoading(false);
      
      if (storageAvailable && !user) {
        loadCachedUserData();
      }
      return null;
    }
  };

  // 로그아웃 처리 개선
  const handleSignOut = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    setUser(null);
    setIsProfileComplete(false);
    setProfileData(null);
    
    if (storageAvailable) {
      clearCachedUserData();
    }
  };

  // 최근 세션 확인 여부 검사
  const checkRecentSessionCheck = (): boolean => {
    try {
      const lastCheck = localStorage.getItem(SESSION_CHECK_KEY);
      if (!lastCheck) return false;
      
      const lastCheckTime = parseInt(lastCheck, 10);
      const now = Date.now();
      
      return (now - lastCheckTime) < 30000; // 30초로 단축
    } catch (error) {
      return false;
    }
  };

  // 세션 확인 시간 기록
  const setLastSessionCheck = () => {
    try {
      localStorage.setItem(SESSION_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error('세션 확인 시간 저장 오류:', error);
    }
  };

  // 캐시된 사용자 데이터 로드
  const loadCachedUserData = () => {
    const cachedData = getCachedUserData();
    if (cachedData) {
      setUser(cachedData.user);
      setIsProfileComplete(cachedData.hasProfile);
      
      if (cachedData.profileData) {
        setProfileData(cachedData.profileData);
      }
      
      setLoading(false);
      
      setupSessionRefreshTimer();
    }
  };

  // 캐시된 데이터 가져오기
  const getCachedUserData = (): CachedUserData | null => {
    try {
      const cachedData = localStorage.getItem(USER_CACHE_KEY);
      if (!cachedData) return null;
      
      const parsedData = JSON.parse(cachedData) as CachedUserData;
      const isExpired = Date.now() - parsedData.timestamp > CACHE_EXPIRY_TIME;
      
      if (isExpired) {
        localStorage.removeItem(USER_CACHE_KEY);
        return null;
      }
      
      return parsedData;
    } catch (error) {
      console.error('캐시 데이터 파싱 오류:', error);
      try {
        localStorage.removeItem(USER_CACHE_KEY);
      } catch (e) {}
      return null;
    }
  };

  // 사용자 데이터 캐싱
  const setCachedUserData = (user: User, hasProfile: boolean, profileData?: UserProfile | null) => {
    try {
      const cacheData: CachedUserData = {
        user,
        hasProfile,
        profileData,
        timestamp: Date.now()
      };
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('사용자 데이터 캐싱 오류:', error);
    }
  };

  // 캐시 데이터 삭제
  const clearCachedUserData = () => {
    try {
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem(SESSION_CHECK_KEY);
    } catch (error) {
      console.error('캐시 데이터 삭제 오류:', error);
    }
  };

  // 현재 사용자 정보 가져오기
  const getCurrentUser = async (forceRefresh = false) => {
    if (forceRefresh) {
      authCheckAttempts.current = 0;
    } else {
      authCheckAttempts.current += 1;
    }
    
    try {
      if (storageAvailable) {
        setLastSessionCheck();
      }
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.warn('사용자 정보 가져오기 오류:', error);
        await refreshSession();
        return;
      }
      
      if (data?.user) {
        setUser(data.user);
        const profileResult = await checkProfileCompletion(data.user);
        
        if (storageAvailable) {
          setCachedUserData(data.user, profileResult.hasProfile, profileResult.profileData);
        }
        setupSessionRefreshTimer();
      } else {
        handleNoUser();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      if (authCheckAttempts.current < maxAuthCheckAttempts) {
        setTimeout(() => getCurrentUser(false), 1000);
      } else {
        setLoading(false);
        if (storageAvailable && !user) {
          loadCachedUserData();
          
          // 마지막 시도: 새로고침 세션 시도
          setTimeout(() => refreshSession(), 1000);
        }
      }
    }
  };

  // 사용자 정보 없음 처리
  const handleNoUser = () => {
    setUser(null);
    setIsProfileComplete(false);
    setProfileData(null);
    if (storageAvailable) {
      clearCachedUserData();
    }
    
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // 세션 새로고침
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('세션 리프레시 오류:', error);
        
        // 캐시된 데이터가 있으면 복구 시도
        if (storageAvailable) {
          const cachedData = getCachedUserData();
          if (cachedData) {
            // 세션이 만료됐지만 UI는 유지하기 위해 캐시된 데이터 사용
            setUser(cachedData.user);
            setIsProfileComplete(cachedData.hasProfile);
            setProfileData(cachedData.profileData || null);
            
            // 세션 복구 시도를 위해 로그인 버튼을 표시할 필요가 있을 수 있음
            setTimeout(() => {
              if (!document.hidden) {
                getCurrentUser(true);
              }
            }, 5000);
          } else {
            handleNoUser();
          }
        } else {
          handleNoUser();
        }
        return;
      }
      
      if (data.session && data.user) {
        setUser(data.user);
        const profileResult = await checkProfileCompletion(data.user);
        
        if (storageAvailable) {
          setCachedUserData(data.user, profileResult.hasProfile, profileResult.profileData);
          setLastSessionCheck();
        }
        setupSessionRefreshTimer();
      } else {
        handleNoUser();
      }
    } catch (error) {
      console.error('세션 리프레시 오류:', error);
      handleNoUser();
    } finally {
      setLoading(false);
    }
  };

  // 프로필 완료 확인
  const checkProfileCompletion = async (user: User | null): Promise<{hasProfile: boolean, profileData: UserProfile | null}> => {
    if (!user) {
      setIsProfileComplete(false);
      setProfileData(null);
      return { hasProfile: false, profileData: null };
    }
    
    // 먼저 캐시된 프로필 데이터 사용
    if (storageAvailable) {
      const cachedData = getCachedUserData();
      if (cachedData && cachedData.profileData) {
        setIsProfileComplete(true);
        setProfileData(cachedData.profileData);
        
        // 백그라운드에서 최신 프로필 가져오기
        fetchLatestProfile(user.id);
        return { hasProfile: true, profileData: cachedData.profileData };
      }
    }
    
    try {
      const profile = await getProfile(user.id);
      const hasProfile = !!profile;
      
      setIsProfileComplete(hasProfile);
      setProfileData(profile);
      
      if (user && !hasProfile) {
        setShowRegisterModal(true);
      }
      return { hasProfile, profileData: profile };
    } catch (error) {
      console.error('프로필 확인 오류:', error);
      
      // 오류 발생 시 캐시된 데이터 재사용 시도
      if (storageAvailable) {
        const cachedData = getCachedUserData();
        if (cachedData && cachedData.profileData) {
          setIsProfileComplete(true);
          setProfileData(cachedData.profileData);
          return { hasProfile: true, profileData: cachedData.profileData };
        }
      }
      
      setIsProfileComplete(false);
      setProfileData(null);
      return { hasProfile: false, profileData: null };
    }
  };
  
  // 최신 프로필 가져오기
  const fetchLatestProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      if (profile) {
        setProfileData(profile);
        setIsProfileComplete(true);
        if (storageAvailable && user) {
          setCachedUserData(user, true, profile);
        }
      }
    } catch (error) {
      console.error('프로필 가져오기 오류:', error);
    }
  };

  // 로그인 처리
  const handleLogin = async () => {
    try {
      setLoggingIn(true);
      setLoginError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google', 
        options: {
          redirectTo: `${window.location.origin}${returnPath}`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      
      if (error) throw error;
      setTimeout(() => {
        if (loggingIn) {
          setLoggingIn(false);
        }
      }, 15000);
      
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setLoginError(error.message || '로그인 중 오류가 발생했습니다');
      setLoggingIn(false);
    }
  };

  // 등록 완료 처리
  const handleRegistrationComplete = async () => {
    setIsProfileComplete(true);
    setShowRegisterModal(false);
    if (user) {
      try {
        const profile = await getProfile(user.id);
        setProfileData(profile);
        
        if (storageAvailable) {
          setCachedUserData(user, true, profile);
        }
      } catch (error) {
        console.error('프로필 정보 업데이트 오류:', error);
      }
    }
  };

  const buttonText = loggingIn ? '로그인 중...' : '로그인';
  
  // 로딩 타임아웃
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
        // 로딩이 타임아웃되면 세션 강제 리프레시
        refreshSession();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading]);
  
  // 로그인 타임아웃
  useEffect(() => {
    if (loggingIn) {
      const timeout = setTimeout(() => {
        setLoggingIn(false);
      }, 3000);         
      return () => clearTimeout(timeout);
    }
  }, [loggingIn]);
  
  // 모바일에서 특별히 처리하는 useEffect
  useEffect(() => {
    // 모바일 디바이스 감지
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 페이지 로드/새로고침 시 스토리지에서 캐시된 정보를 더 적극적으로 사용
      if (storageAvailable && !user && !loading) {
        loadCachedUserData();
      }
      
      // 5초 후에 세션 상태 재확인 (모바일 브라우저가 백그라운드에서 돌아왔을 때 대비)
      setTimeout(() => {
        if (!user && !loading) {
          getCurrentUser(true);
        }
      }, 5000);
    }
  }, []);
  
  if (loading) {
    return (
      <button className={`${styles.loginButton} ${className}`} disabled>
        로딩 중...
      </button>
    );
  }
  
  if (user && isProfileComplete) {
    return <ProfileMenu user={user} profileData={profileData} />;
  }
  
  return (
    <>
      <button 
        className={`${styles.loginButton} ${className}`} 
        onClick={handleLogin} 
        disabled={loggingIn}
      >
        {buttonText}
      </button>
      {user && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          user={user}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
};

export default LoginButton;