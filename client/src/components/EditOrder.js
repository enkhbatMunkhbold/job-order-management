import { useContext, useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserContext from '../context/UserContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import '../styling/newOrder.css'

const EditOrder = () => {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { user, refreshUser } = useContext(UserContext)
  const [ originalStartDate, setOriginalStartDate ] = useState('')
  const [ hasStartDateChanged, setHasStartDateChanged ] = useState(false)

  const order = user.orders.find(or => or.id === parseInt(orderId))

  // Store the original start date when component mounts
  useEffect(() => {
    if (order?.start_date) {
      const originalDate = new Date(order.start_date).toISOString().split('T')[0]
      setOriginalStartDate(originalDate)
    }
  }, [order])

  // Create dynamic validation schema based on current state
  const validationSchema = useMemo(() => {
    return Yup.object({
      description: Yup.string()
        .min(5, 'Description must be at least 5 characters')
        .required('Description is required'),
      rate: Yup.string()
        .min(10, 'Rate must be at least 10 characters')
        .required('Rate is required'),
      location: Yup.string()
        .min(10, 'Location must be at least 10 characters')
        .required('Location is required'),
      start_date: Yup.date()
        .required('Start date is required'),
      due_date: Yup.date()
        .min(Yup.ref('start_date'), 'Due date must be after start date')
        .required('Due date is required'),
      status: Yup.string()
        .oneOf(['pending', 'in progress', 'completed', 'canceled'], 'Invalid status')
        .required('Status is required')
    })
  }, [])

  const formik = useFormik({
    initialValues: {
      description: order?.description || '',
      rate: order?.rate || '',
      location: order?.location || '',
      start_date: order?.start_date ? new Date(order.start_date).toISOString().split('T')[0] : '',
      due_date: order?.due_date ? new Date(order.due_date).toISOString().split('T')[0] : '',
      status: order?.status || 'pending'
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Convert dates to ISO string format for server
        const submitData = {
          ...values,
          start_date: values.start_date ? new Date(values.start_date).toISOString().split('T')[0] : null,
          due_date: values.due_date ? new Date(values.due_date).toISOString().split('T')[0] : null
        }
        
        // console.log('Submitting values:', submitData) // Debug log
        
        const response = await fetch(`/orders/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(submitData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          // console.log('Server error response:', errorData) // Debug log
          throw new Error(errorData.error || errorData.message || JSON.stringify(errorData))
        }

        await refreshUser()
        navigate('/profile')
      } catch (err) {
        console.error('Error updating order:', err)
        console.error('Error details:', err.message)
        alert('Failed to update order: ' + err.message)
      }
    }
  })

  // Track if start date has been changed
  const handleStartDateChange = (e) => {
    const newDate = e.target.value
    setHasStartDateChanged(newDate !== originalStartDate)
    formik.handleChange(e)
  }

  return (
    <div className="new-order-container">
      <div className="new-order-header">
        <h1>Edit Order</h1>
        <button onClick={() => navigate('/profile')} className="back-button">
          Back to Profile
        </button>
      </div>

      <div className="new-order-content">
        <form onSubmit={formik.handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              placeholder="Enter order description..."
              className={formik.touched.description && formik.errors.description ? 'error' : ''}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="error-message">{formik.errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rate">Rate *</label>
            <input
              type="text"
              id="rate"
              name="rate"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.rate}
              placeholder="Enter rate..."
              className={formik.touched.rate && formik.errors.rate ? 'error' : ''}
            />
            {formik.touched.rate && formik.errors.rate && (
              <div className="error-message">{formik.errors.rate}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.location}
              placeholder="Enter location..."
              className={formik.touched.location && formik.errors.location ? 'error' : ''}
            />
            {formik.touched.location && formik.errors.location && (
              <div className="error-message">{formik.errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              onChange={handleStartDateChange}
              onBlur={formik.handleBlur}
              value={formik.values.start_date}
              className={formik.touched.start_date && formik.errors.start_date ? 'error' : ''}
            />
            {formik.touched.start_date && formik.errors.start_date && (
              <div className="error-message">{formik.errors.start_date}</div>
            )}
            {hasStartDateChanged && (
              <div className="info-message">
                Note: You've changed the start date. New dates must be in the future.
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.due_date}
              className={formik.touched.due_date && formik.errors.due_date ? 'error' : ''}
            />
            {formik.touched.due_date && formik.errors.due_date && (
              <div className="error-message">{formik.errors.due_date}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.status}
              className={formik.touched.status && formik.errors.status ? 'error' : ''}
            >
              <option value="pending">Pending</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
            </select>
            {formik.touched.status && formik.errors.status && (
              <div className="error-message">{formik.errors.status}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/profile')} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Update Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditOrder 