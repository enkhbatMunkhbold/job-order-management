import { useState, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import OrderCard from './OrderCard'
import UserContext from '../context/UserContext'
import '../styling/orderList.css'

function OrderList() {
  const navigate = useNavigate()
  const { clientId, jobId } = useParams()
  const { user, refreshUser } = useContext(UserContext)
  const [ deletingOrderId, setDeletingOrderId ] = useState(null)

  // Get orders from user context based on clientId or jobId
  const getFilteredOrders = () => {
    if (!user?.orders) return []
    
    if (clientId) {
      return user.orders.filter(order => order.client.id === parseInt(clientId))
    } else if (jobId) {
      return user.orders.filter(order => order.job.id === parseInt(jobId))
    }
    
    return []
  }

  const orders = getFilteredOrders()
  
  // Get client or job info from user context
  const client = clientId ? user?.clients?.find(c => c.id === parseInt(clientId)) : null
  const job = jobId ? user?.jobs?.find(j => j.id === parseInt(jobId)) : null

  const handleDeleteOrder = async (orderId) => {
    try {
      setDeletingOrderId(orderId)
      const response = await fetch(`/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete order')
      }

      // Refresh user context to update order data
      await refreshUser()
    } catch (err) {
      console.error('Error deleting order:', err)
    } finally {
      setDeletingOrderId(null)
    }
  }

  const handleEditOrder = (order) => {
    navigate(`/edit_order/${order.id}`) 
  }

  if (!user) return <div className="error">Please log in to view orders.</div>
  if (!client && !job) return <div className="error">Client or job not found.</div>

  const title = client ? `Orders for ${client.name}` : `Orders for ${job.title}`
  const noOrdersMessage = client ? "No orders found for this client." : "No orders found for this job."

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h1>{title}</h1>
        <Link to="/profile" className="back-button">
          Back to Profile
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>{noOrdersMessage}</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onDelete={handleDeleteOrder}
              isDeleting={deletingOrderId === order.id}
              onEdit={handleEditOrder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderList 