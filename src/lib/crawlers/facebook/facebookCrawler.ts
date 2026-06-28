// ============================================================
// FACEBOOK CRAWLER — dùng Apify Facebook Comments Scraper
// Actor ID: apify/facebook-comments-scraper
// ============================================================

import { RawComment, CrawlResult } from "../types";

const APIFY_ACTOR_ID = "apify/facebook-comments-scraper";
const APIFY_BASE_URL = "https://api.apify.com/v2";

// ── Apify response shape ──────────────────────────────────────────────────
interface ApifyComment {
  id: string;
  postId?: string;
  text: string;
  authorName: string;
  authorId?: string;
  timestamp?: string;
  date?: string;
  likesCount?: number;
  url?: string;
  postUrl?: string;
}

// ── Chạy Actor và đợi kết quả ────────────────────────────────────────────
async function runApifyActor(
  postUrl: string,
  apiToken: string,
  maxComments: number = 100
): Promise<ApifyComment[]> {

  // 1. Khởi động Actor
  const startRes = await fetch(
    `${APIFY_BASE_URL}/acts/${APIFY_ACTOR_ID}/runs?token=${apiToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: postUrl }],
        maxComments,
        includeNestedComments: true,
        viewOption: "RANKED_UNFILTERED",
      }),
    }
  );

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Apify start failed: ${err}`);
  }

  const startData = await startRes.json();
  const runId = startData.data?.id;
  if (!runId) throw new Error("Không lấy được Run ID từ Apify");

  // 2. Đợi Actor chạy xong (poll mỗi 3 giây, tối đa 2 phút)
  let attempts = 0;
  while (attempts < 40) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiToken}`
    );
    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === "SUCCEEDED") break;
    if (status === "FAILED" || status === "ABORTED") {
      throw new Error(`Apify run ${status}: ${statusData.data?.statusMessage}`);
    }

    attempts++;
  }

  if (attempts >= 40) throw new Error("Apify timeout sau 2 phút");

  // 3. Lấy kết quả từ dataset
  const datasetId = startData.data?.defaultDatasetId;
  const dataRes = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiToken}&clean=true`
  );

  if (!dataRes.ok) throw new Error("Không lấy được dataset từ Apify");

  return await dataRes.json();
}

// ── Normalize Apify comment → RawComment ─────────────────────────────────
function normalizeApifyComment(
  item: ApifyComment,
  postUrl: string
): RawComment {
  return {
    source: "facebook",
    sourceId: item.id || `fb_${Date.now()}_${Math.random()}`,
    postId: item.postId || postUrl,
    postUrl: item.postUrl || postUrl,
    author: item.authorName || "Ẩn danh",
    text: item.text || "",
    createdAt: item.timestamp || item.date || new Date().toISOString(),
    likes: item.likesCount,
    metadata: {
      authorId: item.authorId,
      url: item.url,
    },
  };
}

// ── Hàm chính — crawl 1 URL Facebook ─────────────────────────────────────
export async function crawlFacebookPost(
  url: string,
  apiToken: string,
  maxComments: number = 100
): Promise<CrawlResult> {

  const crawledAt = new Date().toISOString();

  // Validate URL
  if (!url.includes("facebook.com")) {
    return {
      success: false,
      source: "facebook",
      url,
      totalFound: 0,
      comments: [],
      error: "URL không hợp lệ — phải là link Facebook",
      crawledAt,
    };
  }

  try {
    const rawItems = await runApifyActor(url, apiToken, maxComments);

    const comments = rawItems
      .filter(item => item.text && item.text.trim().length > 0)
      .map(item => normalizeApifyComment(item, url));

    return {
      success: true,
      source: "facebook",
      url,
      totalFound: comments.length,
      comments,
      crawledAt,
    };

  } catch (error) {
    return {
      success: false,
      source: "facebook",
      url,
      totalFound: 0,
      comments: [],
      error: error instanceof Error ? error.message : "Unknown error",
      crawledAt,
    };
  }
}
