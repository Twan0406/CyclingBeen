import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClimbs } from '../context/ClimbsContext';
import { stravaConfigured, stravaAuthorizeUrl, syncStrava } from '../lib/strava';
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
      const result = await syncStrava(refresh, climbs, (msg) => setStatus(msg));
      if (result.refresh_token && result.refresh_token !== refresh) {
        await updateRefreshToken(user.uid, result.refresh_token);
      }
      await applyStravaMatches(result.matches);
      let note = '';
      if (result.matches.length > 0) {
        if (result.effortsFetched === 0) {
          note = ' · ⚠️ segment data unavailable — update your Val.town worker to get exact climb times';
        } else if (result.segmentTimes > 0) {
          note = ` · ${result.segmentTimes} with exact climb time (segments read for ${result.effortsFetched} rides)`;
        } else {
          note = ` · read segments for ${result.effortsFetched} rides but found no full-climb match`;
        }
      }
      setStatus(
        result.matches.length
          ? `Found ${result.matches.length} climb${result.matches.length === 1 ? '' : 's'} in ${result.ridesScanned} rides${note}.`
          : `No matching climbs in your ${result.ridesScanned} most recent rides yet.`,
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
