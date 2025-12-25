export const getIcon = (name: string) => {
  const lower = name.toLowerCase();
  const ext = name.split(".").pop()?.toLowerCase();

  // Specific mappings based on the provided image and seti-icons availability
  if (lower === "package.json") return "json.svg";
  if (lower === "bun.lock" || lower === "package-lock.json") return "json.svg";
  if (lower === "tsconfig.json" || lower === "tsconfig.node.json")
    return "tsconfig.svg";
  if (lower.includes("vite.config")) return "vite.svg";
  if (lower.startsWith(".eslintrc")) return "eslint.svg";
  if (lower === ".gitignore") return "git_ignore.svg";
  if (lower === "readme.md") return "markdown.svg";
  if (lower === "index.html") return "html.svg";
  if (lower === "yarn.lock") return "lock.svg";

  // Extension mappings
  switch (ext) {
    case "ts":
      return "typescript.svg";
    case "tsx":
      return "react.svg";
    case "js":
      return "javascript.svg";
    case "jsx":
      return "javascript.svg";
    case "json":
      return "json.svg";
    case "html":
      return "html.svg";
    case "css":
      return "css.svg";
    case "scss":
      return "sass.svg";
    case "md":
      return "markdown.svg";
    case "svg":
      return "svg.svg";
    case "yml":
      return "yml.svg";
    case "yaml":
      return "yml.svg";
    case "xml":
      return "xml.svg";
    case "png":
      return "image.svg";
    case "jpg":
      return "image.svg";
    case "jpeg":
      return "image.svg";
    case "gif":
      return "image.svg";
    case "lock":
      return "lock.svg";
    default:
      return "default.svg";
  }
};
