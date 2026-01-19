import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Records from './pages/Records'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import Medications from './pages/Medications'
import Knowledge from './pages/Knowledge'
import KnowledgeDetail from './pages/KnowledgeDetail'
import Insights from './pages/Insights'
import NearbyHospitals from './pages/NearbyHospitals'
import RecordDetail from './pages/RecordDetail'
import CheckupReminders from './pages/CheckupReminders'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/medications" element={<Medications />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/nearby" element={<NearbyHospitals />} />
          <Route path="/checkup" element={<CheckupReminders />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
