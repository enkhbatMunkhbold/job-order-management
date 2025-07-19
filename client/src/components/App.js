import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./NavBar";
import Register from "./Register";
import Home from "./Home";
import Login from "./Login";
import Profile from "./Profile";
import JobDetails from "./JobDetails";
import ClientDetails from "./ClientDetails";
import NewOrder from "./NewOrder";
import OrderList from "./OrderList";
import NewJob from "./NewJob";
import NewClient from "./NewClient";
import EditJob from "./EditJob";
import EditClient from "./EditClient";
import EditOrder from "./EditOrder";
import UserContext, { UserProvider } from '../context/UserContext';
import { JobsProvider } from '../context/JobsContext';

function AppContent() { 
  const { user, isLoading } = useContext(UserContext)

   if (isLoading) {
    return <div>Loading...</div>;
  }

  return (    
    <Router>
      <NavBar />
      <div className="main-content">
        {user ? (
          <Routes>            
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/clients/:clientId" element={<ClientDetails />} />
            <Route path="/clients/:clientId/orders" element={<OrderList />} />
            <Route path="/jobs/:jobId/orders" element={<OrderList />} />              
            <Route path="/new_order" element={<NewOrder />} />
            <Route path="/new_job" element={<NewJob />} />
            <Route path="/new_client" element={<NewClient />} />
            <Route path="/edit_job/:jobId" element={<EditJob />} />
            <Route path="/edit_client/:clientId" element={<EditClient />} />
            <Route path="/edit_order/:orderId" element={<EditOrder />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}        
      </div>
    </Router>       
  )
}

function App() {
  return (
    <UserProvider>
      <JobsProvider>
        <AppContent />
      </JobsProvider>
    </UserProvider>
  )
}

export default App;
