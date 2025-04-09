'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DocEditor.module.css';

interface EditorJSInstance {
    isReady: Promise<void>;
    save: () => Promise<any>;
    destroy?: () => void;
}

interface DocEditorProps {
    initialContent: string;
    docType: 'privacy' | 'terms';
    onSaveAction: (content: string) => Promise<void>;
}

export default function DocEditor({ initialContent, docType, onSaveAction }: DocEditorProps) {
    const editorRef = useRef<EditorJSInstance | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !editorContainerRef.current) return;

        if (editorRef.current && editorRef.current.destroy) {
            try {
                editorRef.current.destroy();
            } catch (e) {
                console.warn("Failed to destroy editor instance:", e);
            }
        }

        let isComponentMounted = true;

        const initEditor = async () => {
            try {
                const EditorJS = (await import('@editorjs/editorjs')).default;
                const Header = (await import('@editorjs/header')).default;
                const List = (await import('@editorjs/list')).default;
                const Checklist = (await import('@editorjs/checklist')).default;
                const Quote = (await import('@editorjs/quote')).default;
                const Delimiter = (await import('@editorjs/delimiter')).default;
                const Marker = (await import('@editorjs/marker')).default;
                const Paragraph = (await import('@editorjs/paragraph')).default;
                const Image = (await import('@editorjs/image')).default;
                const Table = (await import('@editorjs/table')).default;
                const Code = (await import('@editorjs/code')).default;
                const InlineCode = (await import('@editorjs/inline-code')).default;
                const Embed = (await import('@editorjs/embed')).default;
                const Warning = (await import('@editorjs/warning')).default;
                const LinkTool = (await import('@editorjs/link')).default;
                const Raw = (await import('@editorjs/raw')).default;
                const Underline = (await import('@editorjs/underline')).default;

                if (!isComponentMounted) return;

                let parsedContent;
                try {
                    parsedContent = initialContent ? JSON.parse(initialContent) : {};
                } catch (e) {
                    parsedContent = {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: {
                                    text: initialContent || ''
                                }
                            }
                        ]
                    };
                }

                const editor = new EditorJS({
                    holder: editorContainerRef.current,
                    tools: {
                        header: Header,
                        list: List,
                        checklist: Checklist,
                        quote: Quote,
                        delimiter: Delimiter,
                        marker: Marker,
                        paragraph: Paragraph,
                        image: Image,
                        table: Table,
                        code: Code,
                        inlineCode: InlineCode,
                        embed: Embed,
                        warning: Warning,
                        linkTool: {
                            class: LinkTool,
                            config: {
                                endpoint: '/api/link',
                            },
                        },
                        raw: Raw,
                        underline: Underline
                    },
                    data: parsedContent,
                    placeholder: '',
                    onChange: () => {
                    }
                });

                await editor.isReady;

                if (isComponentMounted) {
                    editorRef.current = editor;
                    setIsLoaded(true);
                }
            } catch (error) {
                console.error('Editor initialization error:', error);
            }
        };

        initEditor();

        return () => {
            isComponentMounted = false;
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    editorRef.current.destroy();
                } catch (e) {
                    console.warn("Error destroying editor:", e);
                }
            }
        };
    }, [initialContent]);

    const handleSave = async () => {
        if (!editorRef.current) return;

        setIsSaving(true);
        try {
            const savedData = await editorRef.current.save();
            await onSaveAction(JSON.stringify(savedData));
            alert('저장되었습니다.');
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                <h1>{docType === 'privacy' ? '개인정보처리방침' : '이용약관'} 편집</h1>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving || !isLoaded}
                >
                    {isSaving ? '저장 중...' : '저장'}
                </button>
            </div>
            <div
                ref={editorContainerRef}
                className={styles.editor}
            ></div>
            {!isLoaded && <div className={styles.loading}></div>}
        </div>
    );
}
