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

export type VideoProvider = "youtube" | "vimeo";

export type GetMarkdownVideoMetaOption = {
  // Vimeo is still under developing, we only support youtube right now.
  provider: VideoProvider;
  targets: string[];

  mdxComponents?: MDXComponent[];
  directiveComponents?: DirectiveComponent[];

  // Log useful information
  verbose?: boolean;
  googleApiKey?: string;
  vimeoClient?: string;
  vimeoSecret?: string;
};

export type GetMarkdownVideoMetaReturn<T, K> = T extends "youtube"
  ? K extends undefined
    ? SimpifiedYoutubeMeta[]
    : RichYoutubeMeta[]
  : T extends "vimeo"
  ? []
  : never;

export type VimeoMeta = {};

export type SimpifiedYoutubeMeta = {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_height: number;
  thumbnail_width: number;
  thumbnail_url: string;
  html: string;
};

export type RichYoutubeMeta = {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet: {
    publishedAt: any;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction: {
      allowed: string[];

      blocked: string[];
    };
    contentRating: {
      acbRating: string;
      agcomRating: string;
      anatelRating: string;
      bbfcRating: string;
      bfvcRating: string;
      bmukkRating: string;
      catvRating: string;
      catvfrRating: string;
      cbfcRating: string;
      cccRating: string;
      cceRating: string;
      chfilmRating: string;
      chvrsRating: string;
      cicfRating: string;
      cnaRating: string;
      cncRating: string;
      csaRating: string;
      cscfRating: string;
      czfilmRating: string;
      djctqRating: string;
      djctqRatingReasons: string[];
      ecbmctRating: string;
      eefilmRating: string;
      egfilmRating: string;
      eirinRating: string;
      fcbmRating: string;
      fcoRating: string;
      fmocRating: string;
      fpbRating: string;
      fpbRatingReasons: string[];
      fskRating: string;
      grfilmRating: string;
      icaaRating: string;
      ifcoRating: string;
      ilfilmRating: string;
      incaaRating: string;
      kfcbRating: string;
      kijkwijzerRating: string;
      kmrbRating: string;
      lsfRating: string;
      mccaaRating: string;
      mccypRating: string;
      mcstRating: string;
      mdaRating: string;
      medietilsynetRating: string;
      mekuRating: string;
      mibacRating: string;
      mocRating: string;
      moctwRating: string;
      mpaaRating: string;
      mpaatRating: string;
      mtrcbRating: string;
      nbcRating: string;
      nbcplRating: string;
      nfrcRating: string;
      nfvcbRating: string;
      nkclvRating: string;
      oflcRating: string;
      pefilmRating: string;
      rcnofRating: string;
      resorteviolenciaRating: string;
      rtcRating: string;
      rteRating: string;
      russiaRating: string;
      skfilmRating: string;
      smaisRating: string;
      smsaRating: string;
      tvpgRating: string;
      ytRating: string;
    };
    projection: string;
    hasCustomThumbnail: boolean;
  };
  status: {
    uploadStatus: string;
    failureReason: string;
    rejectionReason: string;
    privacyStatus: string;
    publishAt: any;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
    selfDeclaredMadeForKids: boolean;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  localizations: Record<string, { title: string; description: string }>;
};

export async function getMarkdownVideoMeta<
  T extends GetMarkdownVideoMetaOption
>(
  options: T
): Promise<GetMarkdownVideoMetaReturn<T["provider"], T["googleApiKey"]>> {
  const {
    provider,
    targets,
    mdxComponents,
    directiveComponents,
    verbose,
    googleApiKey,
    vimeoClient,
    vimeoSecret,
  } = options;

  if (provider === "vimeo") {
    return Promise.resolve(
      [] as GetMarkdownVideoMetaReturn<T["provider"], T["googleApiKey"]>
    );
  }

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
        consoleLogMessageTitleWithColor(
          "error",
          "Request youtube oembed error"
        );
        console.log(err);
      }
    }

    if (notFoundUrls.length > 0 && verbose) {
      consoleLogMessageTitleWithColor("info", "Can't find these URLs' meta");
      console.log(notFoundUrls);
    }

    return Promise.resolve(
      metas as GetMarkdownVideoMetaReturn<T["provider"], T["googleApiKey"]>
    );
  } else {
    let metas: RichYoutubeMeta[] = [];
    let notFoundUrls: string[] = [];
    for (const url of fullUrls) {
      try {
        const meta = await getRichYoutubeMeta(url, googleApiKey);
        if (!meta) {
          notFoundUrls.push(url);
          continue;
        }
        metas.push(meta);
      } catch (err) {
        consoleLogMessageTitleWithColor("error", "Request google api error");
        console.log(err);
      }
    }

    if (notFoundUrls.length > 0 && verbose) {
      consoleLogMessageTitleWithColor("info", "Can't find these URLs' meta");
      console.log(notFoundUrls);
    }

    return Promise.resolve(
      metas as GetMarkdownVideoMetaReturn<T["provider"], T["googleApiKey"]>
    );
  }
}

const prepareFilePaths = (
  target: string,
  extension: "mdx" | "md"
): string[] => {
  const folder = join(process.cwd(), target);
  console.log(folder);
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

type GetRichYoutubeMetaResponse = {
  kind: "youtube#videoListResponse";
  etag: string;
  items: RichYoutubeMeta[];
  pageInfo: { totalResults: number; resultsPerPage: number };
};

const getRichYoutubeMeta = async (url: string, googleApiKey: string) => {
  try {
    const youtubeId = getYoutubeIdFromUrl(url);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${googleApiKey}&part=snippet,statistics,status,contentDetails,localizations&id=${youtubeId}`,
      { method: "GET" }
    );

    if (res.status === 404) {
      return;
    }

    const data = (await res.json()) as GetRichYoutubeMetaResponse;

    return data.items[0];
  } catch (err) {
    return Promise.reject(err);
  }
};

const getYoutubeIdFromUrl = (url: string): null | string => {
  let regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  let youtubeId = url.match(regex);

  if (youtubeId !== null) {
    return youtubeId[1];
  } else {
    return null;
  }
};
