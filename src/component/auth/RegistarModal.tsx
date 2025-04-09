import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { subjectOptions, checkDuplicateStudent, upsertProfile } from '../../lib/supabase';
import styles from './RegisterModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onRegistrationComplete: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onRegistrationComplete 
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<number>(1);
  const [className, setClassName] = useState<number>(1);
  const [studentNumber, setStudentNumber] = useState<number>(1);
  const [subjects, setSubjects] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

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

  const handleFirstStepSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const isDuplicate = await checkDuplicateStudent(grade, className, studentNumber);
      if (isDuplicate) {
        setErrorMessage('이미 동일한 정보로 가입한 계정이 존재해요');
        setLoading(false);
        return;
      }
      if (grade === 1) {
        await completeRegistration();
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error('Error checking duplicate:', error);
      setErrorMessage('확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await upsertProfile({
        id: user.id,
        email: user.email || '',
        name,
        grade,
        class: className,
        number: studentNumber,
        avatar_url: user.user_metadata?.avatar_url || '',
        subjects: grade >= 2 ? subjects : undefined
      });
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (category: string, value: string) => {
    setSubjects(prev => ({ ...prev, [category]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setErrorMessage('');
      setShowSuccessMessage(false);
      onClose();
    }
  };

  const handleSuccess = () => {
    handleClose();
    onRegistrationComplete();
  };

  if (errorMessage === '이미 동일한 정보로 가입한 계정이 존재해요') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="알림">
        <div className={styles.centered}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{errorMessage}</p>
          <p className={styles.subText}>관리자에게 문의해주세요.</p>
          <Button onClick={handleClose} fullWidth>뒤로가기</Button>
        </div>
      </Modal>
    );
  }

  if (showSuccessMessage) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="회원가입 완료">
        <div className={styles.centered}>
          <div className={styles.successIcon}>✅</div>
          <p className={styles.successText}>회원가입이 완료되었습니다!</p>
          <Button onClick={handleSuccess} fullWidth>확인</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="회원가입">
      {step === 1 ? (
        <div>
          <div className={styles.greeting}> 
            <span>{user?.user_metadata?.full_name || name}님, 반갑습니다!</span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleFirstStepSubmit(); }}>
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
            <div className={styles.grid3}>
              <div>
                <label className={styles.label}>학년</label>
                <select className={styles.input} value={grade} onChange={(e) => setGrade(parseInt(e.target.value))} required>
                  {[1, 2, 3].map((g) => <option key={g} value={g}>{g}학년</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>반</label>
                <select className={styles.input} value={className} onChange={(e) => setClassName(parseInt(e.target.value))} required>
                  {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}반</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>번호</label>
                <select className={styles.input} value={studentNumber} onChange={(e) => setStudentNumber(parseInt(e.target.value))} required>
                  {[...Array(40)].map((_, i) => <option key={i+1} value={i+1}>{i+1}번</option>)}
                </select>
              </div>
            </div>
            {errorMessage && errorMessage !== '이미 동일한 정보로 가입한 계정이 존재해요' && (
              <div className={styles.errorBox}>{errorMessage}</div>
            )}
            <Button type="submit" fullWidth disabled={!name || loading}>
              {loading ? '확인 중...' : '다음'}
            </Button>
          </form>
        </div>
      ) : (
        <div>
          <h4 className={styles.sectionTitle}>선택과목</h4>
          {getSubjectKeysForGrade().map((category) => (
            <div key={category} className={styles.inputGroup}>
              <label className={styles.label}>선택과목 {category}</label>
              <select className={styles.input} value={subjects[category] || ''} onChange={(e) => handleSubjectChange(category, e.target.value)} required>
                <option value="">선택해주세요</option>
                {getSubjectOptions(category).map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          ))}
          {errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}
          <div className={styles.buttonGroup}>
            <Button variant="secondary" onClick={() => setStep(1)} disabled={loading}>이전</Button>
            <Button onClick={completeRegistration} disabled={!isFormValid() || loading} fullWidth>
              {loading ? '회원가입 중...' : '회원가입 완료'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RegisterModal;