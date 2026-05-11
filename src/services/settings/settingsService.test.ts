import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SettingsServiceImpl } from './settingsService'
import { storageService } from '../storage/storageService'
import { ValidationError } from '../../types/index'

vi.mock('../storage/storageService')

describe('SettingsService', () => {
  let service: SettingsServiceImpl

  beforeEach(() => {
    service = new SettingsServiceImpl()
    vi.clearAllMocks()
  })

  it('should get provider settings', async () => {
    const mockSettings = {
      mode: 'custom' as const,
      provider: 'openai' as const,
      apiKey: 'sk-test123',
    }

    vi.mocked(storageService.getProviderSettings).mockResolvedValue(mockSettings)

    const settings = await service.getProviderSettings()

    expect(settings.apiKey).toBe('sk-test123')
    expect(settings.provider).toBe('openai')
  })

  it('should validate and set API key', async () => {
    vi.mocked(storageService.getProviderSettings).mockResolvedValue({
      mode: 'custom',
      provider: 'openai',
    })
    vi.mocked(storageService.saveProviderSettings).mockResolvedValue(undefined)

    await service.validateAndSetKey('sk-test123456789')

    expect(vi.mocked(storageService.saveProviderSettings)).toHaveBeenCalled()
    const call = vi.mocked(storageService.saveProviderSettings).mock.calls[0][0]
    expect(call.apiKey).toBe('sk-test123456789')
    expect(call.mode).toBe('custom')
  })

  it('should throw on invalid API key format', async () => {
    await expect(service.validateAndSetKey('invalid-key')).rejects.toThrow(ValidationError)
  })

  it('should throw on empty API key', async () => {
    await expect(service.validateAndSetKey('')).rejects.toThrow(ValidationError)
  })

  it('should set provider settings with validation', async () => {
    vi.mocked(storageService.saveProviderSettings).mockResolvedValue(undefined)

    await service.setProviderSettings({
      mode: 'custom',
      provider: 'openai',
      apiKey: 'sk-test123',
    })

    expect(vi.mocked(storageService.saveProviderSettings)).toHaveBeenCalled()
  })

  it('should reject invalid settings', async () => {
    await expect(
      service.setProviderSettings({
        mode: 'custom',
        provider: 'openai',
        apiKey: 'invalid',
      })
    ).rejects.toThrow(ValidationError)
  })
})
