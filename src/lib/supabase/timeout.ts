/**
 * Races a thenable against a timeout.
 * If the timeout fires first, returns the fallback value cast as T.
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallback: any,
  ms = 3000
): Promise<T> {
  const timeoutPromise = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback as T), ms)
  )
  return Promise.race([Promise.resolve(promise), timeoutPromise])
}
