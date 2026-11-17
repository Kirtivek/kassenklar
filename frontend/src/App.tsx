import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import SuccessToast from './SuccessToast'
import AddExpense from './AddExpense'
import SpendingChart from './SpendingChart'
import DashboardSummary from './DashboardSummary'

interface Expense {
  id: number
  description: string
  category: string
  category_detail: string | null
  net_amount: string
  vat_rate: string
  vat_amount: string
  gross_amount: string
  created_at: string | null
}

interface CategorySpending {
  category: string
  amount: number
}

interface MonthlySpending {
  month: string
  month_name: string
  amount: number
}

function App() {
  const [transactions, setTransactions] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([])
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  // Transactions page controls
  const [transactionSearch, setTransactionSearch] = useState('')
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All')
  const [transactionSort, setTransactionSort] = useState('newest')

  const transactionCategories = [
    'Food & Drinks',
    'Education',
    'Health',
    'Home & Bills',
    'Transport',
    'Other',
  ]

  const [summaryRefresh, setSummaryRefresh] = useState(0)
  const [toastMessage, setToastMessage] = useState('')
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])

  // Category chart colours
  const categoryColorMap: Record<string, string> = {
    'Food & Drinks': '#168c83',
    Education: '#9b87d5',
    Health: '#5b9bd5',
    'Home & Bills': '#f29a62',
    Transport: '#8ba65b',
    Other: '#d66b9b',
  }

  // Fetch category spending
  const fetchCategorySpending = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/analytics/category-spending'
      )
      setCategorySpending(response.data)
    } catch (error) {
      console.error('Error fetching category spending:', error)
    }
  }

  // Fetch monthly spending analytics
