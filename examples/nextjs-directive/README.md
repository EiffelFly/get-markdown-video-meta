# Nextjs parse markdown directive example

This example showcase how to use `nextjs` and `remark` to host a blog site that use markdown file to generate blog pages and use `get-markdown-video-meta` to generate the videos page.

## How to test

- In this example folder `pnpm dev`
- got to http://localhost:3000/blog/wiki to see the working blog page
- The generated video page lie in 
  - http://localhost:3000/videos/xjOfL_mMWk4
  - http://localhost:3000/videos/JhNczOuhxeg
- You can also run `pnpm build` and find the generated sitemap at `/public` folder