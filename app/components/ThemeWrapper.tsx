"use client";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Web3Providers from "./Web3Providers";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useApp();

  return (
    <Web3Providers>
      <div
        className={`min-h-screen flex flex-col ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        style={{
          backgroundImage: `${
            theme === "dark"
              ? "linear-gradient(rgba(8,11,20,0.82), rgba(8,11,20,0.88))"
              : "linear-gradient(rgba(248,247,255,0.78), rgba(248,247,255,0.84))"
          }, url('/bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">{children}</main>
        <Footer />
      </div>
    </Web3Providers>
  );
}
