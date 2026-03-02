export function shuffle(arr) {
  // Fisher-Yates shuffle without mutating the input array.
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function decodeHtml(html) {
  // OpenTDB returns HTML-encoded strings, so we need to decode them for display
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Shared category labels for setup, scores, and leaderboards.
export const CATEGORY_NAMES = {
  9: "General",
  10: "Books",
  11: "Film",
  12: "Music",
  13: "Musicals & Theatre",
  14: "Television",
  15: "Video Games",
  17: "Nature",
  18: "Computers",
  19: "Mathematics",
  20: "Mythology",
  21: "Sports",
  22: "Geography",
  23: "History",
  24: "Politics",
  25: "Art",
  26: "Celebrities",
  27: "Animals",
  29: "Comics",
  31: "Anime & Manga",
  32: "Cartoons",
  33: "Board Games"
};
