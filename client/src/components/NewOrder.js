import { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import UserContext from '../context/UserContext'
import JobsContext from '../context/JobsContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import '../styling/newOrder.css'

const NewOrder = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useContext(UserContext)
  const { jobs } = useContext(JobsContext)
  const [ clients, setClients ] = useState([])
  const [ searchParams ] = useSearchParams()

  // Get job_id from URL query parameter
  const jobId = searchParams.get('job')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setClients(user.clients || [])
  }, [user, navigate])

  const job = jobs.find(j => j.id === parseInt(jobId)) || {}

  // Function to add event to Google Calendar
  const addToGoogleCalendar = (startDate, dueDate, description, location, clientName) => {
    if (!startDate) {
      alert('Please select a start date first');
      return;
    }

    // Format the dates for Google Calendar
    const startDateTime = new Date(startDate);
    const dueDateTime = new Date(dueDate);
    
    // Set default times (9 AM for start, 5 PM for due date)
    startDateTime.setHours(9, 0, 0, 0);
    dueDateTime.setHours(17, 0, 0, 0);

    // Create Google Calendar URL with all form data
    const eventDetails = {
      text: `Start: ${job.title} - ${description}`,
      dates: `${startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/Z/${dueDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/Z`,
      details: `Job: ${job.title}\nDescription: ${description}\nClient: ${clientName}\nLocation: ${location}\nStart Date: ${new Date(startDate).toLocaleDateString()}\nDue Date: ${new Date(dueDate).toLocaleDateString()}\nDuration: ${job.duration || 'Not specified'}`,
      location: location,
      trp: false,
      sf: true,
      output: 'xml'
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}&sf=true&output=xml`;

    // Open Google Calendar in new tab
    window.open(googleCalendarUrl, '_blank');
  };

  const formik = useFormik({
    initialValues: {
      description: "",
      rate: "",
      location: "",
      start_date: "",
      due_date: "",
      status: "pending",
      client_id: ""
    },
    validationSchema: Yup.object({
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
        .min(new Date(), 'Start date must be in the future')
        .required('Start date is required'),
      due_date: Yup.date()
        .min(Yup.ref('start_date'), 'Due date must be after start date')
        .required('Due date is required'),
      status: Yup.string()
        .oneOf(['pending', 'in progress', 'completed', 'canceled'], 'Invalid status')
        .required('Status is required'),
      client_id: Yup.number()
        .required('Client is required')
    }),
    onSubmit: (values) => {
      const orderData = {
        ...values,
        job_id: parseInt(jobId),
        client_id: parseInt(values.client_id)
      }

      fetch('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'Failed to create order')
          })
        }
        return res.json()
      })
      .then(data => {
        console.log('Order created successfully:', data)
        refreshUser().then(() => {
          navigate('/profile')
        })        
      })
      .catch(err => {
        console.error('Error creating order:', err.message)
      })
    }
  })

  // Get selected client name for calendar event
  const selectedClient = clients.find(client => client.id === parseInt(formik.values.client_id));

  if (!job.id) {
    return (
      <div className="error-container">
        <div className="error">Job not found</div>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="new-order-container">
      <div className="new-order-header">
        <h1>Create New Order</h1>
        <button onClick={() => navigate('/home')} className="back-button">
          Back to Home
        </button>
      </div>

      <div className="new-order-content">
        <div className="selected-job-info">
          <h2>Selected Job: {job.title}</h2>
          <div className="job-details">
            <p><strong>Category:</strong> {job.category}</p>
            <p><strong>Description:</strong> {job.description}</p>
            {job.duration && (
              <p><strong>Duration:</strong> {job.duration}</p>
            )}
          </div>
        </div>
        
        <form onSubmit={formik.handleSubmit} className="order-form">
          <div className="form-group">
            <label htmlFor="client_id">Client *</label>
            <select
              id="client_id"
              name="client_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.client_id}
              placeholder="Select a client"
              className={formik.touched.client_id && formik.errors.client_id ? 'error' : ''}
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {formik.touched.client_id && formik.errors.client_id && (
              <div className="error-message">{formik.errors.client_id}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Order Description *</label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              placeholder="Describe the specific work to be done..."
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
              placeholder="e.g., $50 per hour"
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
              placeholder="e.g., Remote work with meetings in New York, NY"
              className={formik.touched.location && formik.errors.location ? 'error' : ''}
            />
            {formik.touched.location && formik.errors.location && (
              <div className="error-message">{formik.errors.location}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date *</label>
            <div className="date-input-container">
              <input
                type="date"
                id="start_date"
                name="start_date"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.start_date}
                min={new Date().toISOString().split('T')[0]}
                className={formik.touched.start_date && formik.errors.start_date ? 'error' : ''}
              />
              {formik.values.start_date && formik.values.due_date && formik.values.description && formik.values.location && selectedClient && (
                <button
                  type="button"
                  className="calendar-button"
                  onClick={() => addToGoogleCalendar(
                    formik.values.start_date,
                    formik.values.due_date,
                    formik.values.description,
                    formik.values.location,
                    selectedClient.name
                  )}
                  title="Add to Google Calendar"
                >
                  📅 Add to Calendar
                </button>
              )}
            </div>
            {formik.touched.start_date && formik.errors.start_date && (
              <div className="error-message">{formik.errors.start_date}</div>
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
              min={formik.values.start_date || new Date().toISOString().split('T')[0]}
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
            <button type="submit" className="submit-button" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Creating Order...' : 'Create Order'}
            </button>
            <button type="button" onClick={() => navigate('/home')} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewOrder