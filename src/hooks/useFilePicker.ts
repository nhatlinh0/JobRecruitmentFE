import { useEffect, useRef, useState, type ChangeEvent } from 'react'

export function useFilePicker() {
  const [selected, setSelected] = useState<{ file: File; url: string } | null>(null)
  const urlRef = useRef('')

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  function pick(event: ChangeEvent<HTMLInputElement>) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const file = event.target.files?.[0]
    urlRef.current = file ? URL.createObjectURL(file) : ''
    setSelected(file ? { file, url: urlRef.current } : null)
  }

  return { file: selected?.file ?? null, url: selected?.url ?? '', pick }
}
