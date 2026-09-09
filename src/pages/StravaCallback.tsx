import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exchangeCode } from '../lib/strava';
import { saveConnection } from '../lib/stravaStore';

export default function StravaCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Strava account…');

  useEffect(() => {
    if (loading) return; // wait for auth to resolve
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'You denied access to Strava.' : 'No authorization code received.');
      return;
    }
    if (!user) {
      setStatus('error');
      setMessage('Please sign in first, then connect Strava.');
      return;
    }

    (async () => {
      try {
        const tokens = await exchangeCode(code);
        await saveConnection(user.uid, tokens);
        setStatus('success');
        setMessage(
          tokens.athlete
            ? `Connected as ${tokens.athlete.firstname} ${tokens.athlete.lastname}!`
            : 'Strava connected!',
        );
        setTimeout(() => navigate('/my-climbs'), 1500);
      } catch (e) {
        setStatus('error');
        setMessage((e as Error).message || 'Failed to connect to Strava.');
      }
    })();
  }, [loading, user, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300">{message}</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connected!</h2>
          <p className="text-slate-400">{message}</p>
          <p className="text-sm text-slate-500 mt-2">Taking you to your climbs…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection failed</h2>
          <p className="text-slate-400">{message}</p>
          <button
            onClick={() => navigate('/my-climbs')}
            className="mt-4 bg-amber-400 text-[#14120f] px-5 py-2 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Go back
          </button>
        </>
      )}
    </div>
  );
}
