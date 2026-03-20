import type { AppProps } from "next/app";
import Head from "next/head";

import "static/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Picsal</title>
        <meta name="description" content="A concept front-end for a visual art discovery platform." />
        <link rel="icon" href="static/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
