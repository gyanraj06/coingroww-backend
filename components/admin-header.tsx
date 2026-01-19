"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type Post = Database['public']['Tables']['posts']['Row'];

export function AdminHeader() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                setOpen(true);
                try {
                    const { data, error } = await supabase
                        .from('posts')
                        .select('*')
                        .ilike('title', `%${query}%`)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (data) {
                        setResults(data);
                    }
                } catch (err) {
                    console.error("Search error:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelectPost = (postId: string) => {
        router.push(`/posts/${postId}/edit`);
        setOpen(false);
        setQuery("");
    };

    return (
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-64 z-20 flex items-center px-8">
            <div className="w-full max-w-3xl" ref={wrapperRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => { if (results.length > 0) setOpen(true); }}
                        className="w-full h-10 rounded-full border border-input bg-background/50 px-4 pl-10 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>

                {/* Results Dropdown */}
                {open && (
                    <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {results.length > 0 ? (
                            <div className="py-2">
                                <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Search Results
                                </h3>
                                {results.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => handleSelectPost(post.id)}
                                        className="px-4 py-3 hover:bg-accent/50 cursor-pointer flex items-center gap-4 transition-colors group"
                                    >
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-secondary-foreground/10">
                                                    {post.section}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'No date'}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !loading && query.length > 1 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm">No posts found matching "{query}"</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
