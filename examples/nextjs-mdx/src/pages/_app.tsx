import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@/styles/github-markdown.css";
import { MDXProvider } from "@mdx-js/react";
import { Youtube, YoutubeProps } from "components/Youtube";

const components = {
  Youtube: (props: YoutubeProps) => (
    <Youtube id={props.id} width={props.width} height={props.height} />
  ),
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MDXProvider components={components}>
      <Component {...pageProps} />
    </MDXProvider>
  );
}
