import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import UserContext from '../context/UserContext'
import JobsContext from '../context/JobsContext'
import JobCard from './JobCard'
import '../styling/jobCard.css'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useContext(UserContext)
  const { jobs, isLoading } = useContext(JobsContext)

  const handleEditJob = (job) => {
    navigate(`/edit_job/${job.id}`)
  }

  const jobCards = jobs.map( job => {
    return <JobCard key={job.id} job={job} showDetails={false} onEdit={handleEditJob} />
  })

  const capitalizedUsername = user?.username ? 
    user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 
    'User'

  if (isLoading) {
    return <div className="loading">Loading jobs...</div>
  }

  return (
    <div className="home-container">
      <h1 className="home-header">Welcome, {capitalizedUsername}</h1>
      <div className="home-buttons">
        <button 
          onClick={() => navigate('/new_job')} 
          className="home-button"
        >
          Create New Job
        </button>
      </div>      
      <div className="jobs-container">
        {jobCards}
      </div>
    </div>
  )
}

export default Home