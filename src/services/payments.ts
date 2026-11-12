function extractPaymentUrl(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (!value || typeof value !== 'object') return null
  const body = value as Record<string, unknown>
  for (const key of ['paymentUrl', 'paymentURL', 'url']) {
    if (typeof body[key] === 'string' && body[key].trim()) return body[key].trim()
  }
  return 'data' in body ? extractPaymentUrl(body.data) : null
}

export async function createVnpayPayment(token: string, packageId: number, signal: AbortSignal): Promise<string> {
  const response = await fetch('/api/api/v1/vnpay/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ packageId, language: 'vn' }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  })
  const text = await response.text()
  let body: unknown = text
  try { body = JSON.parse(text) } catch { /* Có thể nhận URL dạng text. */ }
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
      ? body.message : `Không thể tạo thanh toán VNPay (HTTP ${response.status}).`
    throw new Error(message)
  }
  const value = extractPaymentUrl(body)
  if (!value) throw new Error('Máy chủ chưa trả về URL thanh toán VNPay.')
  let url: URL
  try { url = new URL(value) } catch { throw new Error('URL thanh toán VNPay không hợp lệ.') }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('URL thanh toán VNPay không hợp lệ.')
  return value
}
