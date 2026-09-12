// app/layout.tsx
import ShapeGrid from "@/components/GridBg";
import type { Metadata } from "next";
import { Geist_Pixel, Xanh_Mono } from "next/font/google";
import "./globals.css";
import { FormProvider } from "@/app/context/FormContext";
import { ViewTransitions } from "next-view-transitions";

const geistPixel = Geist_Pixel({
  variable: "--font-geist-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "melotown",
  description: "A social music discovery platform free of algorithms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body
          className={`${geistPixel.variable} antialiased min-h-screen bg-slate-50 text-black m-0 p-0`}
        >
          {/* Fixed background layer */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <ShapeGrid
              speed={0.1}
              squareSize={50}
              direction="down"
              borderColor="#cff4fc"
              shape="square"
            />
          </div>

          <div className="relative z-10 min-h-screen w-full">
            <FormProvider>{children}</FormProvider>
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
