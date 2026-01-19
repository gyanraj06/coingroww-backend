import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, FileText, TrendingUp, Star } from "lucide-react";
import { PostActions } from "@/components/post-actions";

import { Database } from "@/types/supabase";

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Post = Database["public"]["Tables"]["posts"]["Row"];

async function getStats(posts: Post[]) {
    return {
        total: posts.length,
        featured: posts.filter(p => p.is_featured).length,
        editorPicks: posts.filter(p => p.is_editor_pick).length
    };
}

export default async function PostsPage({ searchParams }: { searchParams: { section?: string } }) {
    const section = searchParams?.section;

    let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (section) {
        query = query.eq('section', section);
    }

    const { data: posts, error } = await query;

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                Error loading posts. Please try again later.
            </div>
        );
    }

    const stats = await getStats(posts || []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-primary/50 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground">{stats.total}</h3>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-purple-500/50 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Featured Posts</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground">{stats.featured}</h3>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border shadow-sm hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                            <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Editor's Picks</p>
                        <h3 className="text-3xl font-bold mt-1 text-foreground">{stats.editorPicks}</h3>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{section ? `${section} Posts` : 'All Posts'}</h2>
                    <p className="text-muted-foreground mt-1">Manage your {section?.toLowerCase() || 'articles'} and content.</p>
                </div>
                <Link
                    href={section ? `/posts/new?section=${section}` : "/posts/new"}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                </Link>
            </div>

            {/* Posts Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground uppercase font-medium text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Article</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {posts?.map((post: Post) => (
                            <tr key={post.id} className="group hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        {post.image_url ? (
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 border border-border">
                                                <img src={post.image_url} alt="" className="object-cover w-full h-full" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-md bg-muted border border-border" />
                                        )}
                                        <span className="font-medium text-foreground line-clamp-2 max-w-[300px] group-hover:text-primary transition-colors">{post.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        {post.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {post.is_featured && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                                Featured
                                            </span>
                                        )}
                                        {post.is_editor_pick && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                Editor's Pick
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <PostActions postId={post.id} postSlug={post.slug} />
                                </td>
                            </tr>
                        ))}
                        {(!posts || posts.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    No posts found. Create your first one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
