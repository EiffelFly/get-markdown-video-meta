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
      title: "Funny Cats and Kittens Meowing Compilation",
      author_name: "funnyplox",
      author_url: "https://www.youtube.com/@funnyplox",
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: "https://i.ytimg.com/vi/DXUAyRRkI6k/hqdefault.jpg",
      html: '<iframe width="200" height="113" src="https://www.youtube.com/embed/DXUAyRRkI6k?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Funny Cats and Kittens Meowing Compilation"></iframe>',
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
      title:
        "Baby Dogs 🔴 Cute and Funny Dog Videos Compilation #4 | 30 Minutes of Funny Puppy Videos 2022",
      author_name: "GrumpyDog",
      author_url: "https://www.youtube.com/@GrumpyDog1",
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: "https://i.ytimg.com/vi/0DPZ9b9ZZr4/hqdefault.jpg",
      html: '<iframe width="200" height="150" src="https://www.youtube.com/embed/0DPZ9b9ZZr4?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen title="Baby Dogs 🔴 Cute and Funny Dog Videos Compilation #4 | 30 Minutes of Funny Puppy Videos 2022"></iframe>',
    },
  ]);
});
