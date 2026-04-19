import { useRef, useEffect } from 'react';

const AD_UNIT_ID = 'ca-app-pub-4837637269293646/2944642002';

let admobInitialized = false;
let adLoaded = false;

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

async function preloadAd() {
  try {
    const AdMob = await getAdMob();
    if (!AdMob) return;
    adLoaded = false;
    await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
    adLoaded = true;
  } catch (e) {
    console.warn('AdMob preload error:', e);
    adLoaded = false;
  }
}

async function showInterstitial() {
  try {
    const AdMob = await getAdMob();
    if (!AdMob) return;
    if (!adLoaded) return;
    adLoaded = false;
    await new Promise((resolve) => {
      const listener = AdMob.addListener('interstitialDidDismiss', () => {
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
    preloadAd();
  } catch (e) {
    console.warn('AdMob show error:', e);
  }
}

export function useAdMob(isTournament) {
  const normalCountRef = useRef(0);

  useEffect(() => {
    preloadAd();
  }, []);

  const recordGameEnd = () => {
    if (isTournament) {
      showInterstitial();
    } else {
      normalCountRef.current += 1;
      if (normalCountRef.current >= 2) {
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