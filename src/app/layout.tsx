"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/commonComponents/Header";
import Footer from "@/components/commonComponents/Footer";
import { usePathname } from "next/navigation";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Updated condition to check for both signup and login pages
  const hideHeader = pathname === "/signup" || pathname === "/login" || pathname === "/quiz"  || pathname === "/dashboard";
  const hideFooter = pathname === "/signup" || pathname === "/login" || pathname === "/quiz"  || pathname === "/dashboard";

  return (
    <html lang="en">
      <head>
        <title>Hindutvaaa</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {/* Show header only when not on auth-related pages */}
          {!hideHeader && (
            <div className="absolute top-0 left-0 w-full z-50">
              <Header />
            </div>
          )}

          <main>{children}</main>
          
          {/* Toast Container moved inside body */}
          <ToastContainer
            position="top-center"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Flip}
          />

          {/* Footer moved inside body */}
          {!hideFooter && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}