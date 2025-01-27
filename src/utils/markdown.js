export const stripMarkdown = (text) => {
  return text
    .replace(/\!\[.*?\]\(.*?\)/g, "[Image]")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\#+ /g, "")
    .replace(/\- /g, "• ");
};
