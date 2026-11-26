import type { Runbook } from "../internal/corpus/corpus.mts";

type SearchResult = { id: string; title: string; snippet: string };

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
    const query = url.searchParams.get("q")?.trim().toLowerCase();
    if (!query) {
      return new Response("q is required\n", { status: 400 });
    }

    const rawLimit = url.searchParams.get("limit");
    const limit = rawLimit ? Number(rawLimit) : 2;
    if ((rawLimit && !/^[+-]?\d+$/.test(rawLimit)) || limit < 1 || limit > 10) {
      return new Response("limit must be between 1 and 10\n", { status: 400 });
    }

    const results: SearchResult[] = [];
    for (const { id, title, body } of books) {
      const [snippet = ""] = body.split("\n", 1);
      if (
        !title.toLowerCase().includes(query) &&
        !snippet.toLowerCase().includes(query)
      ) {
        continue;
      }
      results.push({ id, title, snippet });
      if (results.length === limit) break;
    }
    return Response.json(results);
  };
}
