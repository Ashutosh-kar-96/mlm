import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'

export function usePageTitle(title, subtitle) {
  const { setPageMeta } = useOutletContext() || {}
  useEffect(() => {
    setPageMeta?.({ title, subtitle })
  }, [setPageMeta, title, subtitle])
}
