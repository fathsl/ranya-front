"use client";

import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/authContext";
import { usePathname } from "next/navigation";
import LandingLayout from "./landing-layout";
import AuthLayout from "./auth-layout";
import DashboardHeader from "@/components/HeaderDashboard";
import Sidebar from "@/components/SidebarDashboard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html>
      <body>
        <AuthProvider>
          <Script id="hydration-fix" strategy="beforeInteractive">
            {`
              (function() {
                const html = document.documentElement;
                if (html.hasAttribute('data-lt-installed')) {
                  html.removeAttribute('data-lt-installed');
                }
              })();
            `}
          </Script>

          <Toaster position="top-center" richColors />

          {(pathname === "/" || pathname.startsWith("/invit-formation")) && (
            <LandingLayout>{children}</LandingLayout>
          )}

          {(pathname === "/login" || pathname === "/register") && (
            <AuthLayout>{children}</AuthLayout>
          )}

          {pathname !== "/" &&
            pathname !== "/login" &&
            pathname !== "/register" &&
            !pathname.startsWith("/invit-formation") && (
              <div className="min-h-screen bg-gray-100 w-full flex">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                  <DashboardHeader />
                  <main className="flex-1 px-6 py-4">{children}</main>

                  <Script id="hydration-fix" strategy="beforeInteractive">
                    {`
                    (function() {
                      const html = document.documentElement;
                      if (html.hasAttribute('data-lt-installed')) {
                        html.removeAttribute('data-lt-installed');
                      }
                    })();
                  `}
                  </Script>
                </div>
              </div>
            )}
        </AuthProvider>
      </body>
    </html>
  );
}
