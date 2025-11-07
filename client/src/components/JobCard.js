import { Link } from "react-router-dom";
import "../styling/jobCard.css";

const JobCard = ({ job, showDetails = false, onDelete, onEdit }) => {

  const uniqueClients = [...new Map(job.clients.map(client => [client.id, client])).values()]
 
  return (
    <div className={`job-card ${showDetails ? 'job-card-detailed' : ''}`}>
      <div className="job-card-content">
        <div className="job-header">
          <h3>{job.title}</h3>
          <button 
            className="edit-button"
            onClick={() => onEdit && onEdit(job)}
            title="Edit Job"
          >
            ✏️
          </button>
        </div>
        
        {showDetails && (
          <>            
            <div className="job-info">
              <div className="job-info-title">
                <h4>Job Info</h4>
              </div>
              <div className="info-item">
                <span className="label">Category:</span>
                <span className="value">{job.category}</span>
              </div>
              <div className="info-item">
                <span className="label">Description:</span>
                <span className="value">{job.description}</span>
              </div>
              {job.duration && (
                <div className="info-item">
                  <span className="label">Duration:</span>
                  <span className="value">{job.duration}</span>
                </div>
              )}
              {uniqueClients && uniqueClients.length > 0 && (
                <div className="info-item">
                  <span className="label">Clients:</span>
                  <span className="value">
                    {uniqueClients.map((client, index) => (
                      <span key={client.id}>
                        <Link to={`/clients/${client.id}`} className="client-link">
                          {client.name}
                        </Link>
                        {index < uniqueClients.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
            <div className="job-actions">
              <Link to={`/jobs/${job.id}/orders`} className="orders-button">
                View Orders
              </Link>
              <button 
                className="delete-button"
                onClick={() => onDelete && onDelete(job.id)}
                title="Delete Job"
              >
                🗑️
              </button>
            </div>
          </>
        )}
        
        <div className="job-actions">
          {!showDetails && (
            <Link to={`/jobs/${job.id}`} className="view-profile">
              View Details
            </Link>
          )}
          {!showDetails && (
            <Link to={`/new_order?job=${job.id}`} className="book-appointment">
              Create Order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;