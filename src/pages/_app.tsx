import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Layout } from "~/components/Layout";
import { CustomToaster } from "~/components/CustomToaster";

import "~/styles/globals.css";

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

        <Component {...pageProps} />

        <CustomToaster />
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
