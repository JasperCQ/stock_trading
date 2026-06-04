import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { fetchAshareQuotes, summarizeMarket } from "@/lib/stocks";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await fetchAshareQuotes();
  return NextResponse.json({
    quotes,
    summary: summarizeMarket(quotes),
    updatedAt: new Date().toISOString()
  });
}
