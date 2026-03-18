import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useExportStore } from '../../store/useExportStore'
import { useGenerationStore } from '../../store/useGenerationStore'
import { Layers, Clock, AlertTriangle, XCircle, Download, Maximize2, X } from 'lucide-react'

export default function ShareViewPage() {
  const { token } = useParams<{ token: string }>()
  const { getLinkByToken } = useExportStore()
  const { variants } = useGenerationStore()
  const [selectedAsset, setSelectedAsset] = useState<{ id: string, label: string, dim: string, format: string } | null>(null)

  const link = getLinkByToken(token || '')

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Link Not Found</h2>
        <p className="text-sm text-gray-500">This share link doesn't exist or has been removed.</p>
      </div>
    )
  }

  const expired = new Date(link.expiresAt) < new Date()

  if (link.isRevoked || expired) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{link.isRevoked ? 'Link Revoked' : 'Link Expired'}</h2>
        <p className="text-sm text-gray-500">
          {link.isRevoked ? 'This share link has been revoked by the creator.' : 'This share link expired on ' + new Date(link.expiresAt).toLocaleDateString() + '.'}
        </p>
        <p className="text-xs text-gray-400 mt-3">Please contact the sender for an updated link.</p>
      </div>
    )
  }

  const allVariants = Object.values(variants).flat()
  const variant = allVariants.find((v) => v.id === link.variantId) || allVariants[0]

  const previewImage = link.imageUrl || variant?.thumbnailUrl
  const promptText = variant?.promptUsed || 'No prompt info (uploaded asset)'

  const mockResizedAssets = [
    { id: 'st', label: 'IG/FB Story / TikTok', dim: '1080×1920', format: 'aspect-[9/16] inline-block w-full max-w-[280px]' },
    { id: 'sq', label: 'Instagram Feed Post', dim: '1080×1080', format: 'aspect-square inline-block w-full max-w-[400px]' },
    { id: 'fb', label: 'Facebook / OG Link', dim: '1200×628', format: 'aspect-[1.91/1] inline-block w-full max-w-[500px]' },
    { id: 'db', label: 'MREC Display', dim: '300×250', format: 'aspect-[1.2/1] inline-block w-full max-w-[300px]' },
    { id: 'lb', label: 'Leaderboard Banner', dim: '728×90', format: 'aspect-[8.08/1] inline-block w-full max-w-[600px]' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Minimal header */}
      <header className="bg-black/40 text-white py-3 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-cimb-red" />
          <span className="font-semibold text-sm">frndOS — Export Package Preview</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            Expires {new Date(link.expiresAt).toLocaleDateString()}
          </div>
          <button className="bg-cimb-red hover:bg-cimb-red/90 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            Approve All
          </button>
        </div>
      </header>

      {/* Asset Gallery */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Campaign Retail - Q1 2026</h1>
              <p className="text-gray-400 text-sm">Review this exported set across all platform dimensions before final approval.</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-right">
                <span className="text-gray-400 text-xs block mb-0.5">Base Art Direction</span>
                <p className="text-white text-sm max-w-[300px] truncate" title={promptText}>{promptText}</p>
            </div>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-12">
            {mockResizedAssets.map(asset => (
              <div key={asset.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 break-inside-avoid">
                 <div className="bg-gray-800/80 px-4 py-3 flex items-start justify-between border-b border-gray-700">
                    <div>
                       <h3 className="text-sm font-medium text-white">{asset.label}</h3>
                       <span className="text-cimb-red text-xs font-mono bg-red-950/50 px-1.5 py-0.5 rounded inline-block mt-1">{asset.dim}</span>
                    </div>
                 </div>
                 
                 <div 
                    className="bg-[#0b0f19] p-4 flex items-center justify-center relative cursor-pointer group"
                    onClick={() => setSelectedAsset(asset)}
                 >
                   <img 
                     src={previewImage} 
                     alt={asset.label} 
                     className={`${asset.format} object-cover rounded shadow-xl ring-1 ring-white/10 group-hover:opacity-75 transition-opacity duration-300`} 
                   />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/60 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
                        <Maximize2 size={16} />
                        Preview
                      </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {/* Preview & Download Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col backdrop-blur-sm">
          <header className="flex items-center justify-between px-6 py-4">
            <div>
               <h3 className="text-white font-medium">{selectedAsset.label}</h3>
               <span className="text-gray-400 text-sm">{selectedAsset.dim}</span>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewImage as string;
                      link.download = `Campaign_${selectedAsset.label.replace(/[^a-zA-Z]/g, '')}_${selectedAsset.dim}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
               >
                 <Download size={16} />
                 Download
               </button>
               <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-white p-2">
                 <X size={24} />
               </button>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
             <img 
               src={previewImage!} 
               alt={selectedAsset.label} 
               className={`${selectedAsset.format} object-cover max-h-full max-w-full rounded shadow-2xl ring-1 ring-white/20`} 
             />
          </div>
        </div>
      )}

    </div>
  )
}
