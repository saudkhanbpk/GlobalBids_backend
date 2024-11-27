export function extractPublicId(url) {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  const folderPath = parts
    .slice(parts.indexOf("upload") + 1, parts.length - 1)
    .join("/");
  return `${folderPath}/${fileName.split(".")[0]}`;
}
