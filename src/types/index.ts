// Project
export type ProjectStatus = 'Draft' | 'InProgress' | 'Exported'

export type FunnelStage = 'Awareness' | 'Consideration' | 'Conversion'

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  segment: string
  funnel: FunnelStage
  creatorId: string
  creatorName: string
  lastModifiedAt: string
  baseAssetUrl: string
  thumbnailUrl: string
  contextId: string
  templateVersionRef?: { templateId: string; version: number } | null
}

// Context
export interface LockedContext {
  projectName: string
  copy: string
  segment: string
  funnel: FunnelStage
  canvasOrientation: CanvasOrientation
  artDirection: string
  assets: DAMAsset[]  // Single array - no base/custom distinction
  brandProfileId: string
  brandProfileVersion: string
  lockedAt: string
}

// DAM Asset
export interface DAMAsset {
  id: string
  filename: string
  dimensionLabel: string
  thumbnailUrl: string
  campaignTag: string
  brandTag: string
  uploadDate: string
}

// Variant
export interface Variant {
  id: string
  projectId: string
  jobId: string
  thumbnailUrl: string
  promptUsed: string
  isGeneratedWithPreviousContext: boolean
  isPinned: boolean
  createdAt: string
  batchNumber: number
}

// Generation Job
export type JobStatus = 'queued' | 'validating' | 'processing' | 'complete' | 'failed'

export interface GenerationJob {
  id: string
  projectId: string
  status: JobStatus
  progress: number
  startedAt: string
  completedAt?: string
  variantIds: string[]
}

// Version
export type VersionAction = 'InitialGeneration' | 'Regeneration' | 'InPainting'

export interface Version {
  id: string
  projectId: string
  versionNumber: number
  thumbnailUrl: string
  action: VersionAction
  promptSummary: string
  createdAt: string
  createdBy: string
  isGeneratedWithPreviousContext: boolean
}

// Bounding Box
export interface BoundingBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  prompt: string
  isActive: boolean
}

// Template
export type TemplateOrigin = 'KVGenerator' | 'ImageEditor'

export interface Template {
  id: string
  name: string
  originTool: TemplateOrigin
  segment: string
  creatorId: string
  creatorName: string
  lastUsedAt: string
  usageCount: number
  thumbnailUrl: string
  brandProfileVersion: string
  isPersonal: boolean
  savedAt: string
}

// Brand
export interface BrandColor {
  name: string
  hex: string
}

export interface BrandProfile {
  id: string
  version: string
  clientName: string
  logoUrl: string
  primaryColor: BrandColor
  secondaryColor: BrandColor
  fonts: string[]
}

export interface BrandDiff {
  field: string
  from: string
  to: string
}

// Export
export type DimensionPlatform = 'Meta' | 'TikTok' | 'Owned Socmed' | 'App & Web' | 'Google'
export type DimensionOrientation = 'Square' | 'Horizontal' | 'Vertical'

export type CanvasOrientation = 'Portrait' | 'Landscape' | 'Square'

export interface DimensionProfile {
  id: string
  label: string
  width: number
  height: number
  platform: DimensionPlatform
  orientation: DimensionOrientation
  estimatedSize: string
}

export interface ShareLink {
  id: string
  token: string
  variantId: string
  projectId: string
  createdAt: string
  expiresAt: string
  isRevoked: boolean
  imageUrl?: string
}

export interface ExportRecord {
  id: string
  projectId: string
  exportedAt: string
  fileCount: number
  downloadUrl: string
}

export interface NamingConvention {
  campaign: string
  segment: string
  version: string
}

// Canvas Element (used in Editor)
export type ElementType = 'Static' | 'Dynamic'
export type RegenScope = 'Regenerate' | 'Preserve'

export interface CanvasElement {
  id: string
  label: string
  type: ElementType
  assetUrl?: string
  regenScope: RegenScope
}

export interface ImageEditorProject {
  id: string
  name: string
  sourceProjectId?: string
  sourceProjectName?: string
  sourceImageUrl: string | null
  brandEnabled: boolean
  createdAt: string
  lastEditedAt: string
  thumbnailUrl?: string
}

export interface ResizerProject {
  id: string
  name: string
  sourceProjectId?: string
  sourceProjectName?: string
  sourceImageUrl: string | null
  createdAt: string
  lastEditedAt: string
  thumbnailUrl?: string
  selectedDimIds: string[]
  naming: NamingConvention
  zipStructure: 'flat' | 'grouped'
  editedTileImages: Record<string, string>
}
