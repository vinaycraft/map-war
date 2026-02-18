import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      
      <div className="container">
        <div className="flex flex-center" style={{ minHeight: '80vh' }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <div className="card">
              <div className="card-header text-center">Sign in to your account</div>
              
              {error && (
                <div className="error" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}
              
              <p className="text-center mb-4">
                Or{' '}
                <Link to="/register" style={{ color: '#2563eb' }}>
                  create a new account
                </Link>
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input 
                    type="email" 
                    name="email"
                    className="form-input" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    className="form-input" 
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="flex-between mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-small">Remember me</span>
                  </label>
                  
                  <a href="#forgot" className="text-small" style={{ color: '#2563eb' }}>
                    Forgot your password?
                  </a>
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              
              <div className="text-center mt-4">
                <p className="text-small">
                  Demo credentials: test@example.com / password
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
