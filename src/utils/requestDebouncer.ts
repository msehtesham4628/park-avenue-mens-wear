/**
 * Park Avenue Menswear — Async Request Debouncer & Coalescer
 * 
 * Prevents multiple rapid triggers from slamming the backend concurrently,
 * eliminating the thundering herd problem, race conditions, and excessive 304s.
 */

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delayMs = 300
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: any = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let resolveCurrent: ((value: ReturnType<T>) => void) | null = null;
  let rejectCurrent: ((reason?: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timer) {
      clearTimeout(timer);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
        resolveCurrent = resolve;
        rejectCurrent = reject;
      });
    }

    timer = setTimeout(async () => {
      timer = null;
      const res = resolveCurrent;
      const rej = rejectCurrent;
      pendingPromise = null;
      resolveCurrent = null;
      rejectCurrent = null;

      try {
        const result = await fn(...args);
        if (res) res(result);
      } catch (err) {
        if (rej) rej(err);
      }
    }, delayMs);

    return pendingPromise;
  };
}
