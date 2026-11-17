
from sqlalchemy import inspect, text

from app.database import engine, Base
from app import models

# Create tables that do not exist yet
Base.metadata.create_all(bind=engine)

# Get the existing column names
inspector = inspect(engine)
columns = {
    column["name"]
    for column in inspector.get_columns("expenses")
}

# Add created_at if it is missing
if "created_at" not in columns:
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE expenses ADD COLUMN created_at DATETIME")
        )

        connection.execute(
            text(
                "UPDATE expenses "
                "SET created_at = CURRENT_TIMESTAMP "
                "WHERE created_at IS NULL"
            )
        )

    print("created_at column added successfully!")
else:
    print("created_at column already exists!")

# Verify the final table structure
inspector = inspect(engine)

print("Database location:", engine.url.database)
print("Expenses table columns:")

for column in inspector.get_columns("expenses"):
    print(column["name"])
