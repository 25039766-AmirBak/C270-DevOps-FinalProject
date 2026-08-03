// Amir
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ROLES = [
  { value: 'Recipient', label: 'Recipient', needsDocs: true, docMessage: 'Recipient: Please provide your FAS approval letter with NRIC blurred out.' },
  { value: 'Volunteer', label: 'Volunteer', needsDocs: true, docMessage: 'Volunteer: Please provide a picture of your NRIC with the number blurred out.' },
  { value: 'Donor', label: 'Donor', needsDocs: true, docMessage: 'Donor: Please present your Letter of Authorization.' },
];

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: ['Recipient'] });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // --- NEW ARRAY LOGIC REPLACES selectedRole ---
  const needsDocs = formData.role.some(r => ROLES.find(roleObj => roleObj.value === r)?.needsDocs);
  
  // Gather all the document instructions for the roles they selected
  const requiredMessages = formData.role
    .map(r => ROLES.find(roleObj => roleObj.value === r)?.docMessage)
    .filter(Boolean); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleRoleToggle = (roleValue) => {
    setFormData((prev) => {
      const currentRoles = prev.role;
      if (currentRoles.includes(roleValue)) {
        return { ...prev, role: currentRoles.filter(r => r !== roleValue) }; // Remove it
      } else {
        return { ...prev, role: [...currentRoles, roleValue] }; // Add it
      }
    });
    setErrors({ ...errors, role: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // New validation: Must select at least one role
    if (formData.role.length === 0) {
      newErrors.role = 'You must select at least one role';
    }
    
    if (needsDocs && !file) newErrors.file = 'Supporting document is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      localStorage.setItem('token', res.data.token);

      setUser(res.data.user);

      if (needsDocs && file) {
        await authService.uploadDocument(file, res.data.token);
      }

      navigate('/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="page-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
        
        <input
          type="password"
          name="password"
          placeholder="Password (min 8 characters)"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
        
        {/* --- NEW CHECKBOX UI (Replaced the <select> tag) --- */}
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', margin: '10px 0' }}>
          <span style={{ width: '100%', fontSize: '0.9rem', fontWeight: 'bold' }}>Select Your Roles:</span>
          {ROLES.map((r) => (
            <label key={r.value} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={formData.role.includes(r.value)}
                onChange={() => handleRoleToggle(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>
        {errors.role && <p className="error-text">{errors.role}</p>}

        {/* Dynamic Document Instructions */}
        {needsDocs && (
          <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', margin: '0 0 10px 0', fontWeight: 'bold' }}>Required Documents:</p>
            {requiredMessages.map((msg, index) => (
              <p key={index} style={{ fontSize: '0.85rem', color: '#4B5563', margin: '0 0 5px 0' }}>• {msg}</p>
            ))}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ marginTop: '10px' }}
              onChange={(e) => {
                setFile(e.target.files[0]);
                setErrors({ ...errors, file: '' });
              }}
            />
            {errors.file && <p className="error-text">{errors.file}</p>}
          </div>
        )}
        
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;