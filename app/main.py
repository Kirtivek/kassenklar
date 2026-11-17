
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.database import get_db
from app.models import Expense as ExpenseModel
from app.calculations import calculate_vat
from app.schemas import Expense


# --------------------------------------------------
# CREATE FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="KassenKlar",
    description="Expense and VAT Tracking API",
    version="1.0.0"
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HOME ENDPOINT
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to KassenKlar!",
        "status": "Application is running"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# CREATE EXPENSE
# --------------------------------------------------


@app.post("/expenses")
def add_expense(
    expense: Expense,
    db: Session = Depends(get_db)
):
    # The user enters the total amount paid, including VAT
    total_amount = expense.total_amount

    new_expense = ExpenseModel(
        description=expense.description,
        category=expense.category,
        category_detail=(
            expense.description
            if expense.category == "Other"
            else None
        ),
        net_amount=total_amount,
        vat_rate=0,
        vat_amount=0,
        vat_known=False,
        gross_amount=total_amount
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {
        "message": "Expense saved successfully",
        "id": new_expense.id,
        "description": new_expense.description,
        "category": new_expense.category,
        "category_detail": new_expense.category_detail,
        "total_amount": str(new_expense.gross_amount),
        "gross_amount": str(new_expense.gross_amount),
        "created_at": (
            new_expense.created_at.isoformat()
            if new_expense.created_at
            else None
        )
    }

# --------------------------------------------------
# GET ALL EXPENSES
# --------------------------------------------------

@app.get("/expenses")
def get_expenses(
    category: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExpenseModel)

    if category:
        query = query.filter(
            ExpenseModel.category.ilike(category)
        )

    expenses = query.order_by(
        ExpenseModel.created_at.desc()
    ).all()

    result = []

    for expense in expenses:
        result.append({
            "id": expense.id,
            "description": expense.description,
            "category": expense.category,
            "category_detail": expense.category_detail,
            "net_amount": str(expense.net_amount),
            "vat_rate": str(expense.vat_rate),
            "vat_amount": str(expense.vat_amount),
            "gross_amount": str(expense.gross_amount),
            "created_at": (
                expense.created_at.isoformat()
                if expense.created_at
                else None
            )
        })

    return result


# --------------------------------------------------
# UPDATE EXPENSE
# --------------------------------------------------

@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    updated_data: Expense,
    db: Session = Depends(get_db)
):
    expense = db.query(ExpenseModel).filter(
        ExpenseModel.id == expense_id
    ).first()

    if expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    calculation = calculate_vat(
        updated_data.net_amount,
        updated_data.vat_rate
    )

    expense.description = updated_data.description
    expense.category = updated_data.category
    expense.net_amount = calculation["net_amount"]
    expense.vat_rate = calculation["vat_rate"]
    expense.vat_amount = calculation["vat_amount"]
    expense.gross_amount = calculation["gross_amount"]

    db.commit()
    db.refresh(expense)

    return {
        "message": "Expense updated successfully",
        "id": expense.id,
        "description": expense.description,
        "category": expense.category,
        "net_amount": str(expense.net_amount),
        "vat_rate": str(expense.vat_rate),
        "vat_amount": str(expense.vat_amount),
        "gross_amount": str(expense.gross_amount),
        "created_at": (
            expense.created_at.isoformat()
            if expense.created_at
            else None
        )
    }


# --------------------------------------------------
# DELETE EXPENSE
# --------------------------------------------------

@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    expense = db.query(ExpenseModel).filter(
        ExpenseModel.id == expense_id
    ).first()

    if expense is None:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully",
        "id": expense_id
    }


# --------------------------------------------------
# MONTHLY SPENDING ANALYTICS
# --------------------------------------------------

@app.get("/analytics/monthly-spending")
def get_monthly_spending(
    db: Session = Depends(get_db)
):
    current_year = datetime.now().year

    monthly_data = (
        db.query(
            func.strftime(
                "%m",
                ExpenseModel.created_at
            ).label("month"),
            func.sum(
                ExpenseModel.gross_amount
            ).label("total_spending")
        )
        .filter(
            func.strftime(
                "%Y",
                ExpenseModel.created_at
            ) == str(current_year)
        )
        .group_by(
            func.strftime(
                "%m",
                ExpenseModel.created_at
            )
        )
        .all()
    )

    spending_by_month = {
        int(month): float(total or 0)
        for month, total in monthly_data
    }

    month_names = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ]

    result = []

    for month_number, month_name in enumerate(
        month_names,
        start=1
    ):
        result.append({
            "month": f"{current_year}-{month_number:02d}",
            "month_name": month_name,
            "amount": spending_by_month.get(
                month_number, 0
            )
        })

    return result


# --------------------------------------------------
# DASHBOARD SUMMARY ANALYTICS
# --------------------------------------------------

@app.get("/analytics/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    summary = db.query(
        func.sum(
            ExpenseModel.gross_amount
        ).label("total_expenses"),

        func.sum(
            ExpenseModel.vat_amount
        ).filter(
            ExpenseModel.vat_known == True
        ).label("total_vat"),

        func.count(
            ExpenseModel.id
        ).label("total_transactions")

    ).first()

    return {
        "total_expenses": float(
            summary.total_expenses or 0
        ),
        "total_vat": float(
            summary.total_vat or 0
        ),
        "total_transactions": (
            summary.total_transactions or 0
        )
    }



@app.get("/analytics/category-spending")
def get_category_spending(db: Session = Depends(get_db)):

    category_data = (
        db.query(
            ExpenseModel.category.label("category"),
            func.sum(ExpenseModel.gross_amount).label("amount")
        )
        .group_by(ExpenseModel.category)
        .order_by(func.sum(ExpenseModel.gross_amount).desc())
        .all()
    )

    # Convert database results into a list
    categories = [
        {
            "category": category,
            "amount": float(amount or 0)
        }
        for category, amount in category_data
    ]

    # Exclude the existing Other category from the top four
    regular_categories = [
        item for item in categories
        if item["category"] != "Other"
    ]

    # Select the four highest-spending categories
    top_categories = regular_categories[:4]

    top_category_names = {
        item["category"] for item in top_categories
    }

    # Combine all remaining spending into Other
    other_total = sum(
        item["amount"]
        for item in categories
        if item["category"] not in top_category_names
    )

    result = top_categories.copy()

    if other_total > 0:
        result.append({
            "category": "Other",
            "amount": round(other_total, 2)
        })

    return result
