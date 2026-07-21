"""HTTP boundary of the analytics service (FastAPI + Pydantic v2).

Internal-only service: never internet-facing (docs/SECURITY.md, docs/ARCHITECTURE.md rule 1).
It is reached exclusively by ``apps/api``, which owns authentication and role enforcement;
endpoint role declarations therefore live at the gateway. This service is stateless pure
computation over the request body and holds no credentials, no tenant data, and no client
state.
"""
