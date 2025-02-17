export function cutDescriptionArticle(description, maxLength) {
  if (!description || typeof description !== "string") {
    return ""; // Если description пустое или не строка, возвращаем пустую строку
  }

  if (description.length <= maxLength) {
    return description;
  }

  let cutText = description.substring(0, maxLength);
  const lastTextIndex = cutText.lastIndexOf(" ");
  if (lastTextIndex !== -1) {
    cutText = cutText.substring(0, lastTextIndex);
  }
  return cutText + "...";
}
