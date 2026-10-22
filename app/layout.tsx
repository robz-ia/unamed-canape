import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/motion/Preloader";
import SmoothScroll from "@/components/motion/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "800"],
  style: ["normal", "italic"],
});

const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: { default: "Unamed Canapé. — Canapés de créateurs", template: "%s · Unamed Canapé." },
  description:
    "Canapés, fauteuils et convertibles de créateurs. Livraison et installation offertes dès 1 500 €.",
};

// Posé avant l'hydratation : évite de rejouer l'intro dans la même session.
const INTRO_SCRIPT = `try{if(sessionStorage.getItem("uc_intro")==="1")document.documentElement.classList.add("intro-seen")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <SmoothScroll>
          <Preloader />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
