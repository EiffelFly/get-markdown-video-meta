import { join } from "path";
import fs from "fs";
import glob from "fast-glob";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGetYoutubeUrlInDirective from "./remark-get-youtube-url-in-directive.mjs";
import remarkGetYoutubeUrlInMdx from "./remark-get-youtube-url-in-mdx.mjs";
import remarkDirective from "remark-directive";
import remarkMdx from "remark-mdx";
import { consoleLogMessageTitleWithColor } from "./helper.js";

export type MDXComponent = {
  componentName: string;
  propName: "id" | "url" | "href";
};
export type DirectiveComponent = {
  directiveName: string;
  propName: "id" | "url" | "href";
};

export type GetMarkdownVideoMetaOption = {
  targets: string[];
  googleApiKey?: string;
  mdxComponents?: MDXComponent[];
  directiveComponents?: DirectiveComponent[];
  // Log useful information
  verbose?: boolean;
};
export type RichYoutubeMeta = {};

export type SimpifiedYoutubeMeta = {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
};

export async function getMarkdownVideoMeta({
  targets,
  verbose,
  mdxComponents,
  directiveComponents,
  googleApiKey,
}: GetMarkdownVideoMetaOption): Promise<RichYoutubeMeta[]>;
export async function getMarkdownVideoMeta({
  targets,
  verbose,
  directiveComponents,
  mdxComponents,
}: GetMarkdownVideoMetaOption): Promise<SimpifiedYoutubeMeta[]>;
export async function getMarkdownVideoMeta({
  targets,
  verbose,
  mdxComponents,
  googleApiKey,
  directiveComponents,
}: GetMarkdownVideoMetaOption) {
  if (!targets) {
    const error = new Error(
      "Configuration 'targets' not found, please provide the target folder."
    );
    consoleLogMessageTitleWithColor(
      "error",
      "Required configuration not found"
    );
    throw error;
  }

  if (!directiveComponents && !mdxComponents) {
    const error = new Error(
      "You have to either input directiveComponents, mdxComponents prop or both"
    );
    consoleLogMessageTitleWithColor("error", "Wrong configuration");
    throw error;
  }

  // Get all the target file paths
  let fullMdPaths: string[] = [];
  let fullMdxPaths: string[] = [];

  for (const target of targets) {
    const mdPaths = prepareFilePaths(target, "md");
    fullMdPaths.push(...mdPaths);
    const mdxPaths = prepareFilePaths(target, "mdx");
    fullMdxPaths.push(...mdxPaths);
  }

  let fullUrls: string[] = [];

  if (
    fullMdPaths.length > 0 &&
    (!directiveComponents || directiveComponents?.length === 0) &&
    verbose
  ) {
    consoleLogMessageTitleWithColor(
      "info",
      "MD files found but you didn't provide directiveComponents hint, getMarkdownVideoMeta will ignore these MD files"
    );
    console.log(fullMdPaths);
  }

  if (
    fullMdPaths.length > 0 &&
    directiveComponents &&
    directiveComponents.length > 0
  ) {
    for (const path of fullMdPaths) {
      const urls = await prepareMdVideoUrl(path, directiveComponents);
      fullUrls.push(...urls);
    }
  }

  if (
    fullMdxPaths.length > 0 &&
    (!mdxComponents || mdxComponents?.length === 0) &&
    verbose
  ) {
    consoleLogMessageTitleWithColor(
      "info",
      "MDX files found but you didn't provide mdxComponents hint, getMarkdownVideoMeta will ignore these MDX files"
    );
    console.log(fullMdxPaths);
  }

  if (fullMdxPaths.length > 0 && mdxComponents && mdxComponents.length > 0) {
    for (const path of fullMdxPaths) {
      try {
        const urls = await prepareMdxVideoUrl(path, mdxComponents);
        fullUrls.push(...urls);
      } catch (err) {
        consoleLogMessageTitleWithColor("error", err);
      }
    }
  }

  if (verbose) {
    consoleLogMessageTitleWithColor("info", "Found these URLs");
    console.log(fullUrls);
  }

  if (!googleApiKey) {
    let metas: SimpifiedYoutubeMeta[] = [];
    let notFoundUrls: string[] = [];
    for (const url of fullUrls) {
      try {
        const meta = await getSimplifiedYoutubeMeta(url);
        if (!meta) {
          notFoundUrls.push(url);
          continue;
        }
        metas.push(meta);
      } catch (err) {
        consoleLogMessageTitleWithColor("error", err);
      }
    }

    if (notFoundUrls.length > 0 && verbose) {
      consoleLogMessageTitleWithColor("info", "Can't find these URLs' meta");
      console.log(notFoundUrls);
    }

    return Promise.resolve(metas);
  }

  return Promise.resolve([]);
}

const prepareFilePaths = (
  target: string,
  extension: "mdx" | "md"
): string[] => {
  const folder = join(process.cwd(), target);
  return glob.sync(`**/*.${extension}`, { cwd: folder, absolute: true });
};

const prepareMdVideoUrl = async (
  path: string,
  directiveComponents: DirectiveComponent[]
): Promise<string[]> => {
  try {
    const source = fs.readFileSync(path, "utf8");
    let videoUrls: string[] = [];

    await remark()
      .use(remarkFrontmatter)
      .use(remarkDirective)
      .use(remarkGetYoutubeUrlInDirective, { videoUrls, directiveComponents })
      .process(source);

    return Promise.resolve(videoUrls);
  } catch (err) {
    return Promise.reject(err);
  }
};

const prepareMdxVideoUrl = async (
  path: string,
  mdxComponents: MDXComponent[]
): Promise<string[]> => {
  try {
    const source = fs.readFileSync(path, "utf8");
    let videoUrls: string[] = [];

    await remark()
      .use(remarkMdx)
      .use(remarkGetYoutubeUrlInMdx, { videoUrls, mdxComponents })
      .process(source);

    return Promise.resolve(videoUrls);
  } catch (err) {
    return Promise.reject(err);
  }
};

type GetSimplifiedYoutubeMetaResponse = {
  title: string;
  author_name: string;
  author_url: string;
  type: string;
  height: number;
  width: number;
  version: string;
  provider_name: string;
  provider_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
};

const getSimplifiedYoutubeMeta = async (url: string) => {
  try {
    const res = await fetch(
      `https://youtube.com/oembed?url=${url}&format=json`,
      { method: "GET" }
    );

    if (res.status === 404) {
      return;
    }

    const data = (await res.json()) as GetSimplifiedYoutubeMetaResponse;

    const meta: SimpifiedYoutubeMeta = {
      title: data.title,
      author_name: data.author_name,
      author_url: data.author_url,
      thumbnail_height: data.thumbnail_height,
      thumbnail_width: data.thumbnail_width,
      thumbnail_url: data.thumbnail_url,
      html: data.html,
    };

    return meta;
  } catch (err) {
    return Promise.reject(err);
  }
};
