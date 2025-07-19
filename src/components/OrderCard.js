import "../styling/orderCard.css";

const OrderCard = ({ order, onDelete, isDeleting, onEdit }) => {
  return (
    <div className="order-card">
      <div className="order-header">
        <h3>{order.job.title}</h3>
        <div className="header-actions">
          <span className={`status status-${order.status.replace(' ', '-')}`}>
            {order.status}
          </span>
          <button 
            className="edit-button"
            onClick={() => onEdit && onEdit(order)}
            title="Edit Order"
          >
            ✏️
          </button>
        </div>
      </div>
      
      <div className="order-info">
        <div className="info-item">
          <span className="label">Description:</span>
          <span className="value">{order.description}</span>
        </div>
        <div className="info-item">
          <span className="label">Location:</span>
          <span className="value">{order.location}</span>
        </div>
        <div className="info-item">
          <span className="label">Rate:</span>
          <span className="value">{order.rate}</span>
        </div>
        <div className="info-item">
          <span className="label">Start Date:</span>
          <span className="value">{new Date(order.start_date).toLocaleDateString()}</span>
        </div>
        <div className="info-item">
          <span className="label">Due Date:</span>
          <span className="value due-date">{new Date(order.due_date).toLocaleDateString()}</span>
        </div>
        <div className="info-item">
          <span className="label">Client:</span>
          <span className="value">{order.client.name}</span>
        </div>
      </div>
      
      <div className="order-actions">
        <button
          className="delete-button"
          onClick={() => onDelete(order.id)}
          disabled={isDeleting || order.status === 'in progress'}
        >
          {isDeleting ? 'Deleting...' : 'Delete Order'}
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
