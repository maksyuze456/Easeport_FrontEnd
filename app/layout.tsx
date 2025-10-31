import "./css/style.css";
import "@mantine/core/styles.css";

import { Inter } from "next/font/google";
import { ColorSchemeScript } from "@mantine/core";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Easeport",
  description: "IT Support automation app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${inter.variable} bg-gray-50 font-inter tracking-tight text-gray-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
