import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  // Required for the file-convention `opengraph-image`/`icon` routes to resolve
  // to absolute URLs — without it Next falls back to http://localhost:3000 and
  // warns on every prerendered page.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taxfoundry.ca'),
  title: {
    default: 'TaxFoundry',
    template: '%s | Agentic Canadian corporate tax filing',
  },
  description:
    'TaxFoundry prepares, reviews, and files Canadian federal T2 and Alberta AT1 corporate tax returns. Agentic, accountant-grade, and built to CRA/TRA certification requirements.',
  openGraph: {
    title: 'TaxFoundry',
    description:
      'Agentic Canadian corporate tax filing. Federal T2 and Alberta AT1, prepared and reviewed with an accountant-grade engine.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};


const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;


export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
