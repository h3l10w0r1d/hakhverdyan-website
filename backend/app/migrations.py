"""Minimal auto-migration: adds columns that exist on the SQLAlchemy models but
not yet in the database. No Alembic — the schema is small and this project has
no history of destructive column changes, only additive ones. Runs on every
startup; each ALTER is idempotent (skipped if the column already exists)."""

from sqlalchemy import inspect, text

# SQLAlchemy Column -> a SQL type/default clause usable in ALTER TABLE ADD COLUMN.
# Keep this in sync with any new nullable/defaulted column added to models.py.
_COLUMN_DDL = {
    ("products", "sort_order"): "INTEGER NOT NULL DEFAULT 0",
    ("products", "image"): "TEXT",
    ("quote_requests", "customer_id"): "INTEGER",
    # Existing posts were already live, so they backfill as published — only
    # posts created after this migration default to draft (see BlogPost.status).
    ("blog_posts", "status"): "TEXT NOT NULL DEFAULT 'published'",
}


def run_migrations(engine, Base):
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table in Base.metadata.tables.values():
            if table.name not in existing_tables:
                continue  # a brand-new table — create_all() already handled it
            existing_columns = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing_columns:
                    continue
                ddl = _COLUMN_DDL.get((table.name, column.name))
                if not ddl:
                    continue
                conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {column.name} {ddl}'))
