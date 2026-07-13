import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import our new Gatekeeper
    
// Pages
import Home from './pages/Home';        
import About from './pages/About';
import PostDonation from './pages/PostDonation'; 
import RequestPage from './pages/RequestPage'; 
// import MapView from './pages/Map';          
// import Volunteer from './pages/Volunteer';  
// import Login from './pages/Login';          

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* Public Routes - Anyone can see these */}
          <Route index element={<Home />} /> 
          <Route path="about" element={<About />} />
          {/* <Route path="map" element={<MapView />} /> */}
          {/* <Route path="login" element={<Login />} /> */}
          
          {/* --- PROTECTED ROUTES --- */}
          
          {/* Only 'donator' can access anything inside this block */}
          <Route element={<ProtectedRoute allowedRoles={['donator']} />}>
            <Route path="donate" element={<PostDonation />} />
          </Route>
          
          {/* Only 'requester' can access anything inside this block */}
          <Route element={<ProtectedRoute allowedRoles={['requester']} />}>
            <Route path="request" element={<RequestPage />} />
          </Route>

          {/* You can do the same for volunteers later! */}
          {/* <Route element={<ProtectedRoute allowedRoles={['volunteer']} />}> */}
          {/* <Route path="volunteer" element={<Volunteer />} /> */}
          {/* </Route> */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;