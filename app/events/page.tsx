"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Calendar, MapPin, Loader2, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";


type Event = {
    id: string;
    title: string;
    summary: string | null;
    place: string | null;
    date: string | null;
    event_link: string | null;
    banner_image_url: string | null;
    logo_image_url: string | null;
    created_at: string | null;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("date", { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Events</h2>
                    <p className="text-muted-foreground mt-1">Manage platform events and conferences.</p>
                </div>
                <Link
                    href="/events/new"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Event</span>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No events found</h3>
                    <p className="text-muted-foreground mt-1">Get started by creating your first event.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {events.map((event) => (
                        <div key={event.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                            {event.banner_image_url && (
                                <div className="aspect-video w-full overflow-hidden bg-muted">
                                    <img
                                        src={event.banner_image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            )}
                            <div className="p-5 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                                            {event.title}
                                        </h3>
                                        {event.logo_image_url && (
                                            <img
                                                src={event.logo_image_url}
                                                alt="Logo"
                                                className="w-10 h-10 rounded-full object-contain bg-background border border-border p-1 shrink-0"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        {event.date && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(event.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {event.place && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{event.place}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {event.summary}
                                </p>
                                {event.event_link && (
                                    <div className="pt-2">
                                        <a
                                            href={event.event_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                        >
                                            Visit Event Page
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-border flex justify-end">
                                    <Link
                                        href={`/events/${event.id}`}
                                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div >
            )}
        </div >
    );
}
