import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import UserContext from '../context/UserContext'
import JobsContext from '../context/JobsContext'
import JobCard from './JobCard'
import ClientCard from './ClientCard'
import OrderCard from './OrderCard'
import '../styling/jobCard.css'
import '../styling/profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useContext(UserContext)
  const { deleteJob } = useContext(JobsContext)
  const [ showCards, setShowCards ] = useState('')
  const [ showCreateOptions, setShowCreateOptions ] = useState(false)
  const [ showSortOptions, setShowSortOptions ] = useState(false)
  const [ sortCards, setSortCards ] = useState(false)
  const [ sortBy, setSortBy ] = useState('')
  const createButtonRef = useRef(null)
  const sortButtonRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createButtonRef.current && !createButtonRef.current.contains(e.target)) {
        setShowCreateOptions(false)
      }
      if (sortButtonRef.current && !sortButtonRef.current.contains(e.target)) {
        setShowSortOptions(false)
      }
    }

    if (showCreateOptions || showSortOptions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCreateOptions, showSortOptions])

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

  const handleDeleteOrder = async (orderId) => {
    try {
      // Delete order using the orders endpoint
      const response = await fetch(`/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete order')
      }

      // Refresh user data to update the orders list
      await refreshUser()
    } catch (err) {
      console.error('Error deleting order:', err)
      alert('Failed to delete order: ' + err.message)
    }
  }

  const handleEditJob = (job) => {
    navigate(`/edit_job/${job.id}`)
  }

  const handleEditClient = (client) => {
    navigate(`/edit_client/${client.id}`)
  }

  const handleEditOrder = (order) => {
    navigate(`/edit_order/${order.id}`)
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

  const handleSortClick = () => {
    setShowSortOptions(!showSortOptions)
  }

  const handleSortBy = (sortType) => {
    setSortBy(sortType)
    setSortCards(sortType !== '')
    setShowSortOptions(false)
  }

  const handleCardTypeChange = (cardType) => {
    setShowCards(cardType)
    // Reset sorting when switching away from orders
    if (cardType !== 'orders') {
      setSortCards(false)
      setSortBy('')
    }
  }

  // Use user.jobs instead of global jobs to show only user's jobs
  const userJobs = user?.jobs || []
  const jobCards = userJobs.map( job => {
    return <JobCard key={job.id} job={job} showDetails={true} onDelete={handleDeleteJob} onEdit={handleEditJob} />
  })

  const userClients = user?.clients || []
  const clientCards = userClients.map( client => {
    return <ClientCard key={client.id} client={client} onDelete={handleDeleteClient} onEdit={handleEditClient} />
  })

  const userOrders = useMemo(() => user?.orders || [], [user?.orders])
  const orderCards = userOrders.map(order => {
    return <OrderCard key={order.id} order={order} onDelete={handleDeleteOrder} onEdit={handleEditOrder} />
  })

  const showUnsortedCards = () => {
    return showCards === 'jobs' ? jobCards : showCards === 'clients' ? clientCards : orderCards    
  }

  const sortedOrders = useMemo(() => {
    if (showCards !== 'orders' || !sortBy) return userOrders

    return [...userOrders].sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return (a.status || '').localeCompare(b.status || '')
        case 'due_date':
          const dateA = new Date(a.due_date || a.dueDate || 0)
          const dateB = new Date(b.due_date || b.dueDate || 0)
          return dateA - dateB
        case 'rate':
          const getRateValue = (rateStr) => {
            if (!rateStr) return 0
            const match = rateStr.toString().match(/\$(\d+)/)
            return match ? parseInt(match[1]) : 0
          }
          return getRateValue(a.rate) - getRateValue(b.rate)
        default:
          return 0
      }
    })
  }, [userOrders, showCards, sortBy])

  // Early return for user check
  if (!user) {
    navigate('/login')
    return null
  }

  const renderCards = () => {
    if (showCards === 'orders') {
      return sortedOrders.map(order => (
        <OrderCard key={order.id} order={order} onDelete={handleDeleteOrder} onEdit={handleEditOrder} />
      ))
    }
    return null
  }

  const capitalizedUsername = user?.username ? 
    user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'

  return (
    <div className="profile-container">
      <h1 className="profile-header">Welcome, {capitalizedUsername}</h1>
      <div className="profile-buttons">
        <button 
          className={`profile-button ${showCards === 'jobs' ? 'active' : ''}`} 
          onClick={() => handleCardTypeChange('jobs')}
        >
          Show My Jobs
        </button>
        <button 
          className={`profile-button ${showCards === 'clients' ? 'active' : ''}`} 
          onClick={() => handleCardTypeChange('clients')}
        >
          Show My Clients
        </button>
        <button 
          className={`profile-button ${showCards === 'orders' ? 'active' : ''}`} 
          onClick={() => handleCardTypeChange('orders')}
        >
          Show All My Orders
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
      {showCards === 'orders' && (
        <div className="separator-container">
          <div className="sort-button-container" ref={sortButtonRef}>
            <button 
              className={`sort-button ${showSortOptions ? 'active' : ''}`}
              onClick={handleSortClick}
            >
              Sort {sortBy ? `(${sortBy})` : ''}
            </button>
            {showSortOptions && (
              <div className="sort-options">
                <button className="sort-option" onClick={() => handleSortBy('')}>
                  No Sort
                </button>
                <button className="sort-option" onClick={() => handleSortBy('status')}>
                  Status
                </button>
                <button className="sort-option" onClick={() => handleSortBy('due_date')}>
                  Due Date
                </button>
                <button className="sort-option" onClick={() => handleSortBy('rate')}>
                  Rate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="jobs-container">
        {sortCards ? renderCards() : showUnsortedCards()}
      </div>
    </div>
  )
}

export default Profile