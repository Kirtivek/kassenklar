
from sqlalchemy import inspect, text

from app.database import engine

inspector = inspect(engine)

columns = [
    column["name"]
    for column in inspector.get_columns("expenses")
]

if "vat_known" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE expenses "
                "ADD COLUMN vat_known BOOLEAN NOT NULL DEFAULT 1"
            )
        )
    print("Database updated: vat_known added.")
else:
    print("Database already has vat_known.")

if "category_detail" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE expenses "
                "ADD COLUMN category_detail VARCHAR(100)"
            )
        )

    print("Database updated: category_detail added.")
else:
    print("Database already has category_detail.")
