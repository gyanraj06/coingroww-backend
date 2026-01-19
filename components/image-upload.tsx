"use client";

import { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [mode, setMode] = useState<"upload" | "url">(value && !value.includes("supabase.co") ? "url" : "upload");
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];

        if (file.size > 2 * 1024 * 1024) {
            alert("File size must be less than 2MB");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        try {
            setUploading(true);

            // Upload to Supabase
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

            setPreview(publicUrl);
            onChange(publicUrl);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image. Please check your connection and try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setPreview(url);
        onChange(url);
    };

    const clearImage = () => {
        setPreview("");
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* Toggle Mode */}
            <div className="flex gap-4 border-b border-border pb-2">
                <button
                    type="button"
                    onClick={() => setMode("upload")}
                    className={`flex items-center gap-2 text-sm font-medium pb-2 -mb-2.5 border-b-2 transition-colors ${mode === "upload"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <Upload className="w-4 h-4" />
                    Upload Image
                </button>
                <button
                    type="button"
                    onClick={() => setMode("url")}
                    className={`flex items-center gap-2 text-sm font-medium pb-2 -mb-2.5 border-b-2 transition-colors ${mode === "url"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    Image URL
                </button>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
                {mode === "upload" ? (
                    <div
                        className="border-2 border-dashed border-border rounded-lg p-8 hover:bg-accent/50 transition-colors cursor-pointer text-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <div className="p-3 bg-secondary rounded-full">
                                <Upload className="w-6 h-6" />
                            </div>
                            {uploading ? (
                                <p className="font-medium animate-pulse">Uploading...</p>
                            ) : (
                                <>
                                    <p className="font-medium">Click to upload image</p>
                                    <p className="text-xs">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={preview || ""}
                                onChange={handleUrlChange}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                            />
                        </div>
                    </div>
                )}

                {/* Preview */}
                {preview && (
                    <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border bg-black/20">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image";
                            }}
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-destructive transition-colors backdrop-blur-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
