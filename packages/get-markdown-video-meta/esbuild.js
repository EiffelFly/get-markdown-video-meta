const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    outfile: "./build/index.esm.js",
    bundle: true,
    minify: true,
    sourcemap: true,
    target: "esnext",
    format: "esm",
    packages: "external",
    platform: "node",
  })
  .catch(() => process.exit(1));
