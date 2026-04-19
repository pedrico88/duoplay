import { useRef, useEffect } from 'react';

const AD_UNIT_ID = 'ca-app-pub-4837637269293646/2944642002';

let admobInitialized = false;

function isNativePlatform() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
}

async function getAdMob() {
  if (!isNativePlatform()) return null;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    if (!admobInitialized) {
      await AdMob.initialize({ requestTrackingAuthorization: true });
      admobInitialized = true;
    }
    return AdMob;
  } catch {
    return null;
  }
}

async function showInterstitial() {
  try {
    const { AdMob, InterstitialAdPluginEvents } = await import('@capacitor-community/admob');
    if (!isNativePlatform()) return;
    await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
    await new Promise((resolve) => {
      const listener = AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
        listener.then(l => l.remove());
        resolve();
      });
      AdMob.showInterstitial().catch(() => {
        listener.then(l => l.remove());
        resolve();
      });
      setTimeout(() => {
        listener.then(l => l.remove());
        resolve();
      }, 5000);
    });
  } catch (e) {
    console.warn('AdMob show error:', e);
  }
}

export function useAdMob(isTournament) {
  const normalCountRef = useRef(0);

  useEffect(() => {}, []);

  const recordGameEnd = () => {
    if (isTournament) {
      showInterstitial();
    } else {
      normalCountRef.current += 1;
      if (normalCountRef.current >= 3) {
        normalCountRef.current = 0;
        showInterstitial();
      }
    }
  };

  return { recordGameEnd, showAd: showInterstitial };
}

export function useInterstitialAd() {
  return { showAd: showInterstitial };
}