export type StockQuote = {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  turnover: number;
  volume: number;
};

export const defaultWatchlist = [
  "1.000001",
  "1.600519",
  "0.300750",
  "0.002594",
  "1.601318",
  "0.000858"
];

const fallbackQuotes: StockQuote[] = [
  { code: "000001", name: "平安银行", price: 10.82, changePercent: 0.84, turnover: 1120000000, volume: 1024000 },
  { code: "600519", name: "贵州茅台", price: 1468.2, changePercent: -0.31, turnover: 1980000000, volume: 13500 },
  { code: "300750", name: "宁德时代", price: 213.52, changePercent: 1.26, turnover: 2430000000, volume: 114200 },
  { code: "002594", name: "比亚迪", price: 249.75, changePercent: 0.58, turnover: 1750000000, volume: 70100 },
  { code: "601318", name: "中国平安", price: 46.12, changePercent: -0.19, turnover: 830000000, volume: 179800 },
  { code: "000858", name: "五粮液", price: 132.6, changePercent: 0.42, turnover: 920000000, volume: 69400 }
];

type EastMoneyQuote = {
  f12: string;
  f14: string;
  f2: number;
  f3: number;
  f5: number;
  f6: number;
};

export function normalizeAshareSymbol(input: string) {
  const code = input.trim().replace(/\D/g, "");

  if (!/^\d{6}$/.test(code)) {
    return null;
  }

  if (code.startsWith("6")) {
    return `1.${code}`;
  }

  if (code.startsWith("0") || code.startsWith("3")) {
    return `0.${code}`;
  }

  if (code.startsWith("8") || code.startsWith("4")) {
    return `0.${code}`;
  }

  return null;
}

export function normalizeWatchlist(symbols: string[]) {
  const normalized = symbols
    .map(normalizeAshareSymbol)
    .filter((symbol): symbol is string => Boolean(symbol));

  return Array.from(new Set(normalized)).slice(0, 30);
}

export async function fetchAshareQuotes(symbols = defaultWatchlist): Promise<StockQuote[]> {
  const watchlist = symbols.length > 0 ? symbols : defaultWatchlist;
  const fields = "f12,f14,f2,f3,f5,f6";
  const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=${fields}&secids=${watchlist.join(",")}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 30 },
      headers: {
        referer: "https://quote.eastmoney.com/"
      }
    });

    if (!response.ok) {
      throw new Error(`EastMoney returned ${response.status}`);
    }

    const payload = (await response.json()) as { data?: { diff?: EastMoneyQuote[] } };
    const quotes = payload.data?.diff ?? [];

    if (quotes.length === 0) {
      return fallbackQuotes;
    }

    return quotes.map((quote) => ({
      code: quote.f12,
      name: quote.f14,
      price: quote.f2,
      changePercent: quote.f3,
      volume: quote.f5,
      turnover: quote.f6
    }));
  } catch {
    return fallbackQuotes;
  }
}

export function summarizeMarket(quotes: StockQuote[]) {
  const gainers = quotes.filter((quote) => quote.changePercent > 0).length;
  const losers = quotes.filter((quote) => quote.changePercent < 0).length;
  const turnover = quotes.reduce((total, quote) => total + quote.turnover, 0);
  const averageChange =
    quotes.reduce((total, quote) => total + quote.changePercent, 0) / Math.max(quotes.length, 1);

  return {
    gainers,
    losers,
    turnover,
    averageChange
  };
}
