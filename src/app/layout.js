import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Sankhla Solar ERP - Next-Gen Solar EPC Operations",
  description: "A premium, unified ERP & CRM platform for Solar EPC organizations to streamline design, inventory, accounting, and installations.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body
        className={`${outfit.variable} antialiased bg-[#FAFBFC] text-[#111827]`}
      >
        {children}
      </body>
    </html>
  );
}
