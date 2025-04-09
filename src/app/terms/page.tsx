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

export default async function TermsPage() {
  const content = await getDocContent('terms');
  return <DocViewer content={content} title="이용약관" docType='terms' />;
}