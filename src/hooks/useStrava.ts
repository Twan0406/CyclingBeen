import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClimbs } from '../context/ClimbsContext';
import {
  stravaConfigured,
  stravaAuthorizeUrl,
  fetchActivities,
  matchActivitiesToClimbs,
} from '../lib/strava';
import { loadPublicStrava, getRefreshToken, updateRefreshToken } from '../lib/stravaStore';

export function useStrava() {
  const { user } = useAuth();
  const { climbs, applyStravaMatches } = useClimbs();
  const [athleteName, setAthleteName] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAthleteName(null);
      return;
    }
    loadPublicStrava(user.uid)
      .then((s) => setAthleteName(s?.athleteName ?? null))
      .catch(() => {});
  }, [user]);

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
      const { activities, refresh_token } = await fetchActivities(refresh);
      if (refresh_token && refresh_token !== refresh) {
        await updateRefreshToken(user.uid, refresh_token);
      }
      const matches = matchActivitiesToClimbs(activities, climbs);
      await applyStravaMatches(matches);
      setStatus(
        matches.length
          ? `Found ${matches.length} climb${matches.length === 1 ? '' : 's'} in ${activities.length} rides.`
          : `No matching climbs in your ${activities.length} most recent rides yet.`,
      );
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
    connect,
    sync,
  };
}
