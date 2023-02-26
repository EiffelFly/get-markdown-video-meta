import { getMarkdownVideoMeta } from ".";

const main = async () => {
  const meta = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["data/youtube-mdx/blog"],
    mdxComponents: [{ componentName: "Youtube", propName: "url" }],
  });

  console.log(meta);
};

main();
