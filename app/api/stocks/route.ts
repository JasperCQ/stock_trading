import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { fetchAshareQuotes, normalizeWatchlist, summarizeMarket } from "@/lib/stocks";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const symbols = normalizeWatchlist(searchParams.get("symbols")?.split(",") ?? []);
  const quotes = await fetchAshareQuotes(symbols);

  return NextResponse.json({
    quotes,
    summary: summarizeMarket(quotes),
    updatedAt: new Date().toISOString()
  });
}
