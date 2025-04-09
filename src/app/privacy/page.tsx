import { supabase } from '@/lib/supabase';
import DocViewer from '@/component/DocViewer';
import { cache } from 'react';

const getDocContent = cache(async (type: string) => {
  try {
    const { data, error } = await supabase
      .from('docs')
      .select('*')
      .eq('type', type)
      .single();
    
    return data?.content || '';
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return '';
  }
});

export const revalidate = 600;

export default async function PrivacyPage() {
  const content = await getDocContent('privacy');
  return <DocViewer content={content} title="개인정보처리방침" docType='privacy' />;
}