import "../styling/orderCard.css";

const OrderCard = ({ order, onDelete, isDeleting, onEdit }) => {
  // Function to validate if a string looks like a valid address
  const isValidAddress = (location) => {
    if (!location) return false;
    
    // Convert to lowercase for easier matching
    const loc = location.toLowerCase().trim();
    
    // Check for common non-address terms
    const nonAddressTerms = [
      'remote', 'work from home', 'wfh', 'virtual', 'online', 
      'telecommute', 'anywhere', 'flexible', 'hybrid'
    ];
    
    // If it contains any non-address terms, it's not a valid address
    if (nonAddressTerms.some(term => loc.includes(term))) {
      return false;
    }
    
    // Check for address patterns
    // Should have at least a number and some text that could be a street/city
    const hasNumber = /\d/.test(location);
    const hasLetter = /[a-zA-Z]/.test(location);
    const hasComma = location.includes(',');
    const hasState = /\b[A-Z]{2}\b/.test(location); // Two letter state code
    const hasZipCode = /\b\d{5}(-\d{4})?\b/.test(location); // ZIP code pattern
    
    // Basic validation: should have numbers and letters, and either comma or state/zip
    return hasNumber && hasLetter && (hasComma || hasState || hasZipCode);
  };

  const handleLocationClick = () => {
    if (order.location && isValidAddress(order.location)) {
      // Open Google Maps with the location
      const encodedLocation = encodeURIComponent(order.location);
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  const isLocationClickable = isValidAddress(order.location);

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
          <span 
            className={`value ${isLocationClickable ? 'location-clickable' : ''}`}
            onClick={isLocationClickable ? handleLocationClick : undefined}
            title={isLocationClickable ? "Click to view on Google Maps" : undefined}
          >
            {order.location}
          </span>
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
