package solution

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
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
		query, limit, err := parseSearch(r.URL.Query())
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(search(books, query, limit))
	})
	return mux
}

func parseSearch(params url.Values) (string, int, error) {
	query := strings.ToLower(strings.TrimSpace(params.Get("q")))
	if query == "" {
		return "", 0, errors.New("q is required")
	}

	rawLimit := params.Get("limit")
	if rawLimit == "" {
		return query, 2, nil
	}
	limit, err := strconv.Atoi(rawLimit)
	if err != nil || limit < 1 || limit > 10 {
		return "", 0, errors.New("limit must be between 1 and 10")
	}
	return query, limit, nil
}

func search(books []corpus.Runbook, query string, limit int) []result {
	results := make([]result, 0, limit)
	for _, book := range books {
		if !strings.Contains(strings.ToLower(book.Title), query) &&
			!strings.Contains(strings.ToLower(book.Body), query) {
			continue
		}
		snippet, _, _ := strings.Cut(book.Body, "\n")
		results = append(results, result{
			ID: book.ID, Title: book.Title, Snippet: snippet,
		})
		if len(results) == limit {
			break
		}
	}
	return results
}
