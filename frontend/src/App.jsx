import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ParentDashboard from './pages/ParentDashboard';
import ChildDashboard from './pages/ChildDashboard';
import Navigation from './components/Navigation';
import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

function App() {
  const [role, setRole] = useState('parent'); // 'parent' or 'child'

  useEffect(() => {
    // Initialize Telegram Mini App SDK
    if (WebApp.initDataUnsafe?.user) {
      WebApp.ready();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        {/* Dev Role Switcher */}
        <div className="fixed top-0 right-0 z-50 p-2 opacity-50 hover:opacity-100">
          <button
            onClick={() => setRole(role === 'parent' ? 'child' : 'parent')}
            className="bg-black text-white text-xs px-2 py-1 rounded"
          >
            Switch to {role === 'parent' ? 'Child' : 'Parent'}
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to={role === 'parent' ? "/parent" : "/child"} />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/child" element={<ChildDashboard />} />
        </Routes>

        <Navigation role={role} />
      </div>
    </Router>
  );
}

export default App;
