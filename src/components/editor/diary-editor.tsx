'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { uploadImage, getOptimizedUrl } from '@/lib/cloudinary';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    CheckSquare,
    Quote,
    Code,
    Image as ImageIcon,
    Link as LinkIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Undo,
    Redo,
    Loader2,
} from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DiaryEditorProps {
    content?: Record<string, unknown>;
    onChange?: (json: Record<string, unknown>) => void;
    placeholder?: string;
}

export function DiaryEditor({ content, onChange, placeholder = 'Start writing your thoughts...' }: DiaryEditorProps) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // @ts-ignore — Tiptap peer dependency version mismatch causes type conflicts but runtime works fine
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            ImageExt.configure({ inline: false, allowBase64: true }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'cursor-pointer' } }),
            Placeholder.configure({ placeholder }),
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight.configure({ multicolor: false }),
            TaskList,
            TaskItem.configure({ nested: true }),
        ],
        content: content || undefined,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            },
        },
        onUpdate: ({ editor }: any) => {
            onChange?.(editor.getJSON() as Record<string, unknown>);
        },
    });

    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be under 10MB');
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImage(file);
            const url = getOptimizedUrl(result.secure_url);
            editor.chain().focus().setImage({ src: url }).run();
            toast.success('Image uploaded');
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Image upload failed. Check Cloudinary config.');
        }
        setUploading(false);
    }, [editor]);

    const handleAddLink = useCallback(() => {
        if (!editor) return;
        const url = prompt('Enter URL:');
        if (url) {
            (editor.chain().focus() as any).setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    // Cast chain commands to bypass Tiptap type conflicts
    const chain = () => editor.chain().focus() as any;

    const ToolButton = ({
        active,
        onClick,
        children,
        title,
        disabled,
    }: {
        active?: boolean;
        onClick: () => void;
        children: React.ReactNode;
        title: string;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm',
                active
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                disabled && 'opacity-40 cursor-not-allowed'
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="glass-card overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-border/50 p-2 flex flex-wrap items-center gap-0.5 sticky top-0 bg-inherit z-10">
                <ToolButton title="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}>
                    <Bold className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}>
                    <Italic className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Underline" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}>
                    <UnderlineIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}>
                    <Strikethrough className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Highlight" active={editor.isActive('highlight')} onClick={() => chain().toggleHighlight().run()}>
                    <Highlighter className="w-4 h-4" />
                </ToolButton>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <ToolButton title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => chain().toggleHeading({ level: 1 }).run()}>
                    <Heading1 className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="w-4 h-4" />
                </ToolButton>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <ToolButton title="Bullet List" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}>
                    <List className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Ordered List" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}>
                    <ListOrdered className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Task List" active={editor.isActive('taskList')} onClick={() => chain().toggleTaskList().run()}>
                    <CheckSquare className="w-4 h-4" />
                </ToolButton>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <ToolButton title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => chain().setTextAlign('left').run()}>
                    <AlignLeft className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => chain().setTextAlign('center').run()}>
                    <AlignCenter className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => chain().setTextAlign('right').run()}>
                    <AlignRight className="w-4 h-4" />
                </ToolButton>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <ToolButton title="Blockquote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}>
                    <Quote className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Code" active={editor.isActive('code')} onClick={() => chain().toggleCode().run()}>
                    <Code className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Link" active={editor.isActive('link')} onClick={handleAddLink}>
                    <LinkIcon className="w-4 h-4" />
                </ToolButton>

                <ToolButton title="Insert Image" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                </ToolButton>

                <div className="w-px h-6 bg-border/50 mx-1" />

                <ToolButton title="Undo" onClick={() => chain().undo().run()}>
                    <Undo className="w-4 h-4" />
                </ToolButton>
                <ToolButton title="Redo" onClick={() => chain().redo().run()}>
                    <Redo className="w-4 h-4" />
                </ToolButton>

                {uploading && (
                    <span className="text-xs text-brand-500 ml-2 animate-pulse">Uploading…</span>
                )}
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} className="min-h-[300px]" />

            {/* Hidden file input */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
