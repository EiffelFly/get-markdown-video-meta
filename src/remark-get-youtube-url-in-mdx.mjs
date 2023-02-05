import { visit } from "unist-util-visit";

export default function remarkGetYoutubeUrlInMdx(options) {
  if (!options) {
    throw Error("Options is not provided");
  }

  if (!options.videoUrls) {
    throw Error("options.meta is not provided");
  }

  if (!options.mdxComponents) {
    throw Error("options.mdxComponents is not provided");
  }

  return (tree) => {
    visit(tree, (node) => {
      // There are two kinds of supported Jsx element type in remark-mdx.
      // mdxJsxTextElement and mdxJsxFlowElement.
      // We will focus one mdxJsxFlowElement here.
      //
      // # mdxJsxTextElement - normal HTML element like
      // <div>hello</div>
      //
      // # mdxJsxFlowElement - jsx component like
      // export const Youtube = ({ url }) => <div url={url}>Youtbue</div>;
      // <Youtube url={...} />
      // <iframe></iframe> is mdxJsxFlowElement

      if (node.type !== "mdxJsxFlowElement") {
        return;
      }

      const targetComponent = options.mdxComponents.find(
        (e) => e.componentName === node.name
      );

      if (!targetComponent) {
        return;
      }

      const targetAttribute = node.attributes.find(
        (e) => e.name === targetComponent.propName
      );

      if (!targetAttribute) {
        return;
      }

      options.videoUrls.push(targetAttribute["value"]);
    });
  };
}
