import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import our new Gatekeeper
import './styles/auth.css';

// Pages
import Home from './pages/Home';        
import About from './pages/About';
import PostDonation from './pages/PostDonation'; 
import RequestPage from './pages/RequestPage'; 
import DonationMap from './pages/DonationMap';       
import SchedulePage from './pages/SchedulePage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminUsers from './pages/AdminUsers';
import AdminVerification from './pages/AdminVerification';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* Public Routes - Anyone can see these */}
          <Route index element={<Home />} /> 
          <Route path="about" element={<About />} />
          <Route path="map" element={<DonationMap />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* --- PROTECTED ROUTES --- */}
          {/* Any logged-in user can access the dashboard (NO verification needed here) */}
          <Route element={<ProtectedRoute allowedRoles={['Donor', 'Recipient', 'Volunteer', 'Admin']} />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Only 'Donor' can access, MUST BE VERIFIED */}
          <Route element={<ProtectedRoute allowedRoles={['Donor']} requiresVerification={true} />}>
            <Route path="donate" element={<PostDonation />} />
          </Route>
          
          {/* Only 'Recipient' can access, MUST BE VERIFIED */}
          <Route element={<ProtectedRoute allowedRoles={['Recipient']} requiresVerification={true} />}>
            <Route path="request" element={<RequestPage />} />
          </Route>

          {/* Only 'Volunteer' can access, MUST BE VERIFIED */}
          <Route element={<ProtectedRoute allowedRoles={['Volunteer']} requiresVerification={true} />}>
  	    <Route path="volunteer" element={<SchedulePage />} />
  	    <Route path="volunteer/confirmation/:bookingId" element={<ConfirmationPage />} />
  	    <Route path="volunteer/my-bookings" element={<MyBookingsPage />} />
	  </Route>

          {/* Only 'Admin' can access (NO verification needed here) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
           <Route path="admin" element={<Admin />} />
           <Route path="admin/users" element={<AdminUsers />} />
           <Route path="admin/verification" element={<AdminVerification />} />
          </Route>
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;