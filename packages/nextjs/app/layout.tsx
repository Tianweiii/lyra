import { Montserrat } from "next/font/google";
import { headers } from "next/headers";
import Provider from "../components/Provider";
import "@rainbow-me/rainbowkit/styles.css";
import { cookieToWeb3AuthState } from "@web3auth/modal";
// import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
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
  title: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
});

const ScaffoldEthApp = async ({ children }: { children: React.ReactNode }) => {
  const headersList = await headers();
  const web3authInitialState = cookieToWeb3AuthState(headersList.get("cookie"));

  return (
    <html suppressHydrationWarning className={montserrat.className}>
      <body style={{ backgroundColor: "black" }}>
        <ThemeProvider enableSystem>
          <Provider web3authInitialState={web3authInitialState}>{children}</Provider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
