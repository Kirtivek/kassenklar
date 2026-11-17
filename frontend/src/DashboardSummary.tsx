
import { useEffect, useState } from 'react'
import axios from 'axios'

interface DashboardSummaryData {
  total_expenses: number
  total_vat: number
  total_transactions: number
}

function DashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get<DashboardSummaryData>(
        'http://127.0.0.1:8000/analytics/summary'
      )
      .then((response) => {
        setSummary(response.data)
      })
      .catch(() => {
        setError('Unable to load dashboard summary.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading dashboard summary...</p>
  }

  if (error || !summary) {
    return <p>{error || 'No summary data available.'}</p>
  }

  return (
    <div className="summary-grid">
      <div className="summary-card expense-card">
        <span>Total Expenses</span>
        <h2>€{summary.total_expenses.toFixed(2)}</h2>
      </div>

      <div className="summary-card transaction-card">
        <span>Total Transactions</span>
        <h2>{summary.total_transactions.toString().padStart(2, '0')}</h2>
      </div>
    </div>
  )
}

export default DashboardSummary
