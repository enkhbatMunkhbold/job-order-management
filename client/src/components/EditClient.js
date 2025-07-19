import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserContext from '../context/UserContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import '../styling/newClient.css'

const EditClient = () => {
  const navigate = useNavigate()
  const { clientId } = useParams()
  const { user, refreshUser } = useContext(UserContext)
  const [ client, setClient ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState(null)

  useEffect(() => {
    if (user && user.clients && clientId) {
      const foundClient = user.clients.find(c => c.id === parseInt(clientId))
      if (foundClient) {
        setClient(foundClient)
        setLoading(false)
      } else {
        setError('Client not found')
        setLoading(false)
      }
    }
  }, [user, user?.clients, clientId])

  const formik = useFormik({
    initialValues: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      address: client?.address || '',
      notes: client?.notes || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(30, 'Name must be 30 characters or less')
        .matches(/^[a-zA-Z0-9\s\-']+$/, 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters')
        .max(60, 'Email must be 60 characters or less')
        .required('Email is required'),
      phone: Yup.string()
        .matches(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be in format: ###-###-####')
        .required('Phone is required'),
      company: Yup.string()
        .min(2, 'Company must be at least 2 characters')
        .max(100, 'Company must be less than 100 characters'),
      address: Yup.string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be less than 200 characters'),
      notes: Yup.string()
        .min(20, 'Notes must be at least 20 characters')
        .max(1000, 'Notes must be 1000 characters or less')
        .required('Notes is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(`/clients/${clientId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(values)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update client')
        }

        await refreshUser()
        navigate('/profile')
      } catch (err) {
        console.error('Error updating client:', err)
        alert('Failed to update client: ' + err.message)
      }
    }
  })

  if (loading) return <div className="loading">Loading client details...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!client) return <div className="error">Client not found</div>

  return (
    <div className="new-client-container">
      <div className="new-client-header">
        <h1>Edit Client</h1>
        <button onClick={() => navigate('/profile')} className="back-button">
          Back to Profile
        </button>
      </div>

      <div className="new-client-content">
        <form onSubmit={formik.handleSubmit} className="client-form">
          <div className="form-group">
            <label htmlFor="name">Client Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              placeholder="Enter client name..."
              className={formik.touched.name && formik.errors.name ? 'error' : ''}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="error-message">{formik.errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              placeholder="Enter client email..."
              className={formik.touched.email && formik.errors.email ? 'error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="error-message">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="text"
              id="phone"
              name="phone"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              placeholder="Enter phone number (###-###-####)..."
              className={formik.touched.phone && formik.errors.phone ? 'error' : ''}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="error-message">{formik.errors.phone}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.company}
              placeholder="Enter company name..."
              className={formik.touched.company && formik.errors.company ? 'error' : ''}
            />
            {formik.touched.company && formik.errors.company && (
              <div className="error-message">{formik.errors.company}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              placeholder="Enter client address..."
              className={formik.touched.address && formik.errors.address ? 'error' : ''}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="error-message">{formik.errors.address}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes *</label>
            <textarea
              id="notes"
              name="notes"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.notes}
              placeholder="Add detailed notes about the client (minimum 20 characters)..."
              className={formik.touched.notes && formik.errors.notes ? 'error' : ''}
            />
            {formik.touched.notes && formik.errors.notes && (
              <div className="error-message">{formik.errors.notes}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/profile')} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Update Client
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditClient 