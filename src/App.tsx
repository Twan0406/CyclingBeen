import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ClimbsProvider } from './context/ClimbsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ClimbDetail from './pages/ClimbDetail';
import DestinationDetail from './pages/DestinationDetail';
import RouteDetail from './pages/RouteDetail';
import FindAdventure from './pages/FindAdventure';
import MyClimbs from './pages/MyClimbs';
import Friends from './pages/Friends';
import StravaCallback from './pages/StravaCallback';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ClimbsProvider>
          <div className="min-h-screen bg-[#14120f]">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rides" element={<Explore />} />
                <Route path="/find" element={<FindAdventure />} />
                <Route path="/rides/:category" element={<Explore />} />
                <Route path="/climb/:id" element={<ClimbDetail />} />
                <Route path="/place/:id" element={<DestinationDetail />} />
                <Route path="/place/:id/route/:route" element={<RouteDetail />} />
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
