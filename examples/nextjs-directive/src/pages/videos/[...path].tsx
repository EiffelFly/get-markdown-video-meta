import { GetStaticPaths, GetStaticProps } from "next";
import { getMarkdownVideoMeta } from "get-markdown-video-meta";

export type VideoPageProps = {
  title: string;
  description?: string;
  url: string;
  html: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const metas = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
    verbose: true,
  });

  let urlFrags: string[] = [];

  for (const meta of metas) {
    let urlFrag = encodeURIComponent(meta.title);
    urlFrags.push(urlFrag);
  }

  return {
    paths: urlFrags.map((frag) => ({
      params: {
        path: [frag],
      },
    })),

    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<VideoPageProps> = async ({
  params,
}) => {
  if (!params || !params.path) {
    return {
      notFound: true,
    };
  }

  const path = params.path.toString();

  const metas = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
    verbose: true,
  });

  for (const meta of metas) {
    console.log(path, encodeURIComponent(meta.title));
  }

  const targetVideoMeta = metas.find(
    (meta) => encodeURIComponent(meta.title) === encodeURIComponent(path)
  );

  if (!targetVideoMeta) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      title: targetVideoMeta.title,
      url: targetVideoMeta.url,
      html: targetVideoMeta.html,
    },
  };
};

const VideoPage = ({ title, url, html }: VideoPageProps) => {};

export default VideoPage;
