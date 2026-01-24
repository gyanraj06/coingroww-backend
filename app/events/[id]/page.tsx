"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, Save, Loader2, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { ImageUpload } from "@/components/image-upload";

export default function EditEventPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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

    useEffect(() => {
        fetchEvent();
    }, []);

    const fetchEvent = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", params.id)
                .single();

            if (error) throw error;

            if (data) {
                // Parse date and time
                const dateObj = new Date(data.date || new Date().toISOString());
                const dateStr = dateObj.toISOString().split("T")[0];
                const timeStr = dateObj.toTimeString().split(" ")[0].substring(0, 5);

                setFormData({
                    title: data.title || "",
                    summary: data.summary || "",
                    place: data.place || "",
                    date: dateStr,
                    time: timeStr,
                    event_link: data.event_link || "",
                    banner_image_url: data.banner_image_url || "",
                    logo_image_url: data.logo_image_url || "",
                });
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            alert("Error fetching event details.");
            router.push("/events");
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combine date and time
            const dateStr = formData.date || new Date().toISOString().split("T")[0];
            const timeStr = formData.time || "00:00";
            const dateTime = new Date(`${dateStr}T${timeStr}`).toISOString();

            const { error } = await supabase
                .from("events")
                .update({
                    title: formData.title,
                    summary: formData.summary,
                    place: formData.place,
                    date: dateTime,
                    event_link: formData.event_link,
                    banner_image_url: formData.banner_image_url,
                    logo_image_url: formData.logo_image_url,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", params.id);

            if (error) throw error;

            router.push("/events");
            router.refresh();
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Error updating event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", params.id);

            if (error) throw error;

            router.push("/events");
            router.refresh();
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Error deleting event.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-8 h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/events"
                        className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
                        <p className="text-muted-foreground mt-1">Update event details.</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Event
                </button>
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
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Update Event</span>
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
