import type { Runbook } from "../internal/corpus/corpus.mts";

type SearchResult = { id: string; title: string; snippet: string };
type SearchOptions = { query: string; limit: number } | { error: string };

export function createHandler(books: readonly Runbook[]) {
  return (request: Request): Response => {
    const url = new URL(request.url);
    if (url.pathname !== "/runbooks/search") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { allow: "GET" },
      });
    }
    const options = parseSearch(url.searchParams);
    if ("error" in options) {
      return new Response(`${options.error}\n`, { status: 400 });
    }
    return Response.json(search(books, options.query, options.limit));
  };
}

function parseSearch(params: URLSearchParams): SearchOptions {
  const query = params.get("q")?.trim().toLowerCase();
  if (!query) return { error: "q is required" };

  const rawLimit = params.get("limit");
  const limit = rawLimit ? Number(rawLimit) : 2;
  if ((rawLimit && !/^[+-]?\d+$/.test(rawLimit)) || limit < 1 || limit > 10) {
    return { error: "limit must be between 1 and 10" };
  }
  return { query, limit };
}

function search(
  books: readonly Runbook[],
  query: string,
  limit: number,
): SearchResult[] {
  const results: SearchResult[] = [];
  for (const { id, title, body } of books) {
    const titleMatches = title.toLowerCase().includes(query);
    if (!titleMatches && !body.toLowerCase().includes(query)) {
      continue;
    }
    const [snippet = ""] = body.split("\n", 1);
    results.push({ id, title, snippet });
    if (results.length === limit) break;
  }
  return results;
}
