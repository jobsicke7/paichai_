import { supabase } from '@/lib/supabase';
import DocViewer from '@/component/DocViewer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TermsPage() {
    let content = '';

    try {
        const { data, error } = await supabase
            .from('docs')
            .select('*')
            .eq('type', 'terms')
            .single();

        if (data && data.content) {
            content = data.content;
        } else {
        }
    } catch (error) {
        console.error('Failed to fetch document:', error);
    }

    return <DocViewer content={content} title="이용약관" docType='terms' />;
}