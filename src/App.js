import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/landing.css';
import LandingPage from "./pages/LandingPage";
import CampaignsPage from "./pages/CampaignsPage";
import EmailsPage from "./pages/EmailsPage";
import LeadsPage from "./pages/AllLeadsPage";
import CampaignSettingsPage from './pages/CampaignSettingsPage';
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";


function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="*" element={<LandingPage />} />
        ) : (
          <>
            <Route path="/" element={<Navigate to="/campaigns" />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/emails" element={<EmailsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/campaigns/:id/settings" element={<CampaignSettingsPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;