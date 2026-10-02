// app/layout.tsx

import ShapeGrid from "@/components/GridBg";
import type { Metadata } from "next";
import "./globals.css";
import { FormProvider } from "@/app/context/FormContext";
import { ViewTransitions } from "next-view-transitions";
import BackgroundMusic from "@/components/BgMusic";

import { Gruppo, M_PLUS_Rounded_1c } from "next/font/google";

const mPlus = M_PLUS_Rounded_1c({
  variable: "--font-m-plus",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const gruppo = Gruppo({
  variable: "--font-gruppo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "meloplaza",
  description: "A social music discovery platform free of algorithms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={`${mPlus.variable} ${gruppo.variable}`}>
        <body className="font-sans antialiased min-h-screen bg-slate-50 text-black m-0 p-0">
          {/* Fixed background layer */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <ShapeGrid
              speed={0.1}
              squareSize={50}
              direction="down"
              borderColor="#ffd9e3"
              shape="square"
            />
          </div>

          <div className="relative z-10 min-h-screen w-full">
            <FormProvider>{children}</FormProvider>
          </div>
          <div className="fixed bottom-4 left-4 z-50">
          <BackgroundMusic />
          </div>
        </body>
      </html>
    </ViewTransitions>
  );
}
