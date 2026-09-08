import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClimbs } from '../context/ClimbsContext';
import { stravaConfigured, stravaAuthorizeUrl, syncStrava, workerVersion } from '../lib/strava';
import { loadPublicStrava, getRefreshToken, updateRefreshToken } from '../lib/stravaStore';

export function useStrava() {
  const { user } = useAuth();
  const { climbs, applyStravaMatches } = useClimbs();
  const [athleteName, setAthleteName] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [outdated, setOutdated] = useState(false);

  useEffect(() => {
    if (!user) {
      setAthleteName(null);
      return;
    }
    loadPublicStrava(user.uid)
      .then((s) => setAthleteName(s?.athleteName ?? null))
      .catch(() => {});
  }, [user]);

  // Check once whether the Strava proxy supports exact climb times.
  useEffect(() => {
    if (!stravaConfigured()) return;
    workerVersion()
      .then((v) => setOutdated(v < 2))
      .catch(() => {});
  }, []);

  const connect = useCallback(() => {
    window.location.href = stravaAuthorizeUrl();
  }, []);

  const sync = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    setStatus('Loading your Strava rides…');
    try {
      const refresh = await getRefreshToken(user.uid);
      if (!refresh) {
        setStatus('Not connected to Strava yet.');
        return;
      }
      const result = await syncStrava(refresh, climbs, (msg) => setStatus(msg));
      if (result.refresh_token && result.refresh_token !== refresh) {
        await updateRefreshToken(user.uid, result.refresh_token);
      }
      await applyStravaMatches(result.matches);
      setOutdated(result.workerOutdated);

      if (result.matches.length === 0) {
        setStatus(`No matching climbs in your ${result.ridesScanned} most recent rides yet.`);
      } else {
        const base = `Found ${result.matches.length} climb${result.matches.length === 1 ? '' : 's'} in ${result.ridesScanned} rides`;
        if (result.workerOutdated) {
          setStatus(`${base} — showing ride times. Update your Val.town worker for exact climb times.`);
        } else if (result.exactTimes > 0) {
          setStatus(`${base} · ${result.exactTimes} with an exact climb time ⏱️`);
        } else {
          setStatus(`${base} — couldn't measure exact climb times from the GPS data.`);
        }
      }
    } catch (e) {
      setStatus('Sync failed: ' + (e as Error).message);
    } finally {
      setSyncing(false);
    }
  }, [user, climbs, applyStravaMatches]);

  return {
    configured: stravaConfigured(),
    connected: Boolean(athleteName),
    athleteName,
    syncing,
    status,
    outdated,
    connect,
    sync,
  };
}
