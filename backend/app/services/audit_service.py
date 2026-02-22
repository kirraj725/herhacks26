"""Audit service — access & export logging, suspicious activity detection."""

from app.services.data_store import DataStore


def get_audit_logs() -> list[dict]:
    """Return all audit log entries."""
    DataStore.ensure_loaded()
    if DataStore.audit_log.empty:
        return []
    return DataStore.audit_log.to_dict(orient="records")


def get_suspicious_access() -> list[dict]:
    """Identify suspicious access patterns (rapid successive accesses)."""
    DataStore.ensure_loaded()
    if DataStore.audit_log.empty:
        return []

    alerts = []
    df = DataStore.audit_log.copy()
    df["timestamp"] = df["timestamp"].astype(str)

    # Flag users with high-frequency access (>3 actions in logs)
    user_counts = df["user_id"].value_counts()
    for user, count in user_counts.items():
        if count >= 4:
            alerts.append({
                "alert_id": f"SEC-{user}",
                "user_id": user,
                "reason": f"High-frequency access: {count} actions logged",
                "severity": "warning" if count < 6 else "critical",
                "action_count": int(count),
            })

    # Flag bulk exports
    exports = df[df["action"] == "export"]
    export_users = exports["user_id"].value_counts()
    for user, count in export_users.items():
        if count >= 2:
            alerts.append({
                "alert_id": f"SEC-EXP-{user}",
                "user_id": user,
                "reason": f"Multiple data exports: {count} exports",
                "severity": "warning",
                "action_count": int(count),
            })

    return alerts


def get_export_logs() -> list[dict]:
    """Return all CSV export log entries."""
    DataStore.ensure_loaded()
    if DataStore.audit_log.empty:
        return []
    exports = DataStore.audit_log[DataStore.audit_log["action"] == "export"]
    return exports.to_dict(orient="records")
