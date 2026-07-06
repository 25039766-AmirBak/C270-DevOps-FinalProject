import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const ROLES = [
  { value: 'Recipient', label: 'Recipient', needsDocs: true, docMessage: 'Please provide your FAS approval letter with NRIC blurred out to verify low income status.' },
  { value: 'Volunteer', label: 'Volunteer', needsDocs: true, docMessage: 'Please provide a picture of your NRIC with your NRIC blurred out to prove your identity.' },
  { value: 'Donor', label: 'Donor', needsDocs: false },
];

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Recipient' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const selectedRole = ROLES.find((r) => r.value === formData.role);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (selectedRole?.needsDocs && !file) newErrors.file = 'Supporting document is required';
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

      if (selectedRole?.needsDocs && file) {
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
        <select name="role" value={formData.role} onChange={handleChange}>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {selectedRole?.needsDocs && (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', margin: 0 }}>{selectedRole.docMessage}</p>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setErrors({ ...errors, file: '' });
              }}
            />
            {errors.file && <p className="error-text">{errors.file}</p>}
          </>
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
