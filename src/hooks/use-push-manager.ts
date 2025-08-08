import { useState, useEffect } from 'react';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);
    if (!supported) return;

    // On mount, try to get an existing registration and subscription
    (async () => {
      try {
        // Look across all registrations to avoid stale subs on a different reg
        const anySub = await getAnyExistingSubscription();
        if (anySub) {
          setIsSubscribed(true);
          setSubscription(anySub);
          return;
        }

        // Fallback: check the currently active/ready registration
        const registration =
          (await navigator.serviceWorker.getRegistration('/sw.js')) ||
          (await navigator.serviceWorker.getRegistration());
        if (!registration) {
          // No registration yet; don't block UI by waiting. We'll register on subscribe.
          return;
        }
        // If the registration exists but isn't active yet, wait until it's ready
        const activeRegistration = registration.active
          ? registration
          : await navigator.serviceWorker.ready;

        const sub = await activeRegistration.pushManager.getSubscription();
        if (sub) {
          setIsSubscribed(true);
          setSubscription({
            endpoint: sub.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
              auth: arrayBufferToBase64(sub.getKey('auth')),
            },
          });
        }
      } catch (err) {
        console.error('Error initializing push manager:', err);
      }
    })();
  }, []);

  const ensureRegistration = async () => {
    // Try to reuse existing registration; if missing or not yet active, register and await readiness
    let registration =
      (await navigator.serviceWorker.getRegistration('/sw.js')) ||
      (await navigator.serviceWorker.getRegistration());

    if (!registration || !registration.active) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (e) {
        // swallow and rely on .ready below to throw if it fails
      }
    }

    // Wait for an active registration to be ready (ensures no race when subscribing)
    const readyRegistration = await navigator.serviceWorker.ready;
    return readyRegistration;
  };

  const subscribeToPush = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Request notification permission
      let permission: NotificationPermission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        throw new Error('Permissão de notificação negada');
      }

      // Ensure SW is registered and active (await readiness to avoid race condition)
      const registration = await ensureRegistration();

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      const vapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe or reuse existing
      const existing = await registration.pushManager.getSubscription();
      const sub =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey as unknown as BufferSource,
        }));

      const pushSubscription: PushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
          auth: arrayBufferToBase64(sub.getKey('auth')),
        },
      };

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription: pushSubscription }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar a inscrição de push');
      }

      setIsSubscribed(true);
      setSubscription(pushSubscription);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha ao ativar notificações push'
      );
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Unsubscribe from ALL registrations to avoid leftover subs from a different SW
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(async (reg) => {
          try {
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
              await sub.unsubscribe();
            }
          } catch (e) {
            // ignore per-reg errors
          }
        })
      );

      // Inform server (best-effort)
      try {
        const res = await fetch('/api/push/unsubscribe', { method: 'POST' });
        if (!res.ok) {
          // Surface server-side failure to the user
          const data = await res.json().catch(() => ({}) as any);
          throw new Error(data?.error || 'Falha ao atualizar servidor');
        }
      } catch (e) {
        // If server update fails, reflect in UI but still consider local unsub done
        if (e instanceof Error) setError(e.message);
      }

      // Double-check: if any subscription still exists, keep state accordingly
      const remaining = await getAnyExistingSubscription();
      setIsSubscribed(Boolean(remaining));
      setSubscription(remaining || null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Falha ao desativar notificações push'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    loading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
  };
}

// Utility: find any existing push subscription across all registrations
async function getAnyExistingSubscription(): Promise<PushSubscription | null> {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        return {
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey('p256dh')),
            auth: arrayBufferToBase64(sub.getKey('auth')),
          },
        };
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// Utility functions
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData =
    typeof atob !== 'undefined'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
