"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FileText, Settings, LogOut, TrendingUp, Newspaper, BarChart3, Megaphone, Flame } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
    { href: "/posts", label: "All Posts", icon: FileText },
    { href: "/posts?section=News", label: "News", icon: Newspaper },
    { href: "/posts?section=Markets", label: "Markets", icon: TrendingUp },
    { href: "/posts?section=Top", label: "Top", icon: BarChart3 },
    { href: "/posts?section=Press Release", label: "Press Release", icon: Megaphone },
    { href: "/trending", label: "Trending", icon: Flame },
    { href: "/settings", label: "Settings", icon: Settings },

];

export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.refresh(); // Refresh to update middleware state
            router.push("/login"); // Redirect to login
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <aside className="w-64 bg-card border-r border-border flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-border flex items-center gap-2">
                <img src="/logo.png" alt="CoinGroww" className="w-10 h-10" />
                <h1 className="text-xl font-bold font-sans tracking-tight text-white">COINGROWW</h1>
            </div>

            <div className="px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Platform</p>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const url = new URL(item.href, 'http://localhost');
                        const itemSection = url.searchParams.get('section');

                        // Check if active:
                        // 1. Pathname matches
                        // 2. If item has a section, current URL param 'section' must match it.
                        // 3. If item has NO section (All Posts), current URL param 'section' must be null.

                        let isActive = false;
                        if (pathname === url.pathname) {
                            if (itemSection) {
                                // For Section Tabs: match section exactly
                                isActive = searchParams.get('section') === itemSection;
                            } else {
                                // For "All Posts": match only if NO section param exists
                                isActive = !searchParams.get('section');
                            }
                        } else {
                            // For non-post pages (Settings, Trending), simple path check
                            isActive = item.href !== "/" && pathname.startsWith(item.href);
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
