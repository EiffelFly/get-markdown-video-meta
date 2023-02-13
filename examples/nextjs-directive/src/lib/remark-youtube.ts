import { visit } from "unist-util-visit";
import type { Root } from "remark-directive";
import type { Plugin } from "unified";

export const remarkYoutube: Plugin<
  [{ validateYoutubeLink?: boolean; width?: number; height?: number }],
  Root
> = (options = {}) => {
  if (!options) {
    throw Error("Options is not provided");
  }

  if (typeof options.validateYoutubeLink === "undefined") {
    throw Error("validateYoutubeLink option is requried");
  }

  return async (tree, file) => {
    const promises: Promise<void>[] = [];
    visit(tree, (node) => {
      if (
        node.type === "textDirective" ||
        node.type === "leafDirective" ||
        node.type === "containerDirective"
      ) {
        if (node.name !== "youtube") return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const id = attributes.id;

        if (node.type === "textDirective") {
          file.fail("Text directives for `youtube` not supported", node);
        }
        if (!id) {
          file.fail("Missing video id", node);
        }

        // We fetch youtube oembed API endpoint to check whether the youtube link exist.

        if (options.validateYoutubeLink) {
          const p = fetch(
            `https://youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}`
          )
            .then((res) => {
              if (res.status === 200) {
                data.hName = "iframe";
                data.hProperties = {
                  src: "https://www.youtube.com/embed/" + id,
                  frameBorder: 0,
                  allow: "picture-in-picture",
                  allowFullScreen: true,
                  className: "embed-youtube",
                  width: options.width ? options.width : undefined,
                  height: options.height ? options.height : undefined,
                };
              }
            })
            .catch((err) => console.log(err));
          promises.push(p);
        } else {
          data.hName = "iframe";
          data.hProperties = {
            src: "https://www.youtube.com/embed/" + id,
            frameBorder: 0,
            allow: "picture-in-picture",
            allowFullScreen: true,
            className: "embed-youtube",
            width: options.width ? options.width : undefined,
            height: options.height ? options.height : undefined,
          };
        }
      }
    });
    await Promise.all(promises);
  };
};
