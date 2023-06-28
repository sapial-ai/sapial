import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chat GPT UI Demo",
  description: "Chat GPT UI Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          <div className="justify-center grow container px-24 mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
