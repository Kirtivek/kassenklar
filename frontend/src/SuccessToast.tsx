
import { useEffect } from 'react'

interface SuccessToastProps {
  message: string
  onClose: () => void
}

function SuccessToast({ message, onClose }: SuccessToastProps) {

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onClose()
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div className="success-toast">

      <div className="toast-icon">
        ✓
      </div>

      <div className="toast-content">
        <strong>Expense saved successfully!</strong>
        <p>{message}</p>
      </div>

      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>

    </div>
  )
}

export default SuccessToast
