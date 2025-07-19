import { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import UserContext from '../context/UserContext'
import JobsContext from '../context/JobsContext'
import JobCard from './JobCard'
import ClientCard from './ClientCard'
import '../styling/jobCard.css'
import '../styling/profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useContext(UserContext)
  const { deleteJob } = useContext(JobsContext)
  const [ showClients, setShowClients ] = useState(false)
  const [ showCreateOptions, setShowCreateOptions ] = useState(false)
  const createButtonRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createButtonRef.current && !createButtonRef.current.contains(e.target)) {
        setShowCreateOptions(false)
      }
    }

    if (showCreateOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCreateOptions])

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId)
      // Refresh user data to update the jobs list
      await refreshUser()
    } catch (err) {
      console.error('Error deleting job:', err)
      alert('Failed to delete job: ' + err.message)
    }
  }

   if (!user) {
    navigate('/login')
    return
  }

  const handleDeleteClient = async (clientId) => {
    try {
      // Delete client using the clients endpoint
      const response = await fetch(`/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete client')
      }

      // Refresh user data to update the clients list
      await refreshUser()
    } catch (err) {
      console.error('Error deleting client:', err)
      alert('Failed to delete client: ' + err.message)
    }
  }

  const handleEditJob = (job) => {
    navigate(`/edit_job/${job.id}`)
  }

  const handleEditClient = (client) => {
    navigate(`/edit_client/${client.id}`)
  }

  const handleCreateClick = () => {
    setShowCreateOptions(!showCreateOptions)
  }

  const handleCreateJob = () => {
    navigate('/new_job')
  }

  const handleCreateClient = () => {
    navigate('/new_client')
  }

  // Use user.jobs instead of global jobs to show only user's jobs
  const userJobs = user.jobs || []
  const jobCards = userJobs.map( job => {
    return <JobCard key={job.id} job={job} showDetails={true} onDelete={handleDeleteJob} onEdit={handleEditJob} />
  })

  // Use user.clients instead of ClientsContext
  const userClients = user.clients || []
  const clientCards = userClients.map( client => {
    return <ClientCard key={client.id} client={client} onDelete={handleDeleteClient} onEdit={handleEditClient} />
  })

  const capitalizedUsername = user?.username ? 
    user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'

  return (
    <div className="profile-container">
      <h1 className="profile-header">Welcome, {capitalizedUsername}</h1>
      <div className="profile-buttons">
        <button 
          className={`profile-button ${!showClients ? 'active' : ''}`} 
          onClick={() => setShowClients(false)}
        >
          Show My Jobs
        </button>
        <button 
          className={`profile-button ${showClients ? 'active' : ''}`} 
          onClick={() => setShowClients(true)}
        >
          Show My Clients
        </button>
        <div className="create-button-container" ref={createButtonRef}>
          <button 
            className={`profile-button ${showCreateOptions ? 'active' : ''}`}
            onClick={handleCreateClick}
          >
            Create
          </button>
          {showCreateOptions && (
            <div className="create-options">
              <button className="create-option" onClick={handleCreateJob}>
                New Job
              </button>
              <button className="create-option" onClick={handleCreateClient}>
                New Client
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="jobs-container">
        {showClients ? clientCards : jobCards}
      </div>
    </div>
  )
}

export default Profile