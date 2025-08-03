import { Rubik } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

export const metadata = getMetadata({
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => (
  <html suppressHydrationWarning className={rubik.className}>
    <body style={{ backgroundColor: "black" }}>
      <ThemeProvider enableSystem>
        <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
      </ThemeProvider>
    </body>
  </html>
);

export default ScaffoldEthApp;
