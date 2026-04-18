import { useRef } from 'react';

const AD_UNIT_ID = 'ca-app-pub-4837637269293646/2944642002';

let admobInitialized = false;
let adReady = false;

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
      admobInitialized = true;
    }
    return AdMob;
  } catch {
    return null;
  }
}

async function prepareInterstitial() {
  adReady = false;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
  } catch {}
}

async function showInterstitial() {
  if (!adReady) return;
  const AdMob = await getAdMob();
  if (!AdMob) return;
  try {
    adReady = false;
    await AdMob.showInterstitial();
  } catch {}
  setTimeout(() => {
    prepareInterstitial();
  }, 2000);
}

if (isNativePlatform()) {
  prepareInterstitial();
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