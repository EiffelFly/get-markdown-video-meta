import assert from "node:assert/strict";
import test from "node:test";
import { getMarkdownVideoMeta } from ".";

test("Should get the meta from youtube-directive example", async () => {
  const meta = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["data/youtube-directive/blog"],
    directiveComponents: [{ directiveName: "youtube", propName: "id" }],
  });

  assert.deepStrictEqual(meta, [
    {
      id: "DXUAyRRkI6k",
      title: "Funny Cats and Kittens Meowing Compilation",
      author_name: "funnyplox",
      author_url: "https://www.youtube.com/@funnyplox",
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: "https://i.ytimg.com/vi/DXUAyRRkI6k/hqdefault.jpg",
      html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/DXUAyRRkI6k?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Funny Cats and Kittens Meowing Compilation"></iframe>',
      url: "https://www.youtube.com/watch?v=DXUAyRRkI6k",
    },
  ]);
});

test("Should get the meta from youtube-mdx example", async () => {
  const meta = await getMarkdownVideoMeta({
    provider: "youtube",
    targets: ["data/youtube-mdx/blog"],
    mdxComponents: [{ componentName: "Youtube", propName: "url" }],
  });

  assert.deepStrictEqual(meta, [
    {
      id: "DXUAyRRkI6k",
      title: "Funny Cats and Kittens Meowing Compilation",
      author_name: "funnyplox",
      author_url: "https://www.youtube.com/@funnyplox",
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: "https://i.ytimg.com/vi/DXUAyRRkI6k/hqdefault.jpg",
      html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/DXUAyRRkI6k?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Funny Cats and Kittens Meowing Compilation"></iframe>',
      url: "https://youtu.be/DXUAyRRkI6k",
    },
  ]);
});
