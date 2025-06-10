import {Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ["latin"]
  })

export const metadata = {
  title: "Vehiqle",
  description: "Find your dream Car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <Header/>
        <main className="min-h-screen">
        {children}
        </main>
        <Toaster richColor />
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">

          <p>MADE WITH ❤️ BY PHANIKUMAR</p>
          </div>
          </footer>
        </body>
    </html>
      </ClerkProvider>
  );
}
