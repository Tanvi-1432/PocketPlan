import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  onLoadMore: () => void
  rootMargin?: string
}

/**
 * IntersectionObserver helper for infinite lists.
 *
 * The hook returns a sentinel ref. When that sentinel approaches the viewport,
 * `onLoadMore` runs as long as `hasMore` is true.
 */
export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  rootMargin = '300px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMoreRef.current()
      },
      { root: null, rootMargin, threshold: 0 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, rootMargin])

  return sentinelRef
}
