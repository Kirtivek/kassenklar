
import { useState } from 'react'
import axios from 'axios'

interface AddExpenseProps {
  onExpenseAdded: () => void
}

function AddExpense({ onExpenseAdded }: AddExpenseProps) {

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [totalAmount, setTotalAmount] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Format currency
  const formatEuro = (amount: number) => {
    return `€${amount.toFixed(2)}`
  }

  // Submit expense to backend
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault()
    setError('')

    // Validate description
    if (description.trim().length < 2) {
      setError('Please enter a valid expense description.')
      return
    }

    // Validate category
    if (!category) {
      setError('Please select a category.')
      return
    }

    // Validate total amount
    const amount = Number(totalAmount)

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter an amount greater than zero.')
      return
    }

    setLoading(true)

    try {

      await axios.post(
        'http://127.0.0.1:8000/expenses',
        {
          description: description.trim(),
          category: category,

          category_detail:
            category === 'Other'
              ? description.trim()
              : null,

          total_amount: amount,
        }
      )

      // Reset form
      setDescription('')
      setCategory('')
      setTotalAmount('')

      // Refresh dashboard and close modal
      onExpenseAdded()

    } catch (err) {

      setError(
        'Unable to save expense. Please check your entries.'
      )

    } finally {

      setLoading(false)

    }
  }

  return (

    <form
      onSubmit={handleSubmit}
      className="add-expense-form"
    >

      {/* Description */}
      <div className="form-field">

        <label htmlFor="description">
          Expense Description
        </label>

        <input
          id="description"
          type="text"
          placeholder="e.g. Coffee, Groceries, Pet Cost"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          minLength={2}
          maxLength={200}
          required
        />

      </div>

      {/* Category */}
      <div className="form-field">

        <label htmlFor="category">
          Category
        </label>

        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        >

          <option value="" disabled>
            Select a category
          </option>

          <option value="Food & Drinks">Food & Drinks</option>
          <option value="Education">Education</option>
          <option value="Health">Health</option>
          <option value="Home & Bills">Home & Bills</option>
          <option value="Transport">Transport</option>
          <option value="Other">Other</option>

        </select>

      </div>

      {/* Total amount */}
      <div className="form-field">

        <label htmlFor="totalAmount">
          Total Amount (€)
        </label>

        <input
          id="totalAmount"
          type="number"
          placeholder="e.g. 25.00"
          value={totalAmount}
          onChange={(event) => setTotalAmount(event.target.value)}
          min="0.01"
          step="0.01"
          required
        />

        <small>
          Enter the final amount you paid, including VAT.
        </small>

      </div>

      {/* Total preview */}
      <div className="expense-calculation">

        <div className="calculation-row total-row">
          <span>Total Paid</span>
          <strong>
            {formatEuro(Number(totalAmount) || 0)}
          </strong>
        </div>

      </div>

      {/* Error message */}
      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        className="add-button"
        disabled={loading}
      >
        {loading ? 'Saving Expense...' : 'Save Expense'}
      </button>

    </form>

  )
}

export default AddExpense
