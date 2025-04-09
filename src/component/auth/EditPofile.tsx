import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { subjectOptions, upsertProfile, getProfile, UserProfile } from '../../lib/supabase';
import styles from './EditProfile.module.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  initialProfile?: UserProfile | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user,
  initialProfile
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile || null);
  const [name, setName] = useState(initialProfile?.name || '');
  const [grade, setGrade] = useState<number>(initialProfile?.grade || 1);
  const [className, setClassName] = useState<number>(initialProfile?.class || 1);
  const [studentNumber, setStudentNumber] = useState<number>(initialProfile?.number || 1);
  const [subjects, setSubjects] = useState<{ [key: string]: string }>(initialProfile?.subjects || {});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setName(initialProfile.name);
      setGrade(initialProfile.grade);
      setClassName(initialProfile.class);
      setStudentNumber(initialProfile.number);
      setSubjects(initialProfile.subjects || {});
    }
  }, [initialProfile]);

  useEffect(() => {
    if (!initialProfile && user && isOpen && !isFetching) {
      loadUserProfile();
    }
  }, [user, isOpen, initialProfile, isFetching]);

  const loadUserProfile = async () => {
    if (!user || isFetching) return;
    
    setIsFetching(true);
    
    try {
      const userProfile = await getProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setName(userProfile.name);
        setGrade(userProfile.grade);
        setClassName(userProfile.class);
        setStudentNumber(userProfile.number);
        setSubjects(userProfile.subjects || {});
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
      setErrorMessage('프로필 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsFetching(false);
    }
  };

  const getSubjectKeysForGrade = () => {
    if (grade === 2) return Object.keys(subjectOptions.grade2);
    if (grade === 3) return Object.keys(subjectOptions.grade3);
    return [];
  };

  const getSubjectOptions = (category: string) => {
    if (grade === 2) return subjectOptions.grade2[category as keyof typeof subjectOptions.grade2] || [];
    if (grade === 3) return subjectOptions.grade3[category as keyof typeof subjectOptions.grade3] || [];
    return [];
  };

  const isFormValid = () => {
    if (!name || !grade || !className || !studentNumber) return false;
    if (grade >= 2) {
      const requiredSubjects = getSubjectKeysForGrade();
      return requiredSubjects.every(key => subjects[key]);
    }
    return true;
  };

  const handleSubjectChange = (category: string, value: string) => {
    setSubjects(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await upsertProfile({
        id: user.id,
        email: user.email || '',
        name,
        grade,
        class: className,
        number: studentNumber,
        avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url || '',
        subjects: grade >= 2 ? subjects : undefined
      });
      
      setSuccessMessage('회원정보가 성공적으로 수정되었습니다.');
      
      try {
        localStorage.removeItem('cached_user_data');
      } catch (e) {
        console.error('로컬 스토리지 데이터 삭제 오류:', e);
      }
      
      setTimeout(() => {
        onClose();
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 300);
      
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      setErrorMessage('회원정보 수정 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  if ((isFetching && !profile) || loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="회원정보 수정">
        <div className="text-center py-8">
          <p className="text-[var(--text)]">
            {isFetching ? '정보를 불러오는 중...' : '저장 중...'}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="회원정보 수정">
      <div className={styles.modalBody}>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        <div className={styles.inputGroup}>
          <label className={styles.label}>이름</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.gridRow}>
          <div>
            <label className={styles.label}>학년</label>
            <select
              className={styles.select}
              value={grade}
              onChange={(e) => setGrade(parseInt(e.target.value))}
              required
            >
              {[1, 2, 3].map((g) => (
                <option key={g} value={g}>{g}학년</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label}>반</label>
            <select
              className={styles.select}
              value={className}
              onChange={(e) => setClassName(parseInt(e.target.value))}
              required
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}반</option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label}>번호</label>
            <select
              className={styles.select}
              value={studentNumber}
              onChange={(e) => setStudentNumber(parseInt(e.target.value))}
              required
            >
              {[...Array(40)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}번</option>
              ))}
            </select>
          </div>
        </div>
        {grade >= 2 && (
          <div className={styles.subjectSection}>
            <h4 className={styles.subjectTitle}>선택과목</h4>
            {getSubjectKeysForGrade().map((category) => (
              <div key={category} className={styles.inputGroup}>
                <label className={styles.label}>선택과목 {category}</label>
                <select
                  className={styles.select}
                  value={subjects[category] || ''}
                  onChange={(e) => handleSubjectChange(category, e.target.value)}
                  required
                >
                  <option value="">선택해주세요</option>
                  {getSubjectOptions(category).map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
        <div className={styles.buttonRow}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>취소</Button>
          <Button onClick={handleUpdateProfile} disabled={!isFormValid() || loading} fullWidth>
            {loading ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;