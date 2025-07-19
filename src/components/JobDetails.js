import { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import JobsContext from '../context/JobsContext'
import '../styling/jobDetails.css'

function JobDetails() {
  const { jobId } = useParams()
  const { jobs, isLoading } = useContext(JobsContext)
  const [ job, setJob ] = useState(null)
  const [ error, setError ] = useState(null)

  useEffect(() => {
    if (jobs && jobId) {
      const foundJob = jobs.find(job => job.id === parseInt(jobId))
      if (foundJob) {
        setJob(foundJob)
        setError(null)
      } else {
        setError('Job not found')
        setJob(null)
      }
    }
  }, [jobs, jobId])

  if (isLoading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!job) return <div className="loading">Loading job details...</div>

  return (
    <div className="job-details-container">
      <div className="job-details-card">
        <div className="job-details-content">
          <div className="job-details-header">
            <h1>{job.title}</h1>
          </div>
          
          <div className="job-details-body">
            <div className="job-section">
              <h3>Description</h3>
              <p>{job.description}</p>
            </div>
            
            <div className="job-section">
              <h3>Job Information</h3>
              <div className="job-info-grid">
                <div className="info-item">
                  <span className="label">Category:</span>
                  <span className="value">{job.category}</span>
                </div>
                <div className="info-item">
                  <span className="label">Job Length:</span>
                  <span className="value">{job.duration}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="job-details-actions">
            <button className="back-button" onClick={() => window.history.back()}>
              Back to Profile
            </button>
            <button className="create-order-button" onClick={() => window.location.href = `/new_order?job=${job.id}`}>
              Create Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetails