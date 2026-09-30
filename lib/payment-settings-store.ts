import fs from 'fs'
import path from 'path'
import { PAYMENT_CONFIG } from './payment-config'

const DATA_DIR = path.join(process.cwd(), 'data')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

export type DynamicSettings = {
  telegramBotToken: string
  telegramChatId: string
  resendApiKey: string
  adminEmail: string
  sepayAccountNumber: string
  sepayBankCode: string
  sepayAccountName: string
  momoPartnerCode: string
}

export function getDynamicSettings(): DynamicSettings {
  const defaults: DynamicSettings = {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@legend.vn',
    sepayAccountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '090123456789',
    sepayBankCode: process.env.SEPAY_BANK_CODE || 'MBBank',
    sepayAccountName: process.env.SEPAY_ACCOUNT_NAME || 'CONG TY TNHH TRANG SUC LEGEND',
    momoPartnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  }

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      return { ...defaults, ...parsed }
    }
  } catch (err) {
    console.error('Error reading dynamic settings:', err)
  }

  return defaults
}

export function saveDynamicSettings(updates: Partial<DynamicSettings>): DynamicSettings {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    const current = getDynamicSettings()
    const merged = { ...current, ...updates }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8')
    return merged
  } catch (err) {
    console.error('Error saving dynamic settings:', err)
    return getDynamicSettings()
  }
}
