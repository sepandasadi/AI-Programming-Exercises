package corpus

type Runbook struct {
	ID    string
	Title string
	Body  string
}

func Sample() []Runbook {
	return []Runbook{
		{ID: "payments", Title: "Payments", Body: "Start with the dashboard.\nUse regional failover if checkout is unavailable."},
		{ID: "rollback", Title: "Rollback", Body: "Check the release marker.\nRestore the previous revision."},
		{ID: "alerts", Title: "Alerts", Body: "Check the alert dashboard.\nVerify the owner."},
		{ID: "databases", Title: "Databases", Body: "Open the database dashboard.\nCheck replication lag."},
	}
}
