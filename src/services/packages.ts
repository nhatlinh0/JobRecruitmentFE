export interface CreditPackage { id: number; name: string; price: number; credits: number; description: string }

export async function fetchPackages(token: string, signal: AbortSignal): Promise<CreditPackage[]> {
  const result = new Map<number, CreditPackage>()
  for (let page = 0; ; page++) {
    const response = await fetch(`/api/api/v1/packages?page=${page}&size=100`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal })
    if (!response.ok) throw new Error(`Không thể tải các gói credit (HTTP ${response.status}).`)
    const raw: unknown = await response.json()
    const body = raw && typeof raw === 'object' && 'data' in raw ? raw.data : raw
    const meta = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : null
    const values = Array.isArray(body) ? body : meta?.content
    if (!Array.isArray(values)) throw new Error('Danh sách gói credit không hợp lệ.')
    const previous = result.size
    values.forEach((value: unknown) => {
      if (!value || typeof value !== 'object') throw new Error('Thông tin gói credit không hợp lệ.')
      const item = value as Record<string, unknown>
      const id = Number(item.id), price = Number(item.price), credits = Number(item.credits)
      if (!Number.isInteger(id) || id <= 0 || typeof item.name !== 'string' || item.price == null || !Number.isFinite(price) || price < 0 || item.credits == null || !Number.isInteger(credits) || credits < 0) throw new Error('Gói credit thiếu thông tin hợp lệ.')
      result.set(id, { id, name: item.name, price, credits, description: typeof item.description === 'string' ? item.description : '' })
    })
    if (!meta || meta.last === true || meta.isLast === true || (typeof meta.totalPages === 'number' && page + 1 >= meta.totalPages) || !values.length || result.size === previous) break
    if (typeof meta.totalPages !== 'number' && meta.last !== false && meta.isLast !== false) break
  }
  return [...result.values()]
}
