"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp, GripVertical, X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
    id: string;
    title: string;
    category: string;
    trending_rank: number | null;
}

export default function TrendingPage() {
    const router = useRouter();
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        const { data, error } = await supabase
            .from("posts")
            .select("id, title, category, trending_rank")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching posts:", error);
            return;
        }

        const posts = data as Post[];
        setAllPosts(posts.filter(p => p.trending_rank === null));
        setTrendingPosts(
            posts
                .filter(p => p.trending_rank !== null)
                .sort((a, b) => (a.trending_rank || 0) - (b.trending_rank || 0))
        );
        setLoading(false);
    }

    const addToTrending = (post: Post) => {
        const newRank = trendingPosts.length + 1;
        setTrendingPosts([...trendingPosts, { ...post, trending_rank: newRank }]);
        setAllPosts(allPosts.filter(p => p.id !== post.id));
    };

    const removeFromTrending = (post: Post) => {
        setAllPosts([...allPosts, { ...post, trending_rank: null }]);
        const remaining = trendingPosts.filter(p => p.id !== post.id);
        // Re-rank remaining
        setTrendingPosts(remaining.map((p, i) => ({ ...p, trending_rank: i + 1 })));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newList = [...trendingPosts];
        [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        setTrendingPosts(newList.map((p, i) => ({ ...p, trending_rank: i + 1 })));
    };

    const moveDown = (index: number) => {
        if (index === trendingPosts.length - 1) return;
        const newList = [...trendingPosts];
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        setTrendingPosts(newList.map((p, i) => ({ ...p, trending_rank: i + 1 })));
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            // Clear all trending ranks first
            await supabase
                .from("posts")
                .update({ trending_rank: null })
                .not("trending_rank", "is", null);

            // Set new trending ranks
            for (const post of trendingPosts) {
                await supabase
                    .from("posts")
                    .update({ trending_rank: post.trending_rank })
                    .eq("id", post.id);
            }

            router.refresh();
            alert("Trending posts saved!");
        } catch (error) {
            console.error("Error saving:", error);
            alert("Error saving changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                        Trending Now
                    </h2>
                    <p className="text-muted-foreground mt-1">Manage which articles appear in the Trending section.</p>
                </div>
                <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Trending */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Current Trending ({trendingPosts.length})
                    </h3>
                    <div className="space-y-2">
                        {trendingPosts.length === 0 ? (
                            <p className="text-muted-foreground text-sm py-8 text-center">
                                No trending posts. Add some from the right panel.
                            </p>
                        ) : (
                            trendingPosts.map((post, index) => (
                                <div
                                    key={post.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                                >
                                    <span className="text-2xl font-bold text-muted-foreground w-8">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{post.title}</p>
                                        <span className="text-xs text-blue-400">{post.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === trendingPosts.length - 1}
                                            className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => removeFromTrending(post)}
                                            className="p-1 hover:bg-destructive/20 text-destructive rounded"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Available Posts */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h3 className="font-semibold text-lg mb-4">Available Posts ({allPosts.length})</h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {allPosts.map((post) => (
                            <div
                                key={post.id}
                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{post.title}</p>
                                    <span className="text-xs text-blue-400">{post.category}</span>
                                </div>
                                <button
                                    onClick={() => addToTrending(post)}
                                    className="p-2 hover:bg-primary/20 text-primary rounded"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
