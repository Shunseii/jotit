import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";
import { ThemeProvider } from "next-themes";
import { Layout } from "~/components/Layout";
import { Provider } from "jotai";
import { CustomToaster } from "~/components/CustomToaster";
import { enableMapSet } from "immer";

import "~/styles/globals.css";

enableMapSet();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Provider>
      <ThemeProvider attribute="class">
        <ClerkProvider {...pageProps}>
          <Head>
            <title>Jot It</title>
            <meta name="description" content="Efficient Note-Taking" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Layout />

          <Component {...pageProps} />

          <CustomToaster />
        </ClerkProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default api.withTRPC(MyApp);
