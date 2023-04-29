import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Layout } from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class">
      <ClerkProvider {...pageProps}>
        <Head>
          <title>JotIt</title>
          <meta name="description" content="Efficient Note-Taking" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Layout />

        <div className="ml-0 xl:ml-72">
          <Component {...pageProps} />
        </div>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
