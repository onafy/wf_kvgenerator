import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AppShell } from './components/layout/AppShell'
import HomePage from './pages/Home/HomePage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import AssetConfigPage from './pages/NewProject/AssetConfigPage'
import GeneratePage from './pages/Generate/GeneratePage'
import EditorPage from './pages/Editor/EditorPage'
import ExportPage from './pages/Export/ExportPage'
import TemplateLibraryPage from './pages/Templates/TemplateLibraryPage'
import TemplateSetupPage from './pages/Templates/TemplateSetupPage'
import ProjectDetailPage from './pages/ProjectDetail/ProjectDetailPage'
import ShareViewPage from './pages/Share/ShareViewPage'
import ImageEditorDashboardPage from './pages/ImageEditor/ImageEditorDashboardPage'
import ImageEditorEntryPage from './pages/ImageEditor/ImageEditorEntryPage'
import ImageEditorCanvasPage from './pages/ImageEditor/ImageEditorCanvasPage'

import ResizerDashboardPage from './pages/Resizer/ResizerDashboardPage'
import ResizerEntryPage from './pages/Resizer/ResizerEntryPage'
import ResizerSessionPage from './pages/Resizer/ResizerSessionPage'



const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },

  // KV Generator + shared shell
  {
    path: '/kv-generator',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'new', element: <AssetConfigPage /> },
      { path: 'new/generate', element: <GeneratePage /> },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'projects/:id/generate', element: <GeneratePage /> },
      { path: 'projects/:id/edit', element: <EditorPage /> },
      { path: 'projects/:id/export', element: <ExportPage /> },
      { path: 'templates', element: <TemplateLibraryPage /> },
      { path: 'templates/:id/setup', element: <TemplateSetupPage /> },
    ],
  },

  // Image Editor (standalone tool, shares AppShell nav)
  {
    path: '/image-editor',
    element: <AppShell />,
    children: [
      { index: true, element: <ImageEditorDashboardPage /> },
      { path: 'new', element: <ImageEditorEntryPage /> },
      { path: 'edit', element: <ImageEditorCanvasPage /> },
    ],
  },

  // Public share view (no nav)
  { path: '/share/:token', element: <ShareViewPage /> },

  // Resizer tool
  {
    path: '/resizer',
    element: <AppShell />,
    children: [
      { index: true, element: <ResizerDashboardPage /> },
      { path: 'new', element: <ResizerEntryPage /> },
      { path: 'projects/:id', element: <ResizerSessionPage /> },
    ],
  },
])

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Analytics />
    </>
  )
}
