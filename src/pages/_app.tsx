import { type AppType } from "next/app";
import { api } from "~/utils/api";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Head from "next/head";
import { ThemeProvider, useTheme } from "next-themes";
import { Layout } from "~/components/Layout";
import { Provider } from "jotai";
import { CustomToaster } from "~/components/CustomToaster";
import { enableMapSet } from "immer";
import { useRouter } from "next/router";

import "~/styles/globals.css";

enableMapSet();

//  List pages you want to be publicly accessible, or leave empty if
//  every page requires authentication. Use this naming strategy:
//   "/"              for pages/index.js
//   "/foo"           for pages/foo/index.js
//   "/foo/bar"       for pages/foo/bar.js
//   "/foo/[...bar]"  for pages/foo/[...bar].js
const publicPages: Array<string> = [
  "/sign-in/[[...index]]",
  "/sign-up/[[...index]]",
];

const MyApp: AppType = ({ Component, pageProps }) => {
  const { theme } = useTheme();
  const { pathname } = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);

  return (
    <Provider>
      <ThemeProvider attribute="class">
        <ClerkProvider
          {...pageProps}
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
        >
          <Head>
            <title>Jot It</title>
            <meta name="description" content="Efficient Note-Taking" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {isPublicPage ? (
            <Component {...pageProps} />
          ) : (
            <>
              <SignedIn>
                <Layout />

                <Component {...pageProps} />
              </SignedIn>

              <SignedOut>
                <RedirectToSignIn redirectUrl="/sign-in" />
              </SignedOut>
            </>
          )}

          <CustomToaster />
        </ClerkProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default api.withTRPC(MyApp);
