import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import ThemeWrapper from "./components/ThemeWrapper";

export const metadata: Metadata = {
  title: "Veridict",
  description: "AI-powered task verification platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <ThemeWrapper>{children}</ThemeWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
