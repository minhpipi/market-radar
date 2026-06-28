import { NextRequest, NextResponse } from "next/server";
import { crawlFacebookPost } from "@/src/lib/crawlers/facebook/facebookCrawler";
import { normalizeComments } from "@/src/lib/crawlers/normalizer/normalizer";
import { classify } from "@/src/lib/market-radar/classifier";

export async function POST(req: NextRequest) {
  try {
    const { url, maxComments = 50 } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Thiếu URL" }, { status: 400 });
    }

    const apiToken = process.env.APIFY_API_TOKEN || "";
    if (!apiToken) {
      return NextResponse.json({ error: "Chưa cấu hình APIFY_API_TOKEN" }, { status: 500 });
    }

    const crawlResult = await crawlFacebookPost(url, apiToken, maxComments);

    if (!crawlResult.success) {
      return NextResponse.json({ error: crawlResult.error }, { status: 400 });
    }

    const normalized = normalizeComments(crawlResult.comments);
    const classified = normalized.map(c => ({ ...c, ...classify(c.text) }));

    const forceCount: Record<string, number> = {};
    classified.forEach(c => {
      if (c.marketForce) forceCount[c.marketForce] = (forceCount[c.marketForce] || 0) + 1;
    });

    const signalCount: Record<string, number> = {};
    classified.forEach(c => {
      signalCount[c.signal] = (signalCount[c.signal] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      url,
      totalComments: crawlResult.totalFound,
      classifiedCount: classified.filter(c => c.marketForce).length,
      crawledAt: crawlResult.crawledAt,
      forceBreakdown: Object.entries(forceCount)
        .sort((a, b) => b[1] - a[1])
        .map(([force, count]) => ({
          force, count,
          pct: Math.round((count / crawlResult.totalFound) * 100),
        })),
      signalBreakdown: Object.entries(signalCount).sort((a, b) => b[1] - a[1]),
      comments: classified.slice(0, 20),
    });

  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Lỗi không xác định",
    }, { status: 500 });
  }
}
