
from sqlalchemy import text

from app.database import engine

with engine.begin() as connection:

    # Merge Food and Drink into Food & Drinks
    connection.execute(
        text("""
            UPDATE expenses
            SET category = 'Food & Drinks'
            WHERE category IN ('Food', 'Drink')
        """)
    )

    # Rename Home to Home & Bills
    connection.execute(
        text("""
            UPDATE expenses
            SET category = 'Home & Bills'
            WHERE category = 'Home'
        """)
    )

    # Move Cloths into Other and add a detail
    connection.execute(
        text("""
            UPDATE expenses
            SET category = 'Other',
                category_detail = 'Clothing'
            WHERE category = 'Cloths'
        """)
    )

print("Category migration completed successfully!")
