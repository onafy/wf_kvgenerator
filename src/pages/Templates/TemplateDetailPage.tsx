import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Template detail is now shown as a modal within TemplateLibraryPage.
// This route redirects to the library if accessed directly.
export default function TemplateDetailPage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/kv-generator/templates', { replace: true })
  }, [navigate])

  return null
}
