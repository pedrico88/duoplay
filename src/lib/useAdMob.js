import { useRef } from 'react';

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
  // Anuncios temporalmente desactivados para diagnóstico
  return;
}

export function useAdMob(isTournament) {
  const normalCountRef = useRef(0);

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

  return { recordGameEnd };
}

export function useInterstitialAd() {
  return { showAd: showInterstitial };
}