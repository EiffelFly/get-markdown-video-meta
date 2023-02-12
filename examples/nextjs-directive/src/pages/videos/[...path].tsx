import { GetStaticPaths } from "next";
import { join } from "path";
import glob from "fast-glob";
import { getMarkdownVideoMeta } from "get-markdown-video-meta";

export const getStaticPaths: GetStaticPaths = async () => {
  const blogDir = join(process.cwd(), "blog");
  const blogRelativePaths = glob.sync("**/*.md", { cwd: blogDir });

  const metas = await getMarkdownVideoMeta({
    targets: ["blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
  });

  return {
    paths: blogRelativePaths.map((path) => ({
      params: {
        path: path.replace(".md", "").split("/"),
      },
    })),

    fallback: "blocking",
  };
};
