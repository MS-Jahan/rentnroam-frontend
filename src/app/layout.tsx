import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthHydrator } from "@/components/auth-hydrator";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "RentNRoam - Rent Sports & Outdoor Gear",
  description: "Rent sports and outdoor equipment instantly from trusted providers.",
};

const themeInitScript = `
(function () {
  try {
    var raw = localStorage.getItem('rentnroam-theme') || localStorage.getItem('gearup-theme');
    var theme = 'dark';
    if (raw) {
      var parsed = JSON.parse(raw);
      var value = parsed && parsed.state && parsed.state.theme
        ? parsed.state.theme
        : parsed;
      if (value === 'light') theme = 'light';
      else if (value === 'dark') theme = 'dark';
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <AuthHydrator />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
