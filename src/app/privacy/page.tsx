import { supabase } from '@/lib/supabase';
import DocViewer from '@/component/DocViewer';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PrivacyPage() {
    let content = '';

    try {
        const { data, error } = await supabase
            .from('docs')
            .select('*')
            .eq('type', 'privacy')
            .single();

        if (data && data.content) {
            content = data.content;
        } else {
        }
    } catch (error) {
        console.error('Failed to fetch document:', error);
    }

    return <DocViewer content={content} title="개인정보처리방침" docType='privacy'/>;
}