// ============================================================
// NORMALIZER — chuyển RawComment → MarketComment
// Đây là cầu nối giữa Crawler và Classifier
// ============================================================

import { RawComment } from "../types";
import { MarketComment } from "../../market-radar/dataLoader";

export function normalizeComment(raw: RawComment): MarketComment {
  return {
    id: raw.sourceId,
    text: raw.text.trim(),
    source: raw.source as MarketComment["source"],
    date: raw.createdAt.split("T")[0],
    author: raw.author,
    url: raw.postUrl,
    metadata: {
      postId: raw.postId,
      likes: raw.likes,
      ...raw.metadata,
    },
  };
}

export function normalizeComments(raws: RawComment[]): MarketComment[] {
  return raws
    .filter(r => r.text && r.text.trim().length > 5)
    .map(normalizeComment);
}
