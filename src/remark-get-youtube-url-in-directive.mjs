import { visit } from "unist-util-visit";

export default function remarkGetYoutubeUrlInDirective(options) {
  if (!options) {
    throw Error("Options is not provided");
  }

  if (!options.videoUrls) {
    throw Error("options.meta prop is not provided");
  }

  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "leafDirective" || node.type === "containerDirective") {
        const attributes = node.attributes || {};

        if (node.name === "youtube") {
          const id = attributes.id;
          const url = attributes.url;

          if (id) {
            options.videoUrls.push(`https://www.youtube.com/watch?v=${id}`);
          }

          if (url) {
            options.videoUrls.push(url);
          }
        }
      }
    });
  };
}