const fetchMonthlySpending = async () => {
  try {
    const response = await axios.get<MonthlySpending[]>(
      'http://127.0.0.1:8000/analytics/monthly-spending'
    )

    setMonthlySpending(response.data)
  } catch (error) {
    console.error('Error fetching monthly spending:', error)
  }
}
  // Fetch transactions
  const fetchExpenses = () => {
    setLoading(true)
    setError('')

    axios
      .get<Expense[]>('http://127.0.0.1:8000/expenses')
      .then((response) => {
        setTransactions(response.data)
      })
      .catch(() => {
        setError('Unable to load recent transactions.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

 // Load data when the app opens
useEffect(() => {
  fetchExpenses()
  fetchCategorySpending()
  fetchMonthlySpending()
}, [])

  // Format Euro amounts
  const formatEuro = (amount: string) => {
    return `€${Number(amount).toFixed(2)}`
  }

  // Format dates
  const formatDate = (date: string | null) => {
    if (!date) return '—'

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Refresh data after adding an expense
  const handleExpenseAdded = () => {
    setShowAddExpense(false)
    fetchExpenses()
    fetchCategorySpending()
    setSummaryRefresh((previous) => previous + 1)

    setToastMessage(
      'Your expense has been added to your transactions.'
    )
  }

  // Calculate total category spending
  const totalCategorySpending = categorySpending.reduce(
    (total, item) => total + item.amount,
    0
  )

  // Generate donut chart gradient
  let accumulatedPercentage = 0

  const categoryGradient =
    totalCategorySpending > 0
      ? `conic-gradient(${categorySpending
          .map((item) => {
            const start = accumulatedPercentage

            accumulatedPercentage +=
              (item.amount / totalCategorySpending) * 100

            const color =
              categoryColorMap[item.category] ?? '#9ca3af'

            return `${color} ${start}% ${accumulatedPercentage}%`
          })
          .join(', ')})`
      : '#e8eeee'

  // Search and filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(transactionSearch.toLowerCase())

    const matchesCategory =
      selectedFilterCategory === 'All' ||
      transaction.category === selectedFilterCategory

    return matchesSearch && matchesCategory
  })

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (transactionSort === 'newest') {
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      )
    }

    if (transactionSort === 'oldest') {
      return (
        new Date(a.created_at || 0).getTime() -
        new Date(b.created_at || 0).getTime()
      )
    }

    if (transactionSort === 'highest') {
      return Number(b.gross_amount) - Number(a.gross_amount)
    }

    return Number(a.gross_amount) - Number(b.gross_amount)
  })

  // Average transaction amount
  const averageTransactionAmount =
    transactions.length > 0
      ? transactions.reduce(
          (total, transaction) =>
            total + Number(transaction.gross_amount),
          0
        ) / transactions.length
      : 0

  // Category-specific transactions
  const selectedTransactions = transactions.filter(
    (transaction) => transaction.category === selectedCategory
  )

  const categoryTotal = selectedTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.gross_amount),
    0
  )

  // Analytics calculations
    const analyticsTotal = monthlySpending.reduce(
      (total, month) => total + month.amount,
      0
    )

    const averageMonthlySpending = analyticsTotal / 12

    const highestSpendingCategory =
      [...categorySpending].sort(
        (a, b) => b.amount - a.amount
      )[0]
    // Reusable expense modal
  const expenseModal = showAddExpense && (
    <div
      className="modal-overlay"
      onClick={() => setShowAddExpense(false)}
    >
      <div
        className="expense-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">KASSENKLAR · EXPENSES</p>
            <h2>Add New Expense</h2>
            <p>Record and categorize your expense.</p>
          </div>

          <button
            className="modal-close"
            type="button"
            onClick={() => setShowAddExpense(false)}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <AddExpense onExpenseAdded={handleExpenseAdded} />
        </div>
      </div>
    </div>
  )

  // Reusable sidebar
  const sidebar = (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">K</div>
        <div>
          <h2>KassenKlar</h2>
          <p>Expenses · VAT · Clarity</p>
        </div>
      </div>

      <p className="nav-label">WORKSPACE</p>

      <nav className="navigation">
        <a
          className={`nav-link ${
            activePage === 'dashboard' && !selectedCategory ? 'active' : ''
          }`}
          onClick={() => {
            setActivePage('dashboard')
            setSelectedCategory(null)
          }}
        >
          ▦ Dashboard
        </a>

        <a
          className={`nav-link ${
            activePage === 'transactions' ? 'active' : ''
          }`}
          onClick={() => {
            setActivePage('transactions')
            setSelectedCategory(null)
          }}
        >
          ▤ Transactions
        </a>

        <a
          className={`nav-link ${activePage === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            setActivePage('analytics')
            setSelectedCategory(null)
          }}
        >
  ▥ Analytics
</a>
        <a className="nav-link">◇ Categories</a>
        <a className="nav-link">⚙ Settings</a>
      </nav>

      <div className="sidebar-footer">
        <div className="profile-avatar">K</div>
        <div>
          <strong>My Workspace</strong>
          <p>Personal Account</p>
        </div>
      </div>
    </aside>
  )

  // Reusable transaction table
  const transactionTable = (items: Expense[]) => (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
            <th>Total Amount</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={5}>Loading transactions...</td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td colSpan={5}>{error}</td>
            </tr>
          )}

          {!loading && !error && items.length === 0 && (
            <tr>
              <td colSpan={5}>No transactions found.</td>
            </tr>
          )}

          {!loading &&
            !error &&
            items.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.description}</td>

                <td>
                  <span className="category-badge">
                    {transaction.category === 'Other' &&
                    transaction.category_detail
                      ? `Other (${transaction.category_detail})`
                      : transaction.category}
                  </span>
                </td>

                <td>{formatDate(transaction.created_at)}</td>

                <td>
                  {transaction.created_at
                    ? new Date(transaction.created_at).toLocaleTimeString(
                        'de-DE',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )
                    : '—'}
                </td>

                <td className="total-amount">
                  {formatEuro(transaction.gross_amount)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )

  // Category page colour themes
  const categoryThemes: Record<
    string,
    { className: string; icon: string; subtitle: string }
  > = {
    'Food & Drinks': {
      className: 'food-theme',
      icon: '🥑',
      subtitle: 'Your spending, served at a glance.',
    },
    Education: {
      className: 'education-theme',
      icon: '📚',
      subtitle: 'Investing in knowledge and learning.',
    },
    Health: {
      className: 'health-theme',
      icon: '💙',
      subtitle: 'Keeping track of your wellbeing expenses.',
    },
    'Home & Bills': {
      className: 'home-theme',
      icon: '🏡',
      subtitle: 'Everything that keeps your home running.',
    },
    Transport: {
      className: 'transport-theme',
      icon: '🚆',
      subtitle: 'Your travel and transportation expenses.',
    },
    Other: {
      className: 'other-theme',
      icon: '✨',
      subtitle: 'Everything else, neatly organised.',
    },
  }

  // Fixed: handle null selectedCategory safely
  const currentTheme =
  categoryThemes[selectedCategory ?? 'Other'] ?? categoryThemes.Other

  const categoryAverage =
    selectedTransactions.length > 0
      ? categoryTotal / selectedTransactions.length
      : 0

  // Selected category page
  if (selectedCategory) {
    return (
      <div className="app-shell">
        {sidebar}

        <main className="main-content category-page">
          <header className="topbar">
            <div>
              <p className="eyebrow">YOUR CATEGORY REPORT</p>
              <h1>{selectedCategory}</h1>
              <p className="subtitle">
                Explore your spending in this category.
              </p>
            </div>

            <button
              className="add-button"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back to Dashboard
            </button>
          </header>

          {/* Colourful category banner */}
          <section className={`category-hero ${currentTheme.className}`}>
            <div className="category-hero-content">
              <span className="category-hero-icon">
                {currentTheme.icon}
              </span>

              <div>
                <p>YOUR SPENDING SNAPSHOT</p>
                <h2>{selectedCategory}</h2>
                <span>{currentTheme.subtitle}</span>
              </div>
            </div>

            <div className="category-hero-total">
              <span>Total spent</span>
              <strong>€{categoryTotal.toFixed(2)}</strong>
              <small>
                {selectedTransactions.length} recorded transactions
              </small>
            </div>
          </section>

                  {/* Category summary cards */}
          <section className="category-stats-grid">
            <div className="category-stat-card category-total-card">
              <div className="category-stat-icon">💰</div>
              <div>
                <p>Total Expenses</p>
                <h2>€{categoryTotal.toFixed(2)}</h2>
                <span>Across all transactions</span>
              </div>
            </div>

            <div className="category-stat-card category-average-card">
              <div className="category-stat-icon">📊</div>
              <div>
                <p>Average per Transaction</p>
                <h2>€{categoryAverage.toFixed(2)}</h2>
                <span>Average expense amount</span>
              </div>
            </div>
          </section>

          {/* Category transaction history */}
          <section className="panel transactions-panel category-history-panel">
            <div className="panel-header">
              <div>
                <h2>Transaction History</h2>
                <p>
                  All your {selectedCategory.toLowerCase()} transactions
                </p>
              </div>

              <span className="category-record-count">
                {selectedTransactions.length} records
              </span>
            </div>

            {transactionTable(selectedTransactions)}
          </section>
        </main>
      </div>
    )
  }

  // Analytics page
if (activePage === 'analytics') {
  return (
    <div className="app-shell">
      {sidebar}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">FINANCIAL INSIGHTS</p>
            <h1>Analytics</h1>
            <p className="subtitle">
              Understand your spending and financial habits.
            </p>
          </div>
        </header>

        <section className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <p>Total Spending</p>
            <h2>€{analyticsTotal.toFixed(2)}</h2>
            <span>Current year</span>
          </div>

          <div className="analytics-summary-card">
            <p>Average Monthly Spending</p>
            <h2>€{averageMonthlySpending.toFixed(2)}</h2>
            <span>Monthly average</span>
          </div>

          <div className="analytics-summary-card">
            <p>Highest Spending Category</p>
            <h2>
              {highestSpendingCategory
                ? highestSpendingCategory.category
                : 'No data yet'}
            </h2>
            <span>
              {highestSpendingCategory
                ? `€${highestSpendingCategory.amount.toFixed(2)} spent`
                : 'Add expenses to see insights'}
            </span>
          </div>
        </section>

        <section className="panel spending-panel">
          <div className="panel-header">
            <div>
              <h2>Monthly Spending Trend</h2>
              <p>Your spending throughout the year</p>
            </div>
            <span className="period-label">This year</span>
          </div>

          <SpendingChart />
        </section>

        <section className="panel category-panel">
          <div className="panel-header">
            <div>
              <h2>Category Spending Breakdown</h2>
              <p>Compare your expenses by category</p>
            </div>
          </div>

          <div className="category-list">
            {categorySpending.map((item) => (
              <div
                className="category-clickable"
                key={item.category}
                onClick={() => setSelectedCategory(item.category)}
              >
                <span
                  style={{
                    color:
                      categoryColorMap[item.category] ?? '#9ca3af',
                  }}
                >
                  ● {item.category}
                </span>

                <strong>€{item.amount.toFixed(2)}</strong>
              </div>
            ))}

            {categorySpending.length === 0 && (
              <p>No category expenses yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

  // Complete Transactions page
  if (activePage === 'transactions') {
    return (
      <div className="app-shell">
        {sidebar}

        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="eyebrow">YOUR FINANCES</p>
              <h1>Transactions</h1>
              <p className="subtitle">
                Review and manage all your recorded expenses.
              </p>
            </div>

            <button
              className="add-button"
              onClick={() => setShowAddExpense(true)}
            >
              + Add Expense
            </button>
          </header>

          {expenseModal}

          <section className="transactions-page">
            {/* Summary cards */}
            <div className="transaction-summary-grid">
              <div className="transaction-summary-card">
                <div className="summary-icon teal-icon">€</div>
                <div>
                  <p>Total Expenses</p>
                  <h2>
                    {formatEuro(
                      String(
                        transactions.reduce(
                          (total, item) =>
                            total + Number(item.gross_amount),
                          0
                        )
                      )
                    )}
                  </h2>
                </div>
              </div>

              <div className="transaction-summary-card">
                <div className="summary-icon purple-icon">▤</div>
                <div>
                  <p>Transactions</p>
                  <h2>{transactions.length}</h2>
                </div>
              </div>

              <div className="transaction-summary-card">
                <div className="summary-icon peach-icon">↗</div>
                <div>
                  <p>Average per Transaction</p>
                  <h2>
                    {formatEuro(String(averageTransactionAmount))}
                  </h2>
                </div>
              </div>
            </div>

            {/* Transaction history */}
            <section className="panel transactions-panel">
              <div className="panel-header transaction-history-header">
                <div>
                  <h2>All Transactions</h2>
                  <p>
                    {filteredTransactions.length} matching transactions
                  </p>
                </div>

                <div className="transaction-sort">
                  <label htmlFor="transaction-sort">Sort by</label>

                  <select
                    id="transaction-sort"
                    value={transactionSort}
                    onChange={(event) => {
                      setTransactionSort(event.target.value)
                    }}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest">Highest amount</option>
                    <option value="lowest">Lowest amount</option>
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="transaction-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={transactionSearch}
                  onChange={(event) => {
                    setTransactionSearch(event.target.value)
                  }}
                />
              </div>

              {/* Category filters */}
              <div className="transaction-filters">
                <button
                  className={
                    selectedFilterCategory === 'All'
                      ? 'filter-pill selected'
                      : 'filter-pill'
                  }
                  onClick={() => {
                    setSelectedFilterCategory('All')
                  }}
                >
                  All ({transactions.length})
                </button>

                {transactionCategories.map((category) => {
                  const count = transactions.filter(
                    (item) => item.category === category
                  ).length

                  return (
                    <button
                      key={category}
                      className={
                        selectedFilterCategory === category
                          ? 'filter-pill selected'
                          : 'filter-pill'
                      }
                      onClick={() => {
                        setSelectedFilterCategory(category)
                      }}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Scrollable transactions table */}
              <div className="transaction-scroll-area">
                {transactionTable(sortedTransactions)}
              </div>
            </section>
          </section>
        </main>
      </div>
    )
  }
    // Main Dashboard
  return (
    <div className="app-shell">
      {/* Success notification */}
      {toastMessage && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}

      {sidebar}

      <main className="main-content">
        {/* Dashboard header */}
        <header className="topbar">
          <div>
            <p className="eyebrow">
              FINANCIAL OVERVIEW · NOVEMBER 2026
            </p>

            <h1>
              Welcome to <span>KassenKlar</span>
            </h1>

            <p className="subtitle">
              Manage your expenses and keep your finances clear.
            </p>
          </div>

          <button
            className="add-button"
            onClick={() => setShowAddExpense(true)}
          >
            + Add Expense
          </button>
        </header>

        {/* Financial summary */}
        <DashboardSummary key={summaryRefresh} />

        {/* Add Expense modal */}
        {expenseModal}

        {/* Analytics */}
        <section className="analytics-grid">
          {/* Monthly spending */}
          <div className="panel spending-panel">
            <div className="panel-header">
              <div>
                <h2>Monthly Spending</h2>
                <p>Your spending throughout the year</p>
              </div>

              <span className="period-label">This year</span>
            </div>

            <SpendingChart />
          </div>

          {/* Category spending */}
          <div className="panel category-panel">
            <div className="panel-header">
              <div>
                <h2>Spending by Category</h2>
                <p>Where your money goes</p>
              </div>
            </div>

            <div className="category-content">
              <div
                className="donut-chart"
                style={{ background: categoryGradient }}
              >
                <div className="donut-center">
                  <strong>
                    €{totalCategorySpending.toFixed(2)}
                  </strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="category-list">
                {categorySpending.map((item) => (
                  <div
                    key={item.category}
                    className="category-clickable"
                    onClick={() => setSelectedCategory(item.category)}
                    title={`View ${item.category} transactions`}
                  >
                    <span
                      style={{
                        color:
                          categoryColorMap[item.category] ?? '#9ca3af',
                      }}
                    >
                      ● {item.category}
                    </span>

                    <strong>€{item.amount.toFixed(2)}</strong>
                  </div>
                ))}

                {categorySpending.length === 0 && (
                  <p>No category expenses yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section className="panel transactions-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest recorded expenses</p>
            </div>

            <button
              className="view-all-button"
              onClick={() => setActivePage('transactions')}
            >
              <u>View all →</u>
            </button>
          </div>

          {transactionTable(transactions.slice(0, 5))}
        </section>
      </main>
    </div>
  )
}

export default App