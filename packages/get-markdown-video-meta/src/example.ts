import { getMarkdownVideoMeta } from ".";

const main = async () => {
  const metas = await getMarkdownVideoMeta({
    targets: ["data/youtube-directive/blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
    googleApiKey: "<your_key>",
    verbose: true,
  });

  console.log(metas);
};

main();
