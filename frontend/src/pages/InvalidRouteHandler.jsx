import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const InvalidRouteHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/error');
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Error 403</h1>
      <p className="text-lg text-gray-700">Oops! The page you're looking for doesn't exist.</p>
      <p className="text-lg text-gray-700">Please check the URL and try again. <a href="/"  className="text-blue-600"> Go back to home page.</a></p>
    </div>
  );
};

export default InvalidRouteHandler;