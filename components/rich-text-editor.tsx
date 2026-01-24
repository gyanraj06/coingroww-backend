
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold,
    Italic,
    Strikethrough,
    ImageIcon,
    Loader2,
    Youtube as YoutubeIcon,
    Check,
    X
} from 'lucide-react';
import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { supabase } from '@/lib/supabase';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={clsx(
            "p-2 rounded-md transition-colors hover:bg-muted text-sm",
            isActive ? "bg-muted text-foreground" : "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
        )}
    >
        {children}
    </button>
);

export function RichTextEditor({ content, onChange, placeholder = "Write something..." }: RichTextEditorProps) {
    const [uploading, setUploading] = useState(false);
    const [showYoutubeInput, setShowYoutubeInput] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline underline-offset-4',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Youtube.configure({
                controls: false,
                nocookie: true,
                HTMLAttributes: {
                    class: 'w-full aspect-video rounded-lg my-6',
                },
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[200px] focus:outline-none p-4',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                            event.preventDefault();
                            uploadImageFile(file);
                            return true;
                        }
                    }
                }
                return false;
            },
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return false;

                for (let i = 0; i < files.length; i++) {
                    if (files[i].type.indexOf('image') !== -1) {
                        event.preventDefault();
                        uploadImageFile(files[i]);
                        return true;
                    }
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Shared upload function for file input, paste, and drag-drop
    const uploadImageFile = async (file: File) => {
        if (!editor) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        const fileExt = file.name?.split(".").pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        try {
            setUploading(true);

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("images")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage
                .from("images")
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            // Insert image into editor at current cursor position
            editor.chain().focus().setImage({ src: publicUrl }).run();

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];
        await uploadImageFile(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const addYoutubeVideo = () => {
        if (youtubeUrl && editor) {
            (editor.commands as any).setYoutubeVideo({
                src: youtubeUrl,
            });
            setShowYoutubeInput(false);
            setYoutubeUrl("");
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-input rounded-md overflow-hidden bg-card">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/30 relative">
                {/* Text Formatting */}
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </MenuButton>

                <div className="w-px h-6 bg-border mx-1" />

                {/* Image Upload */}
                <MenuButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload Image"
                >
                    {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ImageIcon className="w-4 h-4" />
                    )}
                </MenuButton>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                />

                {/* YouTube */}
                <div className="relative">
                    <MenuButton
                        onClick={() => setShowYoutubeInput(!showYoutubeInput)}
                        isActive={editor.isActive('youtube') || showYoutubeInput}
                        title="Add YouTube Video"
                    >
                        <YoutubeIcon className="w-4 h-4" />
                    </MenuButton>

                    {showYoutubeInput && (
                        <div className="absolute top-full left-0 z-50 mt-2 p-2 bg-background border rounded-md shadow-lg flex items-center gap-2 min-w-[300px]">
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="Paste YouTube link..."
                                className="flex-1 h-8 px-2 text-sm border rounded bg-background"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addYoutubeVideo();
                                    }
                                }}
                                autoFocus
                            />
                            <button
                                onClick={addYoutubeVideo}
                                className="p-1.5 rounded hover:bg-muted text-green-500"
                                title="Add Video"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setShowYoutubeInput(false);
                                    setYoutubeUrl("");
                                }}
                                className="p-1.5 rounded hover:bg-muted text-red-500"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
