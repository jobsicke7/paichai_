
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const subjectOptions = {
  grade2: {
    A: ['지구과학', '물리학', '화학', '생명과학'],
    B: ['여행지리', '세계사', '동아시아사', '경제'],
    C: ['심리학', '정치와법', '사회문화', '윤리와사상'],
    D: ['정보과학', '프로그래밍', '인공지능기초', '데이터과학']
  },
  grade3: {
    A: ['고급물리학', '고급화학', '고급생명과학', '고급지구과학'],
    B: ['미적분', '기하', '확률과통계', '수학과제탐구'],
    C: ['영어권문화', '진로영어', '영미문학읽기', '영어회화'],
    D: ['프로그래밍', '인공지능기초', '정보과학', '데이터과학']
  }
};

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  grade: number;
  class: number;
  number: number;
  subjects?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
    E?: string;
  };
}

export async function checkDuplicateStudent(
  grade: number,
  className: number,
  studentNumber: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('grade', grade)
    .eq('class', className)
    .eq('number', studentNumber)
    .limit(1);

  if (error) {
    console.error('Error checking duplicate student:', error);
    return false;
  }

  return data && data.length > 0;
}

export async function upsertProfile(profile: UserProfile): Promise<UserProfile[] | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      grade: profile.grade,
      class: profile.class,
      number: profile.number,
      subjects: profile.subjects || {}
    })
    .select();

  if (error) {
    console.error('Error saving profile:', error);
    throw error;
  }

  return data;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile;
}
