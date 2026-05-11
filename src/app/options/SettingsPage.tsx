import React, { useState, useEffect } from 'react'
import { ProviderSettings, GradingStrictness } from '../../types/index'
import { settingsService } from '../../services/settings/settingsService'
import { OpenAIProvider } from '../../core/providers/openaiProvider'
import Button from '../../components/shared/Button'
import Card from '../../components/shared/Card'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import Alert from '../../components/shared/Alert'
import { getFriendlyErrorMessage, logAppError } from '../../utils/errors'

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProviderSettings | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [strictness, setStrictness] = useState<GradingStrictness>('balanced')
  const [detectAI, setDetectAI] = useState(true)
  const [feedbackFormat, setFeedbackFormat] = useState<'html' | 'plaintext'>('html')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      setError(null)
      const current = await settingsService.getProviderSettings()
      setSettings(current)
      setApiKey(current.apiKey || '')
      setStrictness(current.evaluatorSettings?.strictness || 'balanced')
      setDetectAI(current.evaluatorSettings?.detectAI ?? true)
      setFeedbackFormat(current.evaluatorSettings?.feedbackFormat || 'html')
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to load settings'))
      logAppError('Failed to load settings', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveKey() {
    if (!apiKey.trim()) {
      setError('API key is required')
      return
    }

    try {
      setError(null)
      setSuccess(null)
      setSaving(true)
      await settingsService.validateAndSetKey(apiKey.trim())

      // Save evaluator settings
      const updated = await settingsService.getProviderSettings()
      updated.evaluatorSettings = {
        strictness,
        detectAI,
        feedbackFormat,
      }
      await chrome.storage.sync.set({ providerSettings: JSON.stringify(updated) })

      setSettings(updated)
      setSuccess('✓ Settings saved successfully')
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to save settings'))
      logAppError('Failed to save settings', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    if (!apiKey.trim()) {
      setError('Please enter an API key first')
      return
    }

    try {
      setTesting(true)
      setError(null)
      setSuccess(null)
      const provider = new OpenAIProvider(apiKey.trim())
      const connected = await provider.testConnection()

      if (connected) {
        setSuccess('✓ Connection successful! Your API key is valid.')
      } else {
        setError('❌ Connection failed. Check your API key and try again.')
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Connection test failed'))
      logAppError('Connection test failed', err)
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading settings..." />

  if (!settings) {
    return (
      <Card className="p-6 bg-red-50 border-red-200 space-y-3">
        <p className="text-sm text-red-700">
          {error || 'Unable to load settings right now.'}
        </p>
        <Button
          onClick={loadSettings}
          variant="danger"
        >
          Retry Loading Settings
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">AI Provider Settings</h2>

        {error && (
          <Alert
            variant="error"
            message={error}
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}
        {success && (
          <Alert
            variant="success"
            message={success}
            onDismiss={() => setSuccess(null)}
            className="mb-4"
          />
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <div className="p-3 bg-gray-100 rounded text-sm">
              OpenAI (GPT-4 Turbo)
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gemini and Claude support coming in future versions
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">API Key *</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={testing || saving}
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your free API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveKey}
              variant="primary"
              disabled={testing || saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save API Key'}
            </Button>
            <Button
              onClick={handleTestConnection}
              variant="success"
              disabled={testing || saving}
              className="flex-1"
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Evaluation Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Strictness Level</label>
            <div className="flex gap-2">
              {(['lenient', 'balanced', 'strict'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setStrictness(level)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    strictness === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={saving}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Lenient: +5-10% mark boost | Balanced: standard marking | Strict: -5-10% mark reduction
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">AI Detection</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={detectAI}
                onChange={e => setDetectAI(e.target.checked)}
                disabled={saving}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Flag suspicious answers that may be AI-generated
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              When enabled, feedback will include ⚠️ flags for high AI likelihood answers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Feedback Format</label>
            <div className="flex gap-2">
              {(['html', 'plaintext'] as const).map(format => (
                <button
                  key={format}
                  onClick={() => setFeedbackFormat(format)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                    feedbackFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={saving}
                >
                  {format === 'html' ? 'HTML' : 'Plain Text'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              HTML: formatted for Phitron editor | Plain Text: easy copy-paste for manual entry
            </p>
          </div>

          <Button
            onClick={handleSaveKey}
            variant="primary"
            disabled={testing || saving}
            className="w-full"
          >
            {saving ? 'Saving Settings...' : 'Save All Settings'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold mb-2 text-sm">💡 Free OpenAI API Access</h3>
        <p className="text-sm text-gray-700">
          New OpenAI accounts come with free API credits ($5) for API calls. This is separate
          from ChatGPT Plus and perfect for testing the evaluator.
        </p>
      </Card>

      <Card className="p-6 bg-yellow-50">
        <h3 className="font-semibold mb-2 text-sm">🔒 Privacy & Security</h3>
        <p className="text-sm text-gray-700">
          Your API key is stored only in this extension's local storage and never sent anywhere
          except to OpenAI for evaluation requests.
        </p>
      </Card>
    </div>
  )
}
