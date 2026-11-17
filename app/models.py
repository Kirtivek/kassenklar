
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean
from datetime import datetime, timezone
from app.database import Base


class Expense(Base):

    # Name of our database table
    __tablename__ = "expenses"

    # Unique ID for every expense
    id = Column(Integer, primary_key=True, index=True)

    # Expense description
    description = Column(String(200), nullable=False)

    # Expense category
    category = Column(String(50), nullable=False)
    category_detail = Column(String(100), nullable=True)

    # Amount before VAT
    net_amount = Column(Numeric(10, 2), nullable=False)

    # VAT percentage
    vat_rate = Column(Numeric(5, 4), nullable=False)

    # VAT amount
    vat_amount = Column(Numeric(10, 2), nullable=False)
    # Whether the VAT amount is known
    vat_known = Column(Boolean, nullable=False, default=True)

    # Amount including VAT
    gross_amount = Column(Numeric(10, 2), nullable=False)

    # Date and time when the expense was created
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
