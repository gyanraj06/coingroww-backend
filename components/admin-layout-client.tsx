"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={null}>
                <AdminSidebar />
            </Suspense>
            <AdminHeader />
            <main className="pl-64 pt-16 min-h-screen">
                <div className="container mx-auto p-6 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
