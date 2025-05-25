import "./globals.css";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white w-full">{children}</div>
      </body>
    </html>
  );
}
