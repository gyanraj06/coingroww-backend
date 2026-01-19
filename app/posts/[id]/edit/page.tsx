"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageUpload } from "@/components/image-upload";

const SECTIONS = ["News", "Markets", "Top", "Press Release"];

const SECTION_TAGS: Record<string, string[]> = {
    "News": ["Bitcoin", "Ethereum", "Altcoins", "DeFi", "Blockchain", "NFTs", "GameFi", "Sponsored", "P/R"],
    "Markets": ["Market Release", "Crypto Price", "Crypto Stock", "Industry"],
    "Top": ["Coins", "Exchange", "Casinos", "Wallets", "Mining", "Bots", "DeFi", "NFTs"],
    "Press Release": ["Press Release"]
};

export default function EditPostPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        section: "News",
        category: "Bitcoin",
        image_url: "",
        is_featured: false,
        is_editor_pick: false
    });

    useEffect(() => {
        async function fetchPost() {
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error || !data) {
                alert("Post not found");
                router.push("/posts");
                return;
            }

            setFormData({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || "",
                content: data.content || "",
                section: data.section || "News",
                category: data.category,
                image_url: data.image_url || "",
                is_featured: data.is_featured || false,
                is_editor_pick: data.is_editor_pick || false
            });
            setFetching(false);
        }

        fetchPost();
    }, [params.id, router]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "section") {
            // When section changes, reset category to first tag of new section
            setFormData((prev) => ({
                ...prev,
                section: value,
                category: SECTION_TAGS[value][0]
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from("posts")
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    section: formData.section,
                    category: formData.category,
                    image_url: formData.image_url,
                    is_featured: formData.is_featured,
                    is_editor_pick: formData.is_editor_pick,
                })
                .eq("id", params.id);

            if (error) throw error;

            router.push(`/posts?section=${formData.section}`);
            router.refresh();
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Error updating post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href={`/posts${formData.section ? `?section=${formData.section}` : ''}`}
                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Post</h2>
                    <p className="text-muted-foreground mt-1">Update your article.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none">
                                Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Enter article title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-medium leading-none">
                                Slug
                            </label>
                            <input
                                id="slug"
                                name="slug"
                                type="text"
                                required
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="article-slug"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="excerpt" className="text-sm font-medium leading-none">
                                Excerpt (Summary)
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                rows={3}
                                required
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Brief summary for the card preview..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium leading-none">
                                Content (Markdown/HTML)
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                rows={20}
                                required
                                value={formData.content}
                                onChange={handleInputChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Write your article content here..."
                            />
                        </div>
                    </div>

                    {/* Sidebar Settings Column */}
                    <div className="space-y-6">
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-6">
                            <h3 className="font-semibold text-foreground border-b border-border pb-2">
                                Publishing Settings
                            </h3>

                            <div className="space-y-2">
                                <label htmlFor="section" className="text-sm font-medium leading-none">
                                    Section
                                </label>
                                <select
                                    id="section"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {SECTIONS.map((sec) => (
                                        <option key={sec} value={sec}>
                                            {sec}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium leading-none">
                                    Tag (Category)
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    {SECTION_TAGS[formData.section]?.map((tag) => (
                                        <option key={tag} value={tag}>
                                            {tag}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Featured Image</label>
                                <ImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border">
                                <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={formData.is_featured}
                                        onChange={handleCheckboxChange}
                                        className="mt-1 w-4 h-4 rounded border-primary text-primary focus:ring-primary bg-background"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-foreground">Featured Post</span>
                                        <span className="block text-xs text-muted-foreground">Show in Hero section</span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_editor_pick"
                                        checked={formData.is_editor_pick}
                                        onChange={handleCheckboxChange}
                                        className="mt-1 w-4 h-4 rounded border-primary text-primary focus:ring-primary bg-background"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-foreground">Editor's Pick</span>
                                        <span className="block text-xs text-muted-foreground">Show in Sidebar</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm",
                                    loading
                                        ? "bg-primary/50 cursor-not-allowed opacity-70"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
