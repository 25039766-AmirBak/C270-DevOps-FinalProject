import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
    
// Placeholder imports for the team's pages
import Home from './pages/Home';        
import About from './pages/About';
import PostDonation from './pages/PostDonation';       
// import Request from './pages/Request';     
// import MapView from './pages/Map';         
// import Volunteer from './pages/Volunteer'; 
// import Login from './pages/Login';         

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Master Layout wraps all child routes */}
        <Route path="/" element={<Layout />}>
          
          {/* 'index' means this loads at the root path "/" */}
          <Route index element={<Home />} /> 
          <Route path="about" element={<About />} />
          
          {/* Feature Routes (Commented out until teammates build them) */}
          <Route path="donate" element={<PostDonation />} />
          {/* <Route path="request" element={<Request />} /> */}
          {/* <Route path="map" element={<MapView />} /> */}
          {/* <Route path="volunteer" element={<Volunteer />} /> */}
          {/* <Route path="login" element={<Login />} /> */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;