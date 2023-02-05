export const consoleLogMessageTitleWithColor = (
  type: "warn" | "error" | "info",
  title: any
) => {
  switch (type) {
    case "warn":
      console.log("\n");
      console.log(
        "\x1b[33m\x1b[43m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_WARN: ",
        title
      );
      break;

    case "error":
      console.log("\n");
      console.log(
        "\x1b[37m\x1b[41m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_ERROR:",
        title
      );
      break;

    case "info":
      console.log("\n");
      console.log(
        "\x1b[34m\x1b[100m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_INFO:",
        title
      );
      break;

    default:
      console.log(title);
  }
};
