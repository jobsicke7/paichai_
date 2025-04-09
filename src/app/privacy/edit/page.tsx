'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DocEditor from '@/component/DocEditor';
import { supabase } from '@/lib/supabase';

export default function PrivacyEditPage() {
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const user = session?.user;

                if (!user || user.email !== 'doh292929@gmail.com') {
                    router.back(); 
                    return;
                }

                setIsAuthorized(true);

                const { data, error } = await supabase
                    .from('docs')
                    .select('*')
                    .eq('type', 'privacy')
                    .single();

                if (data?.content) {
                    setContent(data.content);
                } else {
                    setContent('');
                }
            } catch (error) {
                console.error('Failed to check session or fetch document:', error);
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [router]);

    const handleSave = async (updatedContent: string) => {
        try {
            const response = await fetch('/api/docs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'privacy',
                    content: updatedContent,
                    password: 'pw',
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save document. Status: ${response.status}, Error: ${errorData.error}`);
            }
    
            router.push('/privacy');
        } catch (error) {
            console.error('Failed to save document:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <p></p>;
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div>
            <DocEditor
                initialContent={content}
                docType="privacy"
                onSaveAction={handleSave}
            />
        </div>
    );
}