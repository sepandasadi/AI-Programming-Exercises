package starter

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"example.com/relay-runbook-lab/internal/corpus"
)

type result struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Snippet string `json:"snippet"`
}

func NewHandler(books []corpus.Runbook) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /runbooks/search", func(w http.ResponseWriter, r *http.Request) {
		query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
		if query == "" {
			http.Error(w, "q is required", http.StatusBadRequest)
			return
		}

		limit := 2
		if raw := r.URL.Query().Get("limit"); raw != "" {
			parsed, err := strconv.Atoi(raw)
			if err != nil || parsed < 1 || parsed > 10 {
				http.Error(w, "limit must be between 1 and 10", http.StatusBadRequest)
				return
			}
			limit = parsed
		}

		results := make([]result, 0, limit)
		for _, book := range books {
			snippet, _, _ := strings.Cut(book.Body, "\n")
			if !strings.Contains(strings.ToLower(book.Title), query) &&
				!strings.Contains(strings.ToLower(snippet), query) {
				continue
			}
			results = append(results, result{
				ID: book.ID, Title: book.Title, Snippet: snippet,
			})
			if len(results) == limit {
				break
			}
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(results)
	})
	return mux
}
