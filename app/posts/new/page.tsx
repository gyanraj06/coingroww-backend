"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageUpload } from "@/components/image-upload";
import { RichTextEditor } from "@/components/rich-text-editor";

const SECTIONS = ["News", "Markets", "Top", "Press Release"];

const SECTION_TAGS: Record<string, string[]> = {
    "News": ["Bitcoin", "Ethereum", "Altcoins", "DeFi", "Blockchain", "NFTs", "GameFi", "Sponsored", "P/R"],
    "Markets": ["Market Release", "Crypto Price", "Crypto Stock", "Industry"],
    "Top": ["Coins", "Exchange", "Casinos", "Wallets", "Mining", "Bots", "DeFi", "NFTs"],
    "Press Release": ["Press Release"]
};

export default function NewPostPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSection = searchParams.get("section");

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        content: "",
        section: "News",
        category: "Bitcoin",
        image_url: "",
        is_featured: false,
        is_editor_pick: false
    });

    // Initialize section from URL if present
    useEffect(() => {
        if (urlSection && SECTIONS.includes(urlSection)) {
            setFormData(prev => ({
                ...prev,
                section: urlSection,
                category: SECTION_TAGS[urlSection][0]
            }));
        }
    }, [urlSection]);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "") + "-" + Date.now().toString().slice(-4);
    };

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
            const slug = generateSlug(formData.title);

            const { error } = await supabase.from("posts").insert([
                {
                    title: formData.title,
                    slug: slug,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    section: formData.section,
                    category: formData.category,
                    image_url: formData.image_url,
                    is_featured: formData.is_featured,
                    is_editor_pick: formData.is_editor_pick,
                },
            ]);

            if (error) throw error;

            router.push(`/posts?section=${formData.section}`);
            router.refresh();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Error creating post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                    <h2 className="text-3xl font-bold tracking-tight">Create New Post</h2>
                    <p className="text-muted-foreground mt-1">Write and publish a new article.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Enter article title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="excerpt" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Excerpt (Summary)
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                rows={3}
                                required
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Brief summary for the card preview..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Content (Markdown/HTML)
                            </label>
                            <div className="min-h-[400px]">
                                <RichTextEditor
                                    content={formData.content}
                                    onChange={(html: string) => setFormData(prev => ({ ...prev, content: html }))}
                                    placeholder="Write your article content here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings Column */}
                    <div className="space-y-6">
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-6">
                            <h3 className="font-semibold text-foreground border-b border-border pb-2">
                                Publishing Settings
                            </h3>

                            <div className="space-y-2">
                                <label htmlFor="section" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Section
                                </label>
                                <select
                                    id="section"
                                    name="section"
                                    value={formData.section}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {SECTIONS.map((sec) => (
                                        <option key={sec} value={sec}>
                                            {sec}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tag (Category)
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {SECTION_TAGS[formData.section]?.map((tag) => (
                                        <option key={tag} value={tag}>
                                            {tag}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Featured Image</label>
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
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Publish Article</span>
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
