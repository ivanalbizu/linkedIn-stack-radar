import { useEffect, useState } from 'react'

/** Botón que copia un texto al portapapeles con feedback temporal. */
export function CopyPromptButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback para contextos sin Clipboard API
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
  }

  return (
    <button type="button" className="copy-btn" onClick={copy} aria-live="polite">
      {copied ? '✓ Copiado' : `📋 ${label}`}
    </button>
  )
}
