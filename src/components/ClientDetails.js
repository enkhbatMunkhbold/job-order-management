import { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import UserContext from '../context/UserContext'
import '../styling/clientDetails.css'

function ClientDetails() {
  const { clientId } = useParams()
  const { user, isLoading } = useContext(UserContext)
  const [ client, setClient ] = useState(null)
  const [ error, setError ] = useState(null)
  
  useEffect(() => {
    if (user && user.clients && clientId) {
      const foundClient = user.clients.find(client => client.id === parseInt(clientId))
      console.log('Found client:', foundClient)
      if (foundClient) {
        setClient(foundClient)
        setError(null)
      } else {
        setError('Client not found')
        setClient(null)
      }
    } else if (user && !user.clients) {
      setError('No clients data available')
      setClient(null)
    }
  }, [user, user?.clients, clientId])

  if (isLoading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!client) return <div className="loading">Loading client details...</div>

  return (
    <div className="client-details-container">
      <div className="client-details-card">
        <div className="client-details-content">
          <div className="client-details-header">
            <h1>{client.name}</h1>
          </div>
          
          <div className="client-details-body">
            <div className="client-section">
              <h3>Contact Information</h3>
              <div className="client-info-grid">
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{client.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{client.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="client-section">
              <h3>Notes</h3>
              <p>{client.notes}</p>
            </div>
            
            <div className="client-section">
              <h3>Associated Jobs</h3>
              {client.jobs && client.jobs.length > 0 ? (
                <div className="jobs-list">
                  {client.jobs.map((job) => (
                    <div key={job.id} className="job-item">
                      <Link to={`/jobs/${job.id}`} className="job-link">
                        {job.title}
                      </Link>
                      <span className="job-category">{job.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-jobs">
                  No jobs associated with this client yet.
                </div>
              )}
            </div>
          </div>
          
          <div className="client-details-actions">
            <button className="back-button" onClick={() => window.history.back()}>
              Back to Profile
            </button>
            <Link to={`/clients/${client.id}/orders`} className="view-orders-button">
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDetails