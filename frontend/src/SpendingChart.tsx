
import { useEffect, useState } from 'react'
import axios from 'axios'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Shape of the data returned by our Python API
interface MonthlySpending {
  month: string
  month_name: string
  amount: number
}

function SpendingChart() {

  // Store monthly spending data
  const [spendingData, setSpendingData] = useState<MonthlySpending[]>([])

  // Track whether data is loading
  const [loading, setLoading] = useState(true)

  // Store any API error
  const [error, setError] = useState('')

  // Fetch monthly spending when the component loads
  useEffect(() => {

    const fetchSpendingData = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await axios.get<MonthlySpending[]>(
          'http://127.0.0.1:8000/analytics/monthly-spending'
        )

        setSpendingData(response.data)

      } catch (err) {
        console.error('Error fetching monthly spending:', err)
        setError('Unable to load spending data. Please check your backend.')

      } finally {
        setLoading(false)
      }
    }

    fetchSpendingData()

  }, [])

  // Show loading message
  if (loading) {
    return (
      <div className="chart-message">
        Loading your spending analytics...
      </div>
    )
  }

  // Show error message
  if (error) {
    return (
      <div className="chart-message chart-error">
        {error}
      </div>
    )
  }

  // Show message if there are no expenses
  if (spendingData.length === 0) {
    return (
      <div className="chart-message">
        No spending data available yet.
      </div>
    )
  }

  // Convert YYYY-MM into a readable month label


  return (
    <div className="spending-chart">

      <ResponsiveContainer width="100%" height="100%">

        <AreaChart
          data={spendingData}
          margin={{
            top: 15,
            right: 15,
            left: 5,
            bottom: 5,
          }}
        >

          <defs>
            <linearGradient
              id="spendingGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#168c83"
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor="#168c83"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e8eeee"
          />

          <XAxis
            dataKey="month_name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#829198', fontSize: 11 }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#829198', fontSize: 11 }}
            tickFormatter={(value) => `€${value}`}
          />

          <Tooltip
            formatter={(value) => [
              `€${Number(value).toFixed(2)}`,
              'Spending',
            ]}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5eeee',
              boxShadow: '0 5px 20px #20374415',
            }}
          />

          <Area
            type="monotone"
            dataKey="amount"
            stroke="#168c83"
            strokeWidth={3}
            fill="url(#spendingGradient)"
            activeDot={{
              r: 6,
              fill: '#168c83',
              stroke: '#ffffff',
              strokeWidth: 3,
            }}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  )
}

export default SpendingChart
