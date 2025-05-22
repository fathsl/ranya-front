import Image from "next/image";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/authContext";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata = {
  title: "Ma Plateforme",
  description: "Interface de connexion, inscription et dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          <div className={` min-h-screen bg-gray-100 w-full`}>
            <header className="flex justify-end items-center w-full mb-12 md:mb-20">
              <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white  shadow-sm dark:bg-neutral-700 lg:flex-wrap lg:justify-start py-2">
                <div className="flex w-full flex-wrap items-center justify-between px-3">
                  <button
                    className="block border-0 bg-transparent px-2 text-black/50 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
                    type="button"
                    data-twe-collapse-init
                    data-twe-target="#navbarSupportedContent1"
                    aria-controls="navbarSupportedContent1"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="[&>svg]:w-7 [&>svg]:stroke-black/50 dark:[&>svg]:stroke-neutral-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className="!visible hidden flex-grow basis-[100%] items-center lg:!flex lg:basis-auto"
                    id="navbarSupportedContent1"
                    data-twe-collapse-item
                  >
                    <a
                      className="mb-4 me-5 ms-2 mt-3 flex items-center text-neutral-900 hover:text-neutral-900 focus:text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:mb-0 lg:mt-0"
                      href="#"
                    >
                      <Image
                        src="/logo.jpeg"
                        alt="logo"
                        height={64}
                        width={64}
                      />
                    </a>
                    <ul
                      className="list-style-none me-auto flex flex-col ps-0 lg:flex-row"
                      data-twe-navbar-nav-ref
                    >
                      <li
                        className="mb-4 lg:mb-0 lg:pe-2"
                        data-twe-nav-item-ref
                      >
                        <a
                          className="text-black/60 transition duration-200 hover:text-black/80 hover:ease-in-out focus:text-black/80 active:text-black/80 motion-reduce:transition-none dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80 dark:active:text-white/80 lg:px-2"
                          href="#"
                          data-twe-nav-link-ref
                        >
                          A propos
                        </a>
                      </li>
                      <li
                        className="mb-4 lg:mb-0 lg:pe-2"
                        data-twe-nav-item-ref
                      >
                        <a
                          className="text-black/60 transition duration-200 hover:text-black/80 hover:ease-in-out focus:text-black/80 active:text-black/80 motion-reduce:transition-none dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80 dark:active:text-white/80 lg:px-2"
                          href="#"
                          data-twe-nav-link-ref
                        >
                          Contact Us
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="relative flex items-center">
                    <div
                      className="relative"
                      data-twe-dropdown-ref
                      data-twe-dropdown-alignment="end"
                    >
                      <a
                        className="flex items-center whitespace-nowrap transition duration-150 ease-in-out motion-reduce:transition-none"
                        href="#"
                        id="dropdownMenuButton2"
                        role="button"
                        data-twe-dropdown-toggle-ref
                        aria-expanded="false"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                          />
                        </svg>
                      </a>
                      <ul
                        className="absolute z-[1000] float-left m-0 hidden min-w-max list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-left text-base shadow-lg data-[twe-dropdown-show]:block dark:bg-surface-dark"
                        aria-labelledby="dropdownMenuButton2"
                        data-twe-dropdown-menu-ref
                      >
                        <li>
                          <a
                            className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                            href="#"
                            data-twe-dropdown-item-ref
                          >
                            Action
                          </a>
                        </li>
                        <li>
                          <a
                            className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                            href="#"
                            data-twe-dropdown-item-ref
                          >
                            Another action
                          </a>
                        </li>
                        <li>
                          <a
                            className="block w-full whitespace-nowrap bg-white px-4 py-2 text-sm font-normal text-neutral-700 hover:bg-zinc-200/60 focus:bg-zinc-200/60 focus:outline-none active:bg-zinc-200/60 active:no-underline dark:bg-surface-dark dark:text-white dark:hover:bg-neutral-800/25 dark:focus:bg-neutral-800/25 dark:active:bg-neutral-800/25"
                            href="#"
                            data-twe-dropdown-item-ref
                          >
                            Something else here
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </nav>
            </header>

            <main className="flex flex-col min-h-screen px-6">{children}</main>

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
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
//  <Image src="/logo.jpeg" alt="logo" height={64} width={64} />
