import { Montserrat } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import ApolloProviderWrapper from "~~/components/ApolloProviderWrapper";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata = getMetadata({
  title: "LyraStudios - Enhanced Financing Platform",
  description: "One platform for public aid and private rewards—secure, transparent, unstoppable.",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={montserrat.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LyraStudios" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ backgroundColor: "black" }}>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
