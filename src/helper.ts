export const consoleLogWithColor = (
  type: "warn" | "error" | "info",
  message: string
) => {
  switch (type) {
    case "warn":
      console.log("\n");
      console.log(
        "\x1b[33m\x1b[43m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_WARN: "
      );
      console.log(message);
      break;

    case "error":
      console.log("\n");
      console.log(
        "\x1b[37m\x1b[41m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_ERROR:"
      );
      console.log(message);
      break;
    case "info":
      console.log("\n");
      console.log(
        "\x1b[34m\x1b[100m%s\x1b[0m",
        "GET_MARKDOWN_VIDEO_META_INFO:"
      );
      console.log(message);
      break;
    default:
      console.log(message);
  }
};
