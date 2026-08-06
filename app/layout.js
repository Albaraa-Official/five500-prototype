import "./globals.css";
import { Tajawal, Rubik } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import Splash from "@/components/Splash";
import { Header } from "@/components/Chrome";
import Footer from "@/components/Footer";
import AddToast from "@/components/AddToast";
import SwRegister from "@/components/SwRegister";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

const SITE_TITLE = "FIVE 500 — فايف هاندرد";
const SITE_DESCRIPTION = "تجربة برجر فاخرة · نموذج أولي";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thefive500.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FIVE 500" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ar_SA",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${rubik.variable}`}>
      <body>
        <SwRegister />
        <CartProvider>
         <CatalogProvider>
          <div className="stage">
            <div className="phone">
              <div className="notch" />
              <Splash />
              <Header />
              <div className="app-scroll">
                {children}
                <Footer />
              </div>
              <AddToast />
              <div className="grain" aria-hidden />
            </div>
          </div>
         </CatalogProvider>
        </CartProvider>
      </body>
    </html>
  );
}
