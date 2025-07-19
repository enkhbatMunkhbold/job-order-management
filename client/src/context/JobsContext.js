import { createContext, useState, useEffect, useContext } from 'react';
import UserContext from './UserContext';

const JobsContext = createContext(null);

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(UserContext);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/jobs', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const jobsData = await response.json();
        setJobs(jobsData);
      } else {
        console.error('Failed to fetch jobs:', response.statusText);
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createJob = async (jobData) => {
    try {
      const response = await fetch('/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create job');
      }

      const newJob = await response.json();
      setJobs(prevJobs => [...prevJobs, newJob]);
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  };

  const deleteJob = async (jobId) => {
    try {
      const response = await fetch(`/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job');
      }

      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  };  

  useEffect(() => {
    if (user) {
      fetchJobs();
    } else {
      setJobs([]);
      setIsLoading(false);
    }
  }, [user]);

  const value = {
    jobs,
    setJobs,
    isLoading,
    fetchJobs,
    createJob,
    deleteJob
  };

  return (
    <JobsContext.Provider value={value}>
      {children}
    </JobsContext.Provider>
  );
};

export default JobsContext; 