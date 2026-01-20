import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google"; // Using Chakra Petch as requested
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminLayoutClient } from "@/components/admin-layout-client";

const chakraPetch = Chakra_Petch({
    subsets: ["latin"],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-chakra-petch',
});

export const metadata: Metadata = {
    title: "Coingroww Admin Page",
    description: "Admin portal for CoinGroww",
    icons: {
        icon: "/logo.png",
        shortcut: "/logo.png",
        apple: "/logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${chakraPetch.variable} font-sans bg-background text-foreground antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AdminLayoutClient>
                        {children}
                    </AdminLayoutClient>
                </ThemeProvider>
            </body>
        </html>
    );
}
