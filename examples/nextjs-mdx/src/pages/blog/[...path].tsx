import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { join } from "path";
import glob from "fast-glob";
import fs from "fs";

export type BlogPageProps = {
  source: string;
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

  return {
    props: {
      source: "",
    },
  };
};

const BlogPage = ({ source }: BlogPageProps) => {
  return (
    <>
      <Head>
        <title>Blog Page</title>
        <meta name="description" content="Blog Page Example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container"></div>
      </main>
    </>
  );
};

export default BlogPage;
