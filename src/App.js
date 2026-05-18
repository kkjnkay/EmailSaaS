import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CampaignsPage from "./pages/CampaignsPage";
import EmailsPage from "./pages/EmailsPage";
import LeadsPage from "./pages/AllLeadsPage";
import UniboxPage from "./pages/Unibox";
import AnalyticsPage from "./pages/AnalyticsPage";
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
<Route path="/unibox" element={<UniboxPage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
<Route path="/campaigns/:id/settings" element={<CampaignSettingsPage />} />
</>
)} 
</Routes>
</Router>
);
}

export default App;