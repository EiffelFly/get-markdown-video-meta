import { visit } from "unist-util-visit";

export default function remarkGetYoutubeUrlInDirective(options) {
  if (!options) {
    throw Error("Options is not provided");
  }

  if (!options.videoUrls) {
    throw Error("options.meta prop is not provided");
  }

  if (!options.directiveComponents) {
    throw Error("options.directiveComponents prop is not provided");
  }

  return (tree) => {
    visit(tree, (node) => {
      if (node.type === "leafDirective" || node.type === "containerDirective") {
        const attributes = node.attributes || {};

        const targetDirectiveComponents = options.directiveComponents.find(
          (e) => e.directiveName === node.name
        );

        if (!targetDirectiveComponents) {
          return;
        }

        switch (targetDirectiveComponents.propName) {
          case "id":
            const id = attributes.id;
            options.videoUrls.push(`https://www.youtube.com/watch?v=${id}`);
            break;
          case "url":
            const url = attributes.url;
            options.videoUrls.push(url);
            break;
          case "href":
            const href = attributes.href;
            options.videoUrls.push(href);
            break;
          default:
            break;
        }
      }
    });
  };
}
