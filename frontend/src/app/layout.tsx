import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { JobProvider } from "@/context/JobContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Recruiter Copilot",
  description: "AI-powered hiring assistant and resume analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <JobProvider>
            {children}
          </JobProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
