import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClimbsProvider } from './context/ClimbsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ClimbDetail from './pages/ClimbDetail';
import MyClimbs from './pages/MyClimbs';
import Friends from './pages/Friends';
import StravaCallback from './pages/StravaCallback';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClimbsProvider>
          <div className="min-h-screen bg-[#0b0d12]">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/climb/:id" element={<ClimbDetail />} />
                <Route path="/my-climbs" element={<MyClimbs />} />
              <Route path="/friends" element={<Friends />} />
                <Route path="/strava-callback" element={<StravaCallback />} />
              </Routes>
            </main>
          </div>
        </ClimbsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
