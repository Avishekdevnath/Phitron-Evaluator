import { ProviderSettings } from '../../types/index'
import { storageService } from '../storage/storageService'
import { validateOpenAIKey } from '../../utils/validation'

export interface SettingsService {
  getProviderSettings(): Promise<ProviderSettings>
  setProviderSettings(settings: ProviderSettings): Promise<void>
  validateAndSetKey(key: string): Promise<void>
}

export class SettingsServiceImpl implements SettingsService {
  async getProviderSettings(): Promise<ProviderSettings> {
    return storageService.getProviderSettings()
  }

  async setProviderSettings(settings: ProviderSettings): Promise<void> {
    if (settings.apiKey) {
      validateOpenAIKey(settings.apiKey)
    }
    await storageService.saveProviderSettings(settings)
  }

  async validateAndSetKey(key: string): Promise<void> {
    validateOpenAIKey(key)
    const current = await this.getProviderSettings()
    await this.setProviderSettings({
      ...current,
      apiKey: key,
      mode: 'custom',
    })
  }
}

export const settingsService = new SettingsServiceImpl()
