import { GetStaticPaths, GetStaticProps } from "next";
import { join } from "path";
import glob from "fast-glob";
import fs from "fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkHtml from "remark-html";
import Head from "next/head";

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
    .use(remarkHtml, { sanitize: true })
    .use(remarkFrontmatter)
    .process(source);

  return {
    props: {
      html: html.toString(),
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
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </>
  );
};

export default BlogPage;
