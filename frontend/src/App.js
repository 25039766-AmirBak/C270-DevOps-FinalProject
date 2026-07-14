import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SchedulePage from './pages/SchedulePage';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
