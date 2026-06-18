import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ClimbsProvider } from './context/ClimbsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ClimbDetail from './pages/ClimbDetail';
import MyClimbs from './pages/MyClimbs';
import StravaCallback from './pages/StravaCallback';

export default function App() {
  return (
    <BrowserRouter>
      <ClimbsProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/climb/:id" element={<ClimbDetail />} />
              <Route path="/my-climbs" element={<MyClimbs />} />
              <Route path="/strava-callback" element={<StravaCallback />} />
            </Routes>
          </main>
        </div>
      </ClimbsProvider>
    </BrowserRouter>
  );
}
