import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import JobsContext from '../context/JobsContext'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import '../styling/newJob.css'

const NewJob = () => {
  const navigate = useNavigate()
  const { createJob } = useContext(JobsContext)

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      category: "",
      duration: ""
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(50, 'Title must be 50 characters or less')
        .required('Title is required'),
      description: Yup.string()
        .min(10, 'Description must be at least 10 characters')
        .required('Description is required'),
      category: Yup.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be 50 characters or less')
        .required('Category is required'),
      duration: Yup.string()
        .min(1, 'Duration is required')
        .required('Duration is required')
    }),
    onSubmit: async (values) => {
      try {
        console.log('Submitting job data:', values)
        await createJob(values)
        console.log('Job created successfully')
        navigate('/home')
      } catch (err) {
        let errorMessage = 'Failed to create job'
        if (err.message) {
          errorMessage = err.message
        } else if (err.error) {
          errorMessage = err.error
        } else if (typeof err === 'object') {
          errorMessage = 'Validation error occurred. Please check all fields.'
        }        
        alert('Failed to create job: ' + errorMessage)
      }
    }
  })

  return (
    <div className="new-job-container">
      <div className="new-job-header">
        <h1>Create New Job</h1>
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
              placeholder="e.g., Web Development, Design, Marketing..."
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
              placeholder="Describe the job requirements and responsibilities..."
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
              placeholder="e.g., 2 weeks, 1 month, Ongoing..."
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
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewJob 