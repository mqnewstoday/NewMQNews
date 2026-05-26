import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "MQ News Today AI | Truth & Clarity",
    template: "%s | MQ News Today AI",
  },
  description: "TRUTH & CLARITY - Asisten AI cerdas untuk informasi seputar berita, visi, dan hal terkait Muhammad Qasim.",
  keywords: ["MQ News", "Muhammad Qasim", "Berita Islam", "AI Assistant", "Truth and Clarity", "Mimpi Muhammad Qasim", "Akhir Zaman"],
  authors: [{ name: "MQ News Today" }],
  creator: "MQ News Today",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "MQ News Today AI | Truth & Clarity",
    description: "Asisten AI cerdas untuk informasi seputar berita dan hal terkait Muhammad Qasim.",
    siteName: "MQ News Today AI",
    images: [
      {
        url: "/img/LogoMQN144.png",
        width: 144,
        height: 144,
        alt: "MQ News Today Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "MQ News Today AI | Truth & Clarity",
    description: "Asisten AI cerdas untuk informasi seputar berita dan hal terkait Muhammad Qasim.",
    images: ["/img/LogoMQN144.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
