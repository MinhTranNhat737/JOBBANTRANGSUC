'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Send,
  Mail,
  Landmark,
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Key,
  MessageSquare,
} from 'lucide-react'

type ConfigState = {
  sepay: {
    bankCode: string
    accountNumber: string
    accountName: string
    hasApiKey: boolean
  }
  momo: {
    partnerCode: string
    endpoint: string
    hasAccessKey: boolean
    hasSecretKey: boolean
  }
  telegram: {
    hasBotToken: boolean
    botToken?: string
    chatId: string
  }
  email: {
    hasResendApiKey: boolean
    resendApiKey?: string
    fromAddress: string
    adminEmail: string
  }
}

type TelegramLog = {
  id: string
  orderId: string
  message: string
  status: string
  createdAt: string
  error?: string
}

type EmailLog = {
  id: string
  orderId: string
  toEmail: string
  recipientType: string
  subject: string
  status: string
  createdAt: string
  error?: string
}

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('LEGEND')
  const [email, setEmail] = useState('contact@legend.vn')
  const [phone, setPhone] = useState('0901 234 567')
  const [address, setAddress] = useState('123 Nguyễn Huệ, Quận 1, TP.HCM')
  const [innerShip, setInnerShip] = useState('30000')
  const [freeShipMin, setFreeShipMin] = useState('2000000')
  const [saved, setSaved] = useState(false)

  // API Config & Logs State
  const [config, setConfig] = useState<ConfigState | null>(null)
  const [telegramLogs, setTelegramLogs] = useState<TelegramLog[]>([])
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [testingTelegram, setTestingTelegram] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // Dynamic Editable Settings
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [resendKey, setResendKey] = useState('')
  const [adminEmail, setAdminEmail] = useState('admin@legend.vn')

  const fetchConfigAndLogs = async () => {
    try {
      setLoadingLogs(true)
      const res = await fetch('/api/admin/notifications')
      const data = await res.json()
      if (data.config) setConfig(data.config)
      if (data.settings) {
        setBotToken(data.settings.telegramBotToken || '')
        setChatId(data.settings.telegramChatId || '')
        setResendKey(data.settings.resendApiKey || '')
        setAdminEmail(data.settings.adminEmail || 'admin@legend.vn')
      }
      if (data.telegramLogs) setTelegramLogs(data.telegramLogs)
      if (data.invoiceLogs) setEmailLogs(data.invoiceLogs)
    } catch (e) {
      console.error('Failed to fetch admin settings data', e)
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    fetchConfigAndLogs()
  }, [])

  const handleSaveAll = async () => {
    setSavingSettings(true)
    setTestStatus(null)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          updates: {
            telegramBotToken: botToken.trim(),
            telegramChatId: chatId.trim(),
            resendApiKey: resendKey.trim(),
            adminEmail: adminEmail.trim(),
          },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTestStatus('✓ Đã lưu cấu hình Telegram & Email thành công! Bạn có thể bấm "Test Bot" ngay.')
        setTimeout(() => setSaved(false), 3000)
        fetchConfigAndLogs()
      } else {
        setTestStatus(`✕ Lỗi khi lưu: ${data.error}`)
      }
    } catch (e: any) {
      setTestStatus(`✕ Lỗi: ${e.message}`)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleTestTelegram = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestStatus('✕ Vui lòng nhập Bot Token và Chat ID bên dưới rồi bấm "Lưu cấu hình" trước khi thử nghiệm!')
      return
    }

    setTestingTelegram(true)
    setTestStatus(null)
    try {
      // Auto save before testing
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_settings',
          updates: {
            telegramBotToken: botToken.trim(),
            telegramChatId: chatId.trim(),
          },
        }),
      })

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_telegram' }),
      })
      const data = await res.json()
      if (data.success && !data.simulated) {
        setTestStatus('✓ Đã gửi tin nhắn thử nghiệm tới Telegram Bot thành công! Kiểm tra Telegram của bạn.')
      } else {
        setTestStatus(`✕ ${data.error || 'Lỗi gửi tin nhắn Telegram'}`)
      }
      fetchConfigAndLogs()
    } catch (e: any) {
      setTestStatus(`✕ Lỗi: ${e.message}`)
    } finally {
      setTestingTelegram(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    setTestStatus(null)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_email', targetEmail: adminEmail }),
      })
      const data = await res.json()
      if (data.success) {
        setTestStatus(
          data.simulated
            ? `✓ Đã tạo hóa đơn mẫu cho ${adminEmail} (Chế độ mô phỏng - đã ghi nhật ký).`
            : `✓ Đã gửi email hóa đơn thử nghiệm tới ${adminEmail}!`,
        )
      } else {
        setTestStatus(`✕ Thất bại: ${data.error || 'Lỗi gửi email'}`)
      }
      fetchConfigAndLogs()
    } catch (e: any) {
      setTestStatus(`✕ Lỗi: ${e.message}`)
    } finally {
      setTestingEmail(false)
    }
  }

  return (
    <>
      <div className="admin-page-heading">
        <h1>Cài đặt hệ thống</h1>
        <p>Cấu hình cổng thanh toán SePay, MoMo, kết nối Telegram Bot & Email hóa đơn</p>
      </div>

      {testStatus && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: 20,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            background: testStatus.startsWith('✓') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: testStatus.startsWith('✓') ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: testStatus.startsWith('✓') ? '#4ade80' : '#f87171',
          }}
        >
          {testStatus}
        </div>
      )}

      {/* ── CẤU HÌNH TELEGRAM BOT ADMIN (CHÍNH) ────────────────── */}
      <div className="admin-card" style={{ padding: 24, marginBottom: 24, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cấu hình Telegram Bot nhận đơn hàng
              </h3>
              <p style={{ fontSize: 12, color: 'var(--admin-text-secondary)', marginTop: 2 }}>
                Khi khách hàng đặt hàng hoặc thanh toán xong, hệ thống sẽ gửi tin nhắn kèm chi tiết đơn về Telegram của bạn
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingSettings}
              className="admin-btn admin-btn-primary"
              style={{ fontSize: 12, padding: '7px 16px' }}
            >
              {savingSettings ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Lưu cấu hình
            </button>
            <button
              type="button"
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="admin-btn admin-btn-secondary"
              style={{ fontSize: 12, padding: '7px 16px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            >
              {testingTelegram ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Test Bot Ngay
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Key size={13} color="#ffffff" /> TELEGRAM_BOT_TOKEN
            </label>
            <input
              className="admin-input"
              type="text"
              placeholder="Ví dụ: 7891234567:AAFlw9..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div className="form-group">
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={13} color="#ffffff" /> TELEGRAM_CHAT_ID (User ID hoặc Group ID)
            </label>
            <input
              className="admin-input"
              type="text"
              placeholder="Ví dụ: 123456789 hoặc -100..."
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        </div>

        {/* Quick 3-Step Guide */}
        <div style={{ padding: 14, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid var(--admin-border)', fontSize: 12, color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: '#ffffff' }}>💡 Hướng dẫn lấy Token & Chat ID trong 1 phút:</strong>
          <ol style={{ marginTop: 6, paddingLeft: 18 }}>
            <li>Mở Telegram, tìm bot <strong>@BotFather</strong>, gõ <code style={{ color: '#ffffff', background: '#27272a', padding: '1px 5px', borderRadius: 4 }}>/newbot</code>, đặt tên bot và copy mã <strong>HTTP API Token</strong> dán vào ô Token ở trên.</li>
            <li>Bấm <strong>Start</strong> vào bot của bạn, sau đó tìm bot <strong>@userinfobot</strong> trên Telegram và bấm Start để lấy số <strong>Id</strong> của bạn (dán vào ô Chat ID).</li>
            <li>Bấm nút <strong>&ldquo;Lưu cấu hình&rdquo;</strong> rồi bấm <strong>&ldquo;Test Bot Ngay&rdquo;</strong> để nhận tin nhắn kiểm tra.</li>
          </ol>
        </div>
      </div>

      {/* ── EMAIL HÓA ĐƠN & CỔNG THANH TOÁN ──────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Email Card */}
        <div className="admin-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={18} color="#ffffff" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                Hóa Đơn Email (Khách & Admin)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <a
                href="/api/admin/invoice/preview?orderId=1092&admin=true"
                target="_blank"
                rel="noreferrer"
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}
              >
                Mẫu HĐ <ExternalLink size={11} />
              </a>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="admin-btn admin-btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
              >
                {testingEmail ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                Test Email
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Email Admin nhận bản sao hóa đơn</label>
              <input
                className="admin-input"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="admin-label">Resend API Key (Để gửi thực tế)</label>
              <input
                className="admin-input"
                type="password"
                placeholder="re_..."
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SePay VietQR Card */}
        <div className="admin-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Landmark size={18} color="#ffffff" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                SePay (VietQR Tự Động)
              </h3>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                fontWeight: 600,
              }}
            >
              Sẵn sàng
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Ngân hàng:</span>
              <strong style={{ color: '#ffffff' }}>MBBank (Ngân hàng Quân Đội)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Số tài khoản:</span>
              <strong style={{ fontFamily: 'monospace', color: '#ffffff' }}>
                {config?.sepay.accountNumber || '0363132364'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Chủ TK:</span>
              <span style={{ color: '#ffffff', textTransform: 'uppercase' }}>
                {config?.sepay.accountName || 'TRAN NHAT MINH'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--admin-border)' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Webhook URL:</span>
              <span style={{ fontFamily: 'monospace', color: '#ffffff', fontSize: 11 }}>/api/payment/sepay/webhook</span>
            </div>
          </div>
        </div>

        {/* MoMo Card */}
        <div className="admin-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wallet size={18} color="#ffffff" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                Ví Điện Tử MoMo (V2)
              </h3>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              MoMo API
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Partner Code:</span>
              <strong style={{ fontFamily: 'monospace', color: '#ffffff' }}>MOMO</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>Môi trường:</span>
              <strong style={{ color: '#ffffff' }}>Sandbox Test Ready</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--admin-border)' }}>
              <span style={{ color: 'var(--admin-text-secondary)' }}>IPN Webhook:</span>
              <span style={{ fontFamily: 'monospace', color: '#ffffff', fontSize: 11 }}>/api/payment/momo/ipn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NHẬT KÝ THÔNG BÁO VÀ HÓA ĐƠN GẦN ĐÂY ────────────────── */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Nhật ký gửi thông báo (Telegram & Email)</h3>
          <button
            type="button"
            onClick={fetchConfigAndLogs}
            disabled={loadingLogs}
            className="admin-btn admin-btn-secondary"
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            <RefreshCw size={12} className={loadingLogs ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kênh</th>
                <th>Mã Đơn</th>
                <th>Người nhận / Chi tiết</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {telegramLogs.length === 0 && emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--admin-text-secondary)', padding: 24 }}>
                    Chưa có nhật ký thông báo nào. Hãy đặt thử 1 đơn hàng hoặc bấm &ldquo;Test Bot&rdquo; / &ldquo;Test Email&rdquo; ở trên!
                  </td>
                </tr>
              ) : (
                <>
                  {telegramLogs.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontSize: 12, fontWeight: 600 }}>
                          <Send size={12} /> Telegram
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{log.orderId}</td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text-secondary)', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.error ? <span style={{ color: '#f87171' }}>{log.error}</span> : 'Thông báo đơn hàng Admin Telegram'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: log.status === 'sent' ? 'rgba(34, 197, 94, 0.15)' : log.status === 'simulated' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.status === 'sent' ? '#4ade80' : log.status === 'simulated' ? '#ffffff' : '#f87171',
                            fontWeight: 600,
                          }}
                        >
                          {log.status === 'sent' ? 'Đã gửi Live' : log.status === 'simulated' ? 'Mô phỏng' : 'Lỗi'}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--admin-text-secondary)' }}>
                        {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                  {emailLogs.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#e4e4e7', fontSize: 12, fontWeight: 600 }}>
                          <Mail size={12} /> Email ({log.recipientType === 'admin' ? 'Admin' : 'Khách'})
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{log.orderId}</td>
                      <td style={{ fontSize: 12, color: 'var(--admin-text)', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.toEmail} • {log.subject}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: log.status === 'sent' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                            color: log.status === 'sent' ? '#4ade80' : '#ffffff',
                            fontWeight: 600,
                          }}
                        >
                          {log.status === 'sent' ? 'Đã gửi' : 'Mô phỏng'}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--admin-text-secondary)' }}>
                        {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CỬA HÀNG & GIAO HÀNG ──────────────────────────────── */}
      <div className="settings-section">
        <h3>Thông tin thương hiệu</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="admin-label">Tên thương hiệu</label>
            <input className="admin-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="admin-label">Email hỗ trợ</label>
            <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="admin-label">Số điện thoại CSKH</label>
            <input className="admin-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="admin-label">Địa chỉ Showroom</label>
            <input className="admin-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Chính sách vận chuyển</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="admin-label">Phí giao hàng tiêu chuẩn (VNĐ)</label>
            <input className="admin-input" type="number" value={innerShip} onChange={(e) => setInnerShip(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="admin-label">Miễn phí ship cho đơn từ (VNĐ)</label>
            <input className="admin-input" type="number" value={freeShipMin} onChange={(e) => setFreeShipMin(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {saved && (
          <span style={{ color: 'var(--admin-success)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✓ Đã lưu thay đổi thành công
          </span>
        )}
        <button className="admin-btn admin-btn-primary" onClick={handleSaveAll}>
          <Save size={16} /> Lưu tất cả cài đặt
        </button>
      </div>
    </>
  )
}
