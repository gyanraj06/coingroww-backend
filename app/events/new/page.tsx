"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Save, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageUpload } from "@/components/image-upload";

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        summary: "",
        place: "",
        date: "",
        time: "",
        event_link: "",
        banner_image_url: "",
        logo_image_url: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combine date and time
            const dateTime = new Date(`${formData.date}T${formData.time || "00:00"}`).toISOString();

            const { error } = await supabase.from("events").insert([
                {
                    title: formData.title,
                    summary: formData.summary,
                    place: formData.place,
                    date: dateTime,
                    event_link: formData.event_link,
                    banner_image_url: formData.banner_image_url,
                    logo_image_url: formData.logo_image_url,
                },
            ]);

            if (error) throw error;

            router.push("/events");
            router.refresh();
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Error creating event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link
                    href="/events"
                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
                    <p className="text-muted-foreground mt-1">Add a new event to the platform.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none">
                                Event Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                                className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="E.g. Crypto Summit 2024"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="summary" className="text-sm font-medium leading-none">
                                Summary / Description
                            </label>
                            <textarea
                                id="summary"
                                name="summary"
                                rows={5}
                                required
                                value={formData.summary}
                                onChange={handleInputChange}
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Describe enthusiasm, key speakers, topics..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Banner Image</label>
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <ImageUpload
                                    value={formData.banner_image_url}
                                    onChange={(url) => setFormData(prev => ({ ...prev, banner_image_url: url }))}
                                />
                                <p className="text-xs text-muted-foreground mt-2 text-center">Recommended size: 1200x630px</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Event Logo</label>
                            <div className="border border-border rounded-lg p-4 bg-card">
                                <ImageUpload
                                    value={formData.logo_image_url}
                                    onChange={(url) => setFormData(prev => ({ ...prev, logo_image_url: url }))}
                                />
                                <p className="text-xs text-muted-foreground mt-2 text-center">Square image recommended (1:1)</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings Column */}
                    <div className="space-y-6">
                        <div className="p-6 bg-card rounded-xl border border-border shadow-sm space-y-6">
                            <h3 className="font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Event Details
                            </h3>

                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium leading-none">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="time" className="text-sm font-medium leading-none">
                                    Time
                                </label>
                                <input
                                    id="time"
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="place" className="text-sm font-medium leading-none">
                                    Location / Place
                                </label>
                                <input
                                    id="place"
                                    name="place"
                                    type="text"
                                    value={formData.place}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    placeholder="City, Country or Online"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="event_link" className="text-sm font-medium leading-none">
                                    External Event Link
                                </label>
                                <input
                                    id="event_link"
                                    name="event_link"
                                    type="url"
                                    value={formData.event_link}
                                    onChange={handleInputChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    placeholder="https://"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={clsx(
                                    "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-sm mt-4",
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
                                        <span>Publish Event</span>
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
