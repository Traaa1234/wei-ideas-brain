// Hash routing: #/read/<id>, #/grownups/words ...
import { useEffect, useState } from 'react'

export function useRoute(): string[] {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => {
      setHash(location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent)
}

export const go = (path: string) => {
  location.hash = '#/' + path.replace(/^\//, '')
}
