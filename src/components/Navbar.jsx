import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  let role = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role || '';
    } catch {
      // ignore
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="global-navbar">
      <Link to="/" className="logo">FoodShare</Link>
      {token ? (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          {role === 'Admin' && <Link to="/admin">Admin</Link>}
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="auth-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
