"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface PostActionsProps {
    postId: string;
    postSlug: string;
}

export function PostActions({ postId, postSlug }: PostActionsProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleView = () => {
        // Open the post on the frontend (assuming it runs on port 3000)
        window.open(`http://localhost:3000/post/${postId}`, '_blank');
    };

    const handleEdit = () => {
        router.push(`/posts/${postId}/edit`);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error('Supabase delete error:', error);
                alert(`Failed to delete: ${error.message}`);
                return;
            }

            router.refresh();
        } catch (error: unknown) {
            console.error('Error deleting post:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to delete post: ${message}`);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
                onClick={handleView}
                className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                title="View on site"
            >
                <ExternalLink className="w-4 h-4" />
            </button>
            <button
                onClick={handleEdit}
                className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-blue-500 transition-colors border border-transparent hover:border-border"
                title="Edit post"
            >
                <Pencil className="w-4 h-4" />
            </button>
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 hover:bg-background rounded-md text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-border disabled:opacity-50"
                title="Delete post"
            >
                <Trash2 className={`w-4 h-4 ${deleting ? 'animate-pulse' : ''}`} />
            </button>
        </div>
    );
}
