import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function StravaCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'You denied access to Strava.' : 'No authorization code received.');
      return;
    }

    async function exchangeToken() {
      try {
        const res = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
            client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
          }),
        });
        const data = await res.json();
        if (data.access_token) {
          localStorage.setItem('strava_access_token', data.access_token);
          localStorage.setItem('strava_athlete', JSON.stringify(data.athlete));
          setStatus('success');
          setMessage(`Connected as ${data.athlete?.firstname} ${data.athlete?.lastname}!`);
          setTimeout(() => navigate('/my-climbs'), 2000);
        } else {
          throw new Error(data.message || 'Token exchange failed');
        }
      } catch (err: unknown) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to connect to Strava.');
      }
    }

    exchangeToken();
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Connecting to Strava...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="w-12 h-12 text-[#1D9E75] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connected!</h2>
          <p className="text-gray-500">{message}</p>
          <p className="text-sm text-gray-400 mt-2">Redirecting to your climbs...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h2>
          <p className="text-gray-500">{message}</p>
          <button
            onClick={() => navigate('/my-climbs')}
            className="mt-4 bg-[#1D9E75] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#178a64] transition-colors"
          >
            Go back
          </button>
        </>
      )}
    </div>
  );
}
