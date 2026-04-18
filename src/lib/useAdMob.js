import { useRef } from 'react';

const AD_UNIT_ID = 'ca-app-pub-4837637269293646/2944642002';

let admobInitialized = false;
let adReady = false;
let adShowing = false;

function isNativePlatform() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
}

async function getAdMob() {
  if (!isNativePlatform()) return null;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    if (!admobInitialized) {
      await AdMob.initialize({ requestTrackingAuthorization: true });
      AdMob.addListener('onInterstitialAdLoaded', () => {
        adReady = true;
      });
      AdMob.addListener('onInterstitialAdFailedToLoad', () => {
        adReady = false;
      });
      AdMob.addListener('onInterstitialAdDismissed', () => {
        adShowing = false;
        adReady = false;
        setTimeout(() => {
          prepareInterstitial();
        }, 3000);
      });
      admobInitialized = true;
    }
    return AdMob;
  } catch {
    return null;
  }
}

async function prepareInterstitial() {
  if (adReady || adShowing) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
  } catch {}
}

async function showInterstitial() {
  if (!adReady || adShowing) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    adShowing = true;
    adReady = false;
    await AdMob.showInterstitial();
  } catch {
    adShowing = false;
  }
}

if (isNativePlatform()) {
  setTimeout(() => {
    prepareInterstitial();
  }, 3000);
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