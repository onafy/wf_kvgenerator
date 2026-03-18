import type { Project, Variant, DAMAsset, Template, BrandProfile, DimensionProfile, ShareLink, Version, TemplateOrigin, FunnelStage } from '../types'

// Gradient thumbnail placeholders using data URIs (colored backgrounds)
const THUMBS = [
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1593672715438-d88a70629abe?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=400&fit=crop',
]

export const mockProjects: Project[] = [
  { id: 'p1', name: 'Ramadan Promo 2026', status: 'Exported', segment: 'Family', funnel: 'Awareness' as FunnelStage, creatorId: 'u1', creatorName: 'Budi Santoso', lastModifiedAt: '2026-03-14T10:30:00Z', baseAssetUrl: THUMBS[0], thumbnailUrl: THUMBS[0], contextId: 'ctx1', templateVersionRef: null },
  { id: 'p2', name: 'Hari Raya Sale', status: 'InProgress', segment: 'Youth', funnel: 'Consideration' as FunnelStage, creatorId: 'u2', creatorName: 'Rina Kusuma', lastModifiedAt: '2026-03-13T14:20:00Z', baseAssetUrl: THUMBS[1], thumbnailUrl: THUMBS[1], contextId: 'ctx2', templateVersionRef: { templateId: 't1', version: 2 } },
  { id: 'p3', name: 'Premium Wealth Q2', status: 'InProgress', segment: 'Mass', funnel: 'Conversion' as FunnelStage, creatorId: 'u1', creatorName: 'Budi Santoso', lastModifiedAt: '2026-03-12T09:00:00Z', baseAssetUrl: THUMBS[2], thumbnailUrl: THUMBS[2], contextId: 'ctx3', templateVersionRef: null },
  { id: 'p4', name: 'Youth Card April', status: 'Draft', segment: 'Youth', funnel: 'Awareness' as FunnelStage, creatorId: 'u3', creatorName: 'Ahmad Fauzi', lastModifiedAt: '2026-03-11T16:45:00Z', baseAssetUrl: THUMBS[3], thumbnailUrl: THUMBS[3], contextId: 'ctx4', templateVersionRef: null },
  { id: 'p5', name: 'SME Financing Banner', status: 'Exported', segment: 'Mass', funnel: 'Conversion' as FunnelStage, creatorId: 'u2', creatorName: 'Rina Kusuma', lastModifiedAt: '2026-03-10T11:15:00Z', baseAssetUrl: THUMBS[4], thumbnailUrl: THUMBS[4], contextId: 'ctx5', templateVersionRef: { templateId: 't2', version: 1 } },
  { id: 'p6', name: 'Tabungan Emas Launch', status: 'Draft', segment: 'Family', funnel: 'Consideration' as FunnelStage, creatorId: 'u3', creatorName: 'Ahmad Fauzi', lastModifiedAt: '2026-03-09T08:30:00Z', baseAssetUrl: THUMBS[5], thumbnailUrl: THUMBS[5], contextId: 'ctx6', templateVersionRef: null },
  { id: 'p7', name: 'Xtra Saver Campaign', status: 'InProgress', segment: 'Mass', funnel: 'Awareness' as FunnelStage, creatorId: 'u1', creatorName: 'Budi Santoso', lastModifiedAt: '2026-03-08T13:00:00Z', baseAssetUrl: THUMBS[6], thumbnailUrl: THUMBS[6], contextId: 'ctx7', templateVersionRef: null },
  { id: 'p8', name: 'KPR Digital 2026', status: 'Exported', segment: 'Family', funnel: 'Conversion' as FunnelStage, creatorId: 'u2', creatorName: 'Rina Kusuma', lastModifiedAt: '2026-03-07T10:00:00Z', baseAssetUrl: THUMBS[7], thumbnailUrl: THUMBS[7], contextId: 'ctx8', templateVersionRef: null },
]

export const mockVariants: Record<string, Variant[]> = {
  p1: [
    { id: 'v1-1', projectId: 'p1', jobId: 'j1', thumbnailUrl: THUMBS[0], promptUsed: 'Warm sunset gradient with CIMB red accents, Ramadan crescent moon motif', isGeneratedWithPreviousContext: false, isPinned: true, createdAt: '2026-03-14T10:00:00Z', batchNumber: 1 },
    { id: 'v1-2', projectId: 'p1', jobId: 'j1', thumbnailUrl: THUMBS[1], promptUsed: 'Gold and red geometric pattern, modern Islamic art influence', isGeneratedWithPreviousContext: false, isPinned: false, createdAt: '2026-03-14T10:00:00Z', batchNumber: 1 },
    { id: 'v1-3', projectId: 'p1', jobId: 'j1', thumbnailUrl: THUMBS[2], promptUsed: 'Minimalist dark background, glowing crescent, premium feel', isGeneratedWithPreviousContext: true, isPinned: false, createdAt: '2026-03-14T10:01:00Z', batchNumber: 1 },
  ],
  p2: [
    { id: 'v2-1', projectId: 'p2', jobId: 'j2', thumbnailUrl: THUMBS[3], promptUsed: 'Festive hari raya lanterns, vibrant colors, youth energy', isGeneratedWithPreviousContext: false, isPinned: true, createdAt: '2026-03-13T14:00:00Z', batchNumber: 1 },
    { id: 'v2-2', projectId: 'p2', jobId: 'j2', thumbnailUrl: THUMBS[4], promptUsed: 'Modern geometric Raya pattern, CIMB red dominant', isGeneratedWithPreviousContext: false, isPinned: false, createdAt: '2026-03-13T14:00:00Z', batchNumber: 1 },
    { id: 'v2-3', projectId: 'p2', jobId: 'j2', thumbnailUrl: THUMBS[5], promptUsed: 'Split layout, before/after savings visualization, clean white', isGeneratedWithPreviousContext: false, isPinned: false, createdAt: '2026-03-13T14:01:00Z', batchNumber: 1 },
  ],
  p3: [
    { id: 'v3-1', projectId: 'p3', jobId: 'j3', thumbnailUrl: THUMBS[6], promptUsed: 'Dark luxury background, gold typography, premium wealth aesthetic', isGeneratedWithPreviousContext: false, isPinned: false, createdAt: '2026-03-12T09:00:00Z', batchNumber: 1 },
    { id: 'v3-2', projectId: 'p3', jobId: 'j3', thumbnailUrl: THUMBS[7], promptUsed: 'Abstract financial growth chart, upward lines, CIMB colors', isGeneratedWithPreviousContext: false, isPinned: true, createdAt: '2026-03-12T09:00:00Z', batchNumber: 1 },
    { id: 'v3-3', projectId: 'p3', jobId: 'j3', thumbnailUrl: THUMBS[0], promptUsed: 'Clean minimal, large white space, single gold accent element', isGeneratedWithPreviousContext: false, isPinned: false, createdAt: '2026-03-12T09:01:00Z', batchNumber: 1 },
  ],
}

export const mockDAMAssets: DAMAsset[] = [
  { id: 'dam1', filename: 'cimb_hero_ramadan_2026.jpg', dimensionLabel: '1200×628', thumbnailUrl: THUMBS[0], campaignTag: 'Ramadan2026', brandTag: 'CIMB', uploadDate: '2026-03-01' },
  { id: 'dam2', filename: 'cimb_product_hariraya_square.jpg', dimensionLabel: '1080×1080', thumbnailUrl: THUMBS[1], campaignTag: 'HariRaya2026', brandTag: 'CIMB', uploadDate: '2026-03-02' },
  { id: 'dam3', filename: 'cimb_wealth_banner_wide.jpg', dimensionLabel: '1200×628', thumbnailUrl: THUMBS[2], campaignTag: 'PremiumWealth', brandTag: 'CIMB', uploadDate: '2026-02-28' },
  { id: 'dam4', filename: 'cimb_youth_lifestyle_01.jpg', dimensionLabel: '1080×1080', thumbnailUrl: THUMBS[3], campaignTag: 'YouthCard', brandTag: 'CIMB', uploadDate: '2026-03-05' },
  { id: 'dam5', filename: 'cimb_sme_office_banner.jpg', dimensionLabel: '728×90', thumbnailUrl: THUMBS[4], campaignTag: 'SMEFinancing', brandTag: 'CIMB', uploadDate: '2026-03-03' },
  { id: 'dam6', filename: 'cimb_tabungan_hero.jpg', dimensionLabel: '1080×1920', thumbnailUrl: THUMBS[5], campaignTag: 'TabunganEmas', brandTag: 'CIMB', uploadDate: '2026-03-07' },
]

export const mockTemplates: Template[] = [
  {
    id: 't1', name: 'Master KV — Ramadan Layout', originTool: 'KVGenerator' as TemplateOrigin, segment: 'Retail',
    creatorId: 'u1', creatorName: 'Budi Santoso', lastUsedAt: '2026-03-13T14:00:00Z',
    usageCount: 7, thumbnailUrl: THUMBS[0], brandProfileVersion: 'v3', isPersonal: false,
    savedAt: '2026-03-01T11:30:00Z',
  },
  {
    id: 't2', name: 'SME Split Layout', originTool: 'KVGenerator' as TemplateOrigin, segment: 'SME',
    creatorId: 'u2', creatorName: 'Rina Kusuma', lastUsedAt: '2026-03-10T11:00:00Z',
    usageCount: 3, thumbnailUrl: THUMBS[4], brandProfileVersion: 'v3', isPersonal: false,
    savedAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 't3', name: 'Youth Stories Template', originTool: 'ImageEditor' as TemplateOrigin, segment: 'Youth',
    creatorId: 'u3', creatorName: 'Ahmad Fauzi', lastUsedAt: '2026-03-11T10:00:00Z',
    usageCount: 5, thumbnailUrl: THUMBS[3], brandProfileVersion: 'v3', isPersonal: true,
    savedAt: '2026-03-08T16:00:00Z',
  },
  {
    id: 't4', name: 'Premium Minimal — Dark', originTool: 'ImageEditor' as TemplateOrigin, segment: 'Premium',
    creatorId: 'u1', creatorName: 'Budi Santoso', lastUsedAt: '2026-03-12T09:00:00Z',
    usageCount: 2, thumbnailUrl: THUMBS[6], brandProfileVersion: 'v3', isPersonal: false,
    savedAt: '2026-03-12T09:00:00Z',
  },
]

export const mockBrandProfileV3: BrandProfile = {
  id: 'bp-cimb-v3',
  version: 'v3',
  clientName: 'CIMB Niaga',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/CIMB_Group_logo.svg/200px-CIMB_Group_logo.svg.png',
  primaryColor: { name: 'CIMB Red', hex: '#C8102E' },
  secondaryColor: { name: 'CIMB Gold', hex: '#F0A500' },
  fonts: ['GT Walsheim', 'Inter'],
}

export const mockBrandProfileV2: BrandProfile = {
  id: 'bp-cimb-v2',
  version: 'v2',
  clientName: 'CIMB Niaga',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/CIMB_Group_logo.svg/200px-CIMB_Group_logo.svg.png',
  primaryColor: { name: 'CIMB Red', hex: '#D0112B' },
  secondaryColor: { name: 'CIMB Gold', hex: '#E8A000' },
  fonts: ['GT Walsheim', 'Arial'],
}

