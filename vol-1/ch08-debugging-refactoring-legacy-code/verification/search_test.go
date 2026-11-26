package verification_test

import (
	"bytes"
	"encoding/json"
	"flag"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"example.com/relay-runbook-lab/internal/corpus"
	"example.com/relay-runbook-lab/solution"
	"example.com/relay-runbook-lab/starter"
)

var implementation = flag.String("implementation", "solution", "handler to use for TestIncident")

const (
	payments  = `{"id":"payments","title":"Payments","snippet":"Start with the dashboard."}`
	rollback  = `{"id":"rollback","title":"Rollback","snippet":"Check the release marker."}`
	alerts    = `{"id":"alerts","title":"Alerts","snippet":"Check the alert dashboard."}`
	databases = `{"id":"databases","title":"Databases","snippet":"Open the database dashboard."}`
)

func request(handler http.Handler, query string) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/runbooks/search?"+query, nil))
	return recorder
}

func checkJSON(t *testing.T, response *httptest.ResponseRecorder, want string) {
	t.Helper()
	if response.Code != http.StatusOK || response.Header().Get("Content-Type") != "application/json" {
		t.Fatalf("got status %d and Content-Type %q", response.Code, response.Header().Get("Content-Type"))
	}
	var gotValue, wantValue any
	if err := json.Unmarshal(response.Body.Bytes(), &gotValue); err != nil {
		t.Fatalf("invalid response JSON: %v", err)
	}
	if err := json.Unmarshal([]byte(want), &wantValue); err != nil {
		t.Fatalf("invalid expected JSON: %v", err)
	}
	if !reflect.DeepEqual(gotValue, wantValue) {
		t.Fatalf("got %s, want %s", bytes.TrimSpace(response.Body.Bytes()), want)
	}
}

func TestCharacterization(t *testing.T) {
	t.Run("starter", func(t *testing.T) {
		checkCharacterization(t, starter.NewHandler(corpus.Sample()))
	})
	t.Run("solution", func(t *testing.T) {
		checkCharacterization(t, solution.NewHandler(corpus.Sample()))
	})
}

func checkCharacterization(t *testing.T, handler http.Handler) {
	t.Helper()
	for _, tc := range []struct{ name, query, want string }{
		{"default limit and order", "q=dashboard", "[" + payments + "," + alerts + "]"},
		{"empty limit uses the default", "q=dashboard&limit=", "[" + payments + "," + alerts + "]"},
		{"explicit limit", "q=dashboard&limit=3", "[" + payments + "," + alerts + "," + databases + "]"},
		{"trimmed mixed-case title", "q=+rOLLback+", "[" + rollback + "]"},
		{"empty results are an array", "q=unmatched", "[]"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			checkJSON(t, request(handler, tc.query), tc.want)
		})
	}
	for _, tc := range []struct{ name, query, want string }{
		{"blank query", "q=+", "q is required\n"},
		{"invalid limit", "q=dashboard&limit=no", "limit must be between 1 and 10\n"},
		{"decimal limit", "q=dashboard&limit=1.0", "limit must be between 1 and 10\n"},
		{"limit below range", "q=dashboard&limit=0", "limit must be between 1 and 10\n"},
		{"limit above range", "q=dashboard&limit=11", "limit must be between 1 and 10\n"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			res := request(handler, tc.query)
			if res.Code != http.StatusBadRequest || res.Body.String() != tc.want {
				t.Fatalf("got %d %q, want 400 %q", res.Code, res.Body.String(), tc.want)
			}
		})
	}
}

func TestIncident(t *testing.T) {
	var handler http.Handler
	switch *implementation {
	case "starter":
		handler = starter.NewHandler(corpus.Sample())
	case "solution":
		handler = solution.NewHandler(corpus.Sample())
	default:
		t.Fatalf("unknown implementation %q", *implementation)
	}
	checkJSON(t, request(handler, "q=failover"), "["+payments+"]")
}
