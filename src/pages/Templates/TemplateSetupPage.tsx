import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, RefreshCw, ChevronRight, Loader2, ImageIcon, Sparkles, Eye, X } from 'lucide-react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { mockBrandProfileV3 } from '../../mock'
import type { Template } from '../../types'

type BackgroundChoice = 'generate' | 'keep'

function PreviewModal({ template, onClose, onApply }: { template: Template; onClose: () => void; onApply: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Template Preview — {template.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="p-6">
          <div className="relative mb-4 rounded-xl overflow-hidden bg-gray-100 aspect-video">
            <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
            {/* Bounding box overlay — illustrative */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[10%] left-[8%] w-[40%] h-[35%] border-2 border-dashed border-white/70 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded">Background</span>
              </div>
              <div className="absolute bottom-[12%] right-[8%] w-[38%] h-[25%] border-2 border-dashed border-cimb-red/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-medium bg-cimb-red/60 px-2 py-0.5 rounded">Logo zone</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span>By {template.creatorName}</span>
            <span>·</span>
            <span>Used {template.usageCount}×</span>
            <span>·</span>
            <span>{template.segment}</span>
            <span>·</span>
            <span className="capitalize">{template.originTool === 'KVGenerator' ? 'KV Generator' : 'Image Editor'}</span>
          </div>
          <button
            onClick={onApply}
            className="w-full py-3 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-800 flex items-center justify-center gap-2"
          >
            <ChevronRight size={16} /> Apply this template
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TemplateSetupPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTemplate } = useTemplateStore()
  const template = getTemplate(id || '')

  const [refreshBrand, setRefreshBrand] = useState(false)
  const [backgroundChoice, setBackgroundChoice] = useState<BackgroundChoice>('generate')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">Template not found.</p>
        <button onClick={() => navigate('/kv-generator/templates')} className="mt-4 text-sm text-cimb-red hover:underline">
          ← Back to Templates
        </button>
      </div>
    )
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      navigate('/kv-generator/new/generate')
    }, 1800)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <button onClick={() => navigate('/kv-generator/templates')} className="hover:text-gray-700">Templates</button>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{template.name}</span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Template Setup</h2>

      {/* Template preview card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 flex gap-4">
        <div className="relative shrink-0">
          <img src={template.thumbnailUrl} alt={template.name} className="w-32 aspect-square object-cover rounded-lg" />
          <button
            onClick={() => setShowPreview(true)}
            className="absolute bottom-2 right-2 bg-black/60 text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 hover:bg-black/80"
          >
            <Eye size={11} /> Preview
          </button>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${template.originTool === 'KVGenerator' ? 'bg-red-100 text-cimb-red' : 'bg-violet-100 text-violet-700'}`}>
              {template.originTool === 'KVGenerator' ? 'KV Generator' : 'Image Editor'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">By {template.creatorName} · Used {template.usageCount} times</p>
          <p className="text-xs text-gray-400">Saved {new Date(template.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Brand Identity Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Lock size={14} className="text-green-500" /> Brand Identity
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`relative w-9 h-5 rounded-full transition-colors ${refreshBrand ? 'bg-cimb-red' : 'bg-gray-200'}`}
              onClick={() => setRefreshBrand(!refreshBrand)}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${refreshBrand ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-gray-600">Refresh Brand Identity</span>
          </label>
        </div>
        <div className="flex items-center gap-4">
          <img src={mockBrandProfileV3.logoUrl} alt="CIMB" className="h-6" />
          <div className="flex gap-2">
            {[mockBrandProfileV3.primaryColor, mockBrandProfileV3.secondaryColor].map((c) => (
              <div key={c.hex} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ background: c.hex }} />
                <span className="text-xs text-gray-500">{c.hex}</span>
              </div>
            ))}
          </div>
          <span className="text-xs text-gray-500">{mockBrandProfileV3.fonts.join(', ')}</span>
          {refreshBrand && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <RefreshCw size={10} /> Refreshed to v3
            </span>
          )}
        </div>
      </div>

      {/* Background / Imagery Choice */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">Background / Imagery</h3>
        <p className="text-xs text-gray-500 mb-4">
          Do you want to generate a new background image, or keep the existing one?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setBackgroundChoice('generate')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${backgroundChoice === 'generate' ? 'border-cimb-red bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
          >
            {backgroundChoice === 'generate' && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-cimb-red rounded-full flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
            )}
            <div className="w-8 h-8 rounded-lg bg-cimb-red/10 flex items-center justify-center mb-3">
              <Sparkles size={16} className="text-cimb-red" />
            </div>
            <p className={`text-sm font-semibold mb-1 ${backgroundChoice === 'generate' ? 'text-cimb-red' : 'text-gray-800'}`}>Generate new image</p>
            <p className="text-xs text-gray-500 leading-relaxed">AI creates fresh background imagery for this campaign cycle. Recommended for new creatives.</p>
            {backgroundChoice === 'generate' && <span className="inline-block mt-2 text-xs bg-cimb-red text-white px-2 py-0.5 rounded-full">Default</span>}
          </button>

          <button
            onClick={() => setBackgroundChoice('keep')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${backgroundChoice === 'keep' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
          >
            {backgroundChoice === 'keep' && (
              <div className="absolute top-3 right-3 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
            )}
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
              <ImageIcon size={16} className="text-gray-500" />
            </div>
            <p className={`text-sm font-semibold mb-1 ${backgroundChoice === 'keep' ? 'text-gray-900' : 'text-gray-800'}`}>Keep existing image</p>
            <p className="text-xs text-gray-500 leading-relaxed">Reuses the background from this template. Use for copy swaps where only text or assets change.</p>
          </button>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-3.5 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isGenerating
          ? <><Loader2 size={18} className="animate-spin" /> Preparing generation...</>
          : <><ChevronRight size={18} /> Generate Image Options from Template</>
        }
      </button>

      {showPreview && (
        <PreviewModal
          template={template}
          onClose={() => setShowPreview(false)}
          onApply={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