export const mockDimensions: DimensionProfile[] = [
  // Meta
  { id: 'meta-sq',   label: 'Feed Square',    width: 1080, height: 1080, platform: 'Meta', orientation: 'Square',     estimatedSize: '~180KB' },
  { id: 'meta-h',    label: 'Feed Horizontal', width: 500,  height: 262,  platform: 'Meta', orientation: 'Horizontal', estimatedSize: '~55KB'  },
  { id: 'meta-v1',   label: 'Stories / Reels', width: 1080, height: 1920, platform: 'Meta', orientation: 'Vertical',   estimatedSize: '~320KB' },
  { id: 'meta-v2',   label: 'Feed Portrait',   width: 500,  height: 888,  platform: 'Meta', orientation: 'Vertical',   estimatedSize: '~110KB' },

  // TikTok
  { id: 'tt-sq',     label: 'Feed Square',     width: 640,  height: 640,  platform: 'TikTok', orientation: 'Square',     estimatedSize: '~95KB'  },
  { id: 'tt-h1',     label: 'Feed Horizontal',  width: 1200, height: 628,  platform: 'TikTok', orientation: 'Horizontal', estimatedSize: '~210KB' },
  { id: 'tt-h2',     label: 'In-Feed Wide',     width: 750,  height: 421,  platform: 'TikTok', orientation: 'Horizontal', estimatedSize: '~130KB' },
  { id: 'tt-v',      label: 'TopView / Full',   width: 720,  height: 1280, platform: 'TikTok', orientation: 'Vertical',   estimatedSize: '~240KB' },

  // Owned Socmed
  { id: 'os-sq',     label: 'Feed Square',      width: 1080, height: 1080, platform: 'Owned Socmed', orientation: 'Square',     estimatedSize: '~180KB' },
  { id: 'os-h',      label: 'Feed Horizontal',  width: 900,  height: 513,  platform: 'Owned Socmed', orientation: 'Horizontal', estimatedSize: '~150KB' },
  { id: 'os-v1',     label: 'Portrait 4:5',     width: 500,  height: 888,  platform: 'Owned Socmed', orientation: 'Vertical',   estimatedSize: '~110KB' },
  { id: 'os-v2',     label: 'Portrait 9:16',    width: 720,  height: 1280, platform: 'Owned Socmed', orientation: 'Vertical',   estimatedSize: '~240KB' },
  { id: 'os-v3',     label: 'Portrait 4:5 HD',  width: 1080, height: 1350, platform: 'Owned Socmed', orientation: 'Vertical',   estimatedSize: '~280KB' },
  { id: 'os-v4',     label: 'Stories',          width: 1080, height: 1920, platform: 'Owned Socmed', orientation: 'Vertical',   estimatedSize: '~320KB' },

  // App & Web
  { id: 'aw-h1',     label: 'Banner S',         width: 328,  height: 141,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~20KB'  },
  { id: 'aw-h2',     label: 'Banner M',         width: 400,  height: 244,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~35KB'  },
  { id: 'aw-h3',     label: 'Banner L',         width: 480,  height: 270,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~50KB'  },
  { id: 'aw-h4',     label: 'Tile Square-ish',  width: 571,  height: 521,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~75KB'  },
  { id: 'aw-h5',     label: 'Tile Wide',        width: 607,  height: 511,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~80KB'  },
  { id: 'aw-h6',     label: 'Tile Medium',      width: 636,  height: 480,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~80KB'  },
  { id: 'aw-h7',     label: 'Tile Large',       width: 677,  height: 567,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~95KB'  },
  { id: 'aw-h8',     label: 'Hero 16:9',        width: 800,  height: 450,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~110KB' },
  { id: 'aw-h9',     label: 'Hero HD',          width: 960,  height: 540,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~140KB' },
  { id: 'aw-h10',    label: 'OG Image',         width: 1200, height: 628,  platform: 'App & Web', orientation: 'Horizontal', estimatedSize: '~210KB' },
  { id: 'aw-v1',     label: 'Thumbnail',        width: 107,  height: 160,  platform: 'App & Web', orientation: 'Vertical',   estimatedSize: '~8KB'   },
  { id: 'aw-v2',     label: 'Portrait Banner',  width: 900,  height: 1200, platform: 'App & Web', orientation: 'Vertical',   estimatedSize: '~280KB' },

  // Google
  { id: 'goog-sq1',  label: 'Small Square',     width: 200,  height: 200,  platform: 'Google', orientation: 'Square',     estimatedSize: '~15KB'  },
  { id: 'goog-sq2',  label: 'Square',           width: 320,  height: 320,  platform: 'Google', orientation: 'Square',     estimatedSize: '~30KB'  },
  { id: 'goog-sq3',  label: 'Square M',         width: 513,  height: 513,  platform: 'Google', orientation: 'Square',     estimatedSize: '~65KB'  },
  { id: 'goog-sq4',  label: 'Square L',         width: 600,  height: 600,  platform: 'Google', orientation: 'Square',     estimatedSize: '~90KB'  },
  { id: 'goog-sq5',  label: 'Square HD',        width: 1080, height: 1080, platform: 'Google', orientation: 'Square',     estimatedSize: '~180KB' },
  { id: 'goog-sq6',  label: 'Square XL',        width: 1200, height: 1200, platform: 'Google', orientation: 'Square',     estimatedSize: '~220KB' },
  { id: 'goog-h1',   label: 'Small Rectangle',  width: 252,  height: 250,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~28KB'  },
  { id: 'goog-h2',   label: 'Medium Rectangle', width: 300,  height: 250,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~35KB'  },
  { id: 'goog-h3',   label: 'Banner Wide',      width: 480,  height: 320,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~55KB'  },
  { id: 'goog-h4',   label: 'Landscape',        width: 600,  height: 314,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~65KB'  },
  { id: 'goog-h5',   label: 'Billboard',        width: 900,  height: 472,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~130KB' },
  { id: 'goog-h6',   label: 'Landscape L',      width: 1064, height: 557,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~175KB' },
  { id: 'goog-h7',   label: 'Landscape XL',     width: 1200, height: 628,  platform: 'Google', orientation: 'Horizontal', estimatedSize: '~210KB' },
  { id: 'goog-h8',   label: 'Landscape HD',     width: 1080, height: 1075, platform: 'Google', orientation: 'Horizontal', estimatedSize: '~200KB' },
  { id: 'goog-h9',   label: 'Landscape Ultra',  width: 1290, height: 1080, platform: 'Google', orientation: 'Horizontal', estimatedSize: '~240KB' },
  { id: 'goog-v1',   label: 'Portrait S',       width: 320,  height: 400,  platform: 'Google', orientation: 'Vertical',   estimatedSize: '~45KB'  },
  { id: 'goog-v2',   label: 'Portrait M',       width: 414,  height: 513,  platform: 'Google', orientation: 'Vertical',   estimatedSize: '~65KB'  },
  { id: 'goog-v3',   label: 'Portrait L',       width: 960,  height: 1200, platform: 'Google', orientation: 'Vertical',   estimatedSize: '~280KB' },
  { id: 'goog-v4',   label: 'Portrait XL',      width: 1080, height: 1344, platform: 'Google', orientation: 'Vertical',   estimatedSize: '~300KB' },
  { id: 'goog-v5',   label: 'Portrait 4:5',     width: 1200, height: 1500, platform: 'Google', orientation: 'Vertical',   estimatedSize: '~340KB' },
  { id: 'goog-v6',   label: 'Portrait 9:16',    width: 1080, height: 1920, platform: 'Google', orientation: 'Vertical',   estimatedSize: '~320KB' },
]

export const mockVersions: Record<string, Version[]> = {
  p1: [
    { id: 'ver1-1', projectId: 'p1', versionNumber: 1, thumbnailUrl: THUMBS[0], action: 'InitialGeneration', promptSummary: 'Initial generation — Ramadan brief', createdAt: '2026-03-14T10:00:00Z', createdBy: 'Budi Santoso', isGeneratedWithPreviousContext: false },
    { id: 'ver1-2', projectId: 'p1', versionNumber: 2, thumbnailUrl: THUMBS[1], action: 'Regeneration', promptSummary: 'Add mosque silhouette, bottom-left bounding box', createdAt: '2026-03-14T10:15:00Z', createdBy: 'Budi Santoso', isGeneratedWithPreviousContext: false },
    { id: 'ver1-3', projectId: 'p1', versionNumber: 3, thumbnailUrl: THUMBS[2], action: 'InPainting', promptSummary: 'Brighten background gradient, warmer tones', createdAt: '2026-03-14T10:30:00Z', createdBy: 'Budi Santoso', isGeneratedWithPreviousContext: false },
  ],
  p2: [
    { id: 'ver2-1', projectId: 'p2', versionNumber: 1, thumbnailUrl: THUMBS[3], action: 'InitialGeneration', promptSummary: 'Initial generation — Hari Raya brief', createdAt: '2026-03-13T14:00:00Z', createdBy: 'Rina Kusuma', isGeneratedWithPreviousContext: false },
    { id: 'ver2-2', projectId: 'p2', versionNumber: 2, thumbnailUrl: THUMBS[4], action: 'InPainting', promptSummary: 'Replace background with darker gradient, more festive', createdAt: '2026-03-13T14:20:00Z', createdBy: 'Rina Kusuma', isGeneratedWithPreviousContext: true },
  ],
  p3: [
    { id: 'ver3-1', projectId: 'p3', versionNumber: 1, thumbnailUrl: THUMBS[6], action: 'InitialGeneration', promptSummary: 'Initial generation — Premium Wealth brief', createdAt: '2026-03-12T09:00:00Z', createdBy: 'Budi Santoso', isGeneratedWithPreviousContext: false },
    { id: 'ver3-2', projectId: 'p3', versionNumber: 2, thumbnailUrl: THUMBS[7], action: 'Regeneration', promptSummary: 'Gold accent on headline area, darker luxury feel', createdAt: '2026-03-12T09:25:00Z', createdBy: 'Budi Santoso', isGeneratedWithPreviousContext: false },
  ],
}

export const mockShareLinks: ShareLink[] = [
  { id: 'sl1', token: 'share-abc123def456', variantId: 'v1-1', projectId: 'p1', createdAt: '2026-03-14T11:00:00Z', expiresAt: '2026-03-21T11:00:00Z', isRevoked: false },
  { id: 'sl2', token: 'share-xyz789ghi012', variantId: 'v2-1', projectId: 'p2', createdAt: '2026-03-13T15:00:00Z', expiresAt: '2026-03-14T15:00:00Z', isRevoked: false },
  { id: 'sl3', token: 'share-revoked999', variantId: 'v3-2', projectId: 'p3', createdAt: '2026-03-12T10:00:00Z', expiresAt: '2026-03-19T10:00:00Z', isRevoked: true },
]
