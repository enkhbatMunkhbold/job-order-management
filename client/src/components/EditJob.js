import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UserContext from '../context/UserContext'
import JobsContext from '../context/JobsContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import '../styling/newJob.css'

const EditJob = () => {
  const navigate = useNavigate()
  const { jobId } = useParams()
  const { refreshUser } = useContext(UserContext)
  const { jobs } = useContext(JobsContext)
  const [ job, setJob ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState(null)

  useEffect(() => {
    if (jobs && jobId) {
      const foundJob = jobs.find(j => j.id === parseInt(jobId))
      if (foundJob) {
        setJob(foundJob)
        setLoading(false)
      } else {
        setError('Job not found')
        setLoading(false)
      }
    }
  }, [jobs, jobId])

  const formik = useFormik({
    initialValues: {
      title: job?.title || '',
      category: job?.category || '',
      description: job?.description || '',
      duration: job?.duration || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string()
        .min(5, 'Job title must be at least 5 characters')
        .required('Job title is required'),
      category: Yup.string()
        .min(2, 'Category must be at least 2 characters')
        .required('Category is required'),
      description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .required('Description is required'),
      duration: Yup.string()
        .min(2, 'Duration must be at least 2 characters')
        .required('Duration is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch(`/jobs/${jobId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(values)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update job')
        }

        await refreshUser()
        navigate('/profile')
      } catch (err) {
        console.error('Error updating job:', err)
        alert('Failed to update job: ' + err.message)
      }
    }
  })

  if (loading) return <div className="loading">Loading job details...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!job) return <div className="error">Job not found</div>

  return (
    <div className="new-job-container">
      <div className="new-job-header">
        <h1>Edit Job</h1>
        <button onClick={() => navigate('/profile')} className="back-button">
          Back to Profile
        </button>
      </div>

      <div className="new-job-content">
        <form onSubmit={formik.handleSubmit} className="job-form">
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.title}
              placeholder="Enter job title..."
              className={formik.touched.title && formik.errors.title ? 'error' : ''}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="error-message">{formik.errors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <input
              type="text"
              id="category"
              name="category"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.category}
              placeholder="Enter job category..."
              className={formik.touched.category && formik.errors.category ? 'error' : ''}
            />
            {formik.touched.category && formik.errors.category && (
              <div className="error-message">{formik.errors.category}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              placeholder="Enter job description (minimum 10 characters)..."
              className={formik.touched.description && formik.errors.description ? 'error' : ''}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="error-message">{formik.errors.description}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration *</label>
            <input
              type="text"
              id="duration"
              name="duration"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.duration}
              placeholder="Enter job duration..."
              className={formik.touched.duration && formik.errors.duration ? 'error' : ''}
            />
            {formik.touched.duration && formik.errors.duration && (
              <div className="error-message">{formik.errors.duration}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/profile')} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditJob 