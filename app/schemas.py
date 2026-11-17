
from pydantic import BaseModel, Field


class Expense(BaseModel):
    description: str = Field(min_length=2, max_length=200)

    category: str = Field(min_length=2, max_length=50)

    category_detail: str | None = Field(
        default=None,
        max_length=100
    )

    total_amount: float = Field(gt=0)
