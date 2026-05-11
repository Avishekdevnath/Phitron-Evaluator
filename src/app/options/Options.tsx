import React from 'react'
import SettingsPage from './SettingsPage'

export default function Options() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600 mt-1">Configure your Phitron Evaluator extension</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SettingsPage />
      </div>
    </div>
  )
}
