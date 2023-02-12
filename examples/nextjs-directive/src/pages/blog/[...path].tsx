import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { join } from "path";
import glob from "fast-glob";
import fs from "fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import remarkDirective from "remark-directive";
import rehypeStringify from "rehype-stringify";
import { remarkYoutube } from "@/lib/remark-youtube";
import rehypeFormat from "rehype-format";

export type BlogPageProps = {
  html: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const blogDir = join(process.cwd(), "blog");
  const blogRelativePaths = glob.sync("**/*.md", { cwd: blogDir });

  return {
    paths: blogRelativePaths.map((path) => ({
      params: {
        path: path.replace(".md", "").split("/"),
      },
    })),

    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async ({
  params,
}) => {
  if (!params || !params.path) {
    return {
      notFound: true,
    };
  }

  let fullPath: string;

  if (Array.isArray(params.path)) {
    fullPath = join(process.cwd(), "blog", ...params.path);
  } else {
    fullPath = join(process.cwd(), "blog", params.path);
  }

  const source = fs.readFileSync(fullPath + ".md", "utf8");

  const html = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkDirective)
    .use(remarkYoutube, { validateYoutubeLink: false, width: 600, height: 400 })
    .use(remarkRehype)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(source);

  return {
    props: {
      html: String(html),
    },
  };
};

const BlogPage = ({ html }: BlogPageProps) => {
  return (
    <>
      <Head>
        <title>Blog Page</title>
        <meta name="description" content="Blog Page Example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </main>
    </>
  );
};

export default BlogPage;
