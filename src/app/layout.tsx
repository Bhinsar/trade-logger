import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Trade Logger",
  description: "Trade Logger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
