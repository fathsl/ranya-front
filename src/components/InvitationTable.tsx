import localFont from "next/font/local"
import "./globals.css"
import Script from "next/script"
import { Toaster } from "sonner"
import UserDropdown from "@/components/ui/UserDropdown"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata = {
  title: "Ma Plateforme",
  description: "Interface de connexion, inscription et dashboard.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100`}
      >
        <header className="flex justify-end items-center px-6 py-4">
          <UserDropdown />
        </header>
        <main className="flex flex-col min-h-screen">{children}</main>
        <Toaster position="top-center" richColors />
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
      </body>
    </html>
  )
}
