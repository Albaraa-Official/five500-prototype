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

export const metadata = {
  title: "FIVE 500 — فايف هاندرد",
  description: "تجربة برجر فاخرة · نموذج أولي",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FIVE 500" },
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
