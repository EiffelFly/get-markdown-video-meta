import { getMarkdownVideoMeta } from ".";

const main = async () => {
  const metas = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["data/youtube-directive/blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
    verbose: true,
  });

  console.log(metas);
};

main();
