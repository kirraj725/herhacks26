"""Security utilities — auth helpers and role-based access checks."""


ROLES = ["admin", "analyst", "auditor", "viewer"]


def check_role(user_role: str, required_role: str) -> bool:
    """Check if user_role meets the minimum required_role level."""
    role_hierarchy = {role: i for i, role in enumerate(ROLES)}
    return role_hierarchy.get(user_role, -1) >= role_hierarchy.get(required_role, 99)
