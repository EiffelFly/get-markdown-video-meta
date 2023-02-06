# Get markdown video meta

Get your video's metadata in the markdown or mdx file. Powered by remarkjs, fully typed.

## What is it.

Normally, you will embed your video (Youtube) into markdown like this:

```md
In markdown file with directive

::youtube{id=DXUAyRRkI6k}

or

::youtube{url=https://youtu.be/0DPZ9b9ZZr4}
```

Or you could use MDX to inject component into markdown syntax directly:

```mdx
export const Youtube = ({ url }) => <iframe src={url} ...>Youtbue</iframe>;

<Youtube url="https://youtu.be/0DPZ9b9ZZr4" />
```

This tool utilize remark to find these url link and request video provider's api to get their metadata.

## When should I use this.

One of the situation is encountering "Google could not determine the prominent video on the page" when Google try to index your video content on your website [^1]. The solution of this issue is to create a dedicated page only for this video [^2]. In order to do this, you can use this tool to help you retrieve video meta data and generate pages using the data.

## How to use.

### Dependencies

This tool relys on these dependencies, you have to install them:

```json
{
  "fast-glob": "^3.2.12",
  "remark": "^14.0.2",
  "remark-directive": "^2.0.1",
  "remark-frontmatter": "^4.0.1",
  "remark-mdx": "^2.2.1",
  "unist-util-visit": "^4.1.2"
}
```

Then you can import the named export of this tool.

```ts
import { getMarkdownVideoMeta } from "get-markdown-video-meta"

const meta = getMarkdownVideoMeta({
  targets: ["/blog"],
  mdxComponents: [{ componentName: "Youtube", propName: "url" }],
});
```

### Configuration

#### `targets`

- type: Array of string
- required: true
- description: The target folder that your md/mdx files live. It can be multiple folders.
- example: `["/blog"]`

#### `mdxComponents	`

- type: array of `{ componentName: string; propName: "id" | "url" | "href"; }`
- required: either mdxComponents or directiveComponents exists
- description: Array of mdxComponent that your mdx file is using
- example: Take the mdx file below for example, the componentName will be `Youtube` and the propName will be `url`

```mdx
---
title: youtube-blog-post-mdx
---

export const Youtube = ({ url }) => <div url={url}>Youtube</div>;

<Youtube url="https://youtu.be/0DPZ9b9ZZr4" />
```

#### `directiveComponents`

- type: array of `{ directiveName: string; propName: "id" | "url" | "href"; }`
- required: either mdxComponents or directiveComponents exists
- description: Array of directive that your md file is using
- example: Take the md file below for example, the componentName will be `youtube` and the propName will be `url`

```md
---
title: youtube-blog-post-directive
---

::youtube{id=DXUAyRRkI6k}
```

#### `googleApiKey`

- type: string
- required: false
- description: If this key is in present, we will directly request Google API for much richer information of youtube videos. (Implementing)

#### `verbose`

- type: boolean
- required: false (default)
- description: Display useful debug info

### Response video meta

```ts
// Currrently, we only support simplified youtube meta coming from oembed api
export type SimpifiedYoutubeMeta = {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
};
```

## License

MIT

[^1]: [Video indexing report](https://support.google.com/webmasters/answer/9495631)
[^2]: [Video SEO best practices#Help Google find your videos](https://developers.google.com/search/docs/appearance/video#help-google-find)