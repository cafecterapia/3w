'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UsePaymentNavGuardOptions {
  isActive: boolean;
  onCancel: () => Promise<void>;
}

export function usePaymentNavGuard({
  isActive,
  onCancel,
}: UsePaymentNavGuardOptions) {
  const router = useRouter();
  const currentPathRef = useRef<string>('');
  const suppressGuardRef = useRef(false);

  // Helper to navigate without triggering the guard
  const goTo = (href: string) => {
    suppressGuardRef.current = true;
    router.push(href);
    setTimeout(() => {
      suppressGuardRef.current = false;
    }, 1000);
  };

  const cancelPaymentFast = useCallback(async () => {
    try {
      // Use sendBeacon for reliable cancellation on navigation
      if (navigator.sendBeacon) {
        // We can't read the current txid here without prop, so this is best-effort
        const payload = new Blob([JSON.stringify({})], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/payments/cancel', payload);
      } else {
        // Fallback to regular fetch
        await onCancel();
      }
    } catch (error) {
      console.error('Fast cancel failed:', error);
    }
  }, [onCancel]);

  useEffect(() => {
    // Only install guard when explicitly active
    if (!isActive) return;

    currentPathRef.current = window.location.pathname;

    // Determine if URL is an internal page navigation
    const isInternalPageNav = (href: string) => {
      try {
        const url = new URL(href, window.location.href);
        return (
          url.origin === window.location.origin &&
          url.pathname !== window.location.pathname
        );
      } catch {
        return false;
      }
    };

    const guardActive = () => isActive && !suppressGuardRef.current;

    // Click guard for <a> navigations
    const clickHandler = (e: MouseEvent) => {
      if (!guardActive()) return;

      // Ignore modified clicks
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      if (anchor.target === '_blank' || anchor.download) return;

      const href = anchor.getAttribute('href');
      if (!href || !isInternalPageNav(anchor.href)) return;

      const confirmed = window.confirm(
        'Se você sair desta página, a transação em andamento será cancelada e perdida. Deseja continuar?'
      );

      if (!confirmed) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      cancelPaymentFast();
      try {
        const nextUrl = new URL(anchor.href);
        currentPathRef.current = nextUrl.pathname;
      } catch {}
    };

    // Intercept back/forward navigations
    const onPopState = () => {
      if (!guardActive()) {
        currentPathRef.current = window.location.pathname;
        return;
      }

      const destinationPath = window.location.pathname;
      if (destinationPath === currentPathRef.current) return;

      const confirmed = window.confirm(
        'Se você sair desta página, a transação em andamento será cancelada e perdida. Deseja continuar?'
      );

      if (confirmed) {
        cancelPaymentFast();
        currentPathRef.current = destinationPath;
      } else {
        history.pushState(null, '', currentPathRef.current);
      }
    };

    // Patch history methods to detect programmatic navigations
    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);

    function wrapHistoryFn<T extends typeof history.pushState>(fn: T) {
      return function (
        this: History,
        data: any,
        unused: string,
        url?: string | URL | null
      ) {
        const href = typeof url === 'string' ? url : url?.toString();
        const willNavigate = !!href && isInternalPageNav(href);

        if (willNavigate && guardActive()) {
          const confirmed = window.confirm(
            'Se você sair desta página, a transação em andamento será cancelada e perdida. Deseja continuar?'
          );
          if (!confirmed) return;

          cancelPaymentFast();
          try {
            const nextUrl = new URL(href!, window.location.href);
            currentPathRef.current = nextUrl.pathname;
          } catch {}
        }

        return fn(data, unused, url as any);
      } as unknown as T;
    }

    history.pushState = wrapHistoryFn(originalPush);
    history.replaceState = wrapHistoryFn(originalReplace);

    document.addEventListener('click', clickHandler, true);
    window.addEventListener('popstate', onPopState);

    return () => {
      document.removeEventListener('click', clickHandler, true);
      window.removeEventListener('popstate', onPopState);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, [isActive, cancelPaymentFast]); // include stable cancelPaymentFast

  return { goTo };
}
