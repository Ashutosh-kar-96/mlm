const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const authStorageKey = 'rahuovelia.auth'
const queryString = (params = {}) =>
  new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString()

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(authStorageKey)) || null
  } catch {
    return null
  }
}

export function storeAuth(auth) {
  localStorage.setItem(authStorageKey, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(authStorageKey)
}

export async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Something went wrong. Please try again.')
  }

  return payload.data ?? payload
}

export const authApi = {
  memberLogin: (body) => apiRequest('/users/auth/login', { method: 'POST', body }),
  memberRegister: (body) => apiRequest('/users/auth/register', { method: 'POST', body }),
  adminLogin: (body) => apiRequest('/admin/auth/login', { method: 'POST', body }),
  currentMember: (token) => apiRequest('/users/auth/me', { token }),
}

export const adminApi = {
  dashboard: (token) => apiRequest('/admin/dashboard', { token }),
  changePassword: (token, body) => apiRequest('/admin/auth/password', { method: 'PATCH', token, body }),
  members: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/members/member${search ? `?${search}` : ''}`, { token })
  },
  member: (token, regno) => apiRequest(`/members/${regno}`, { token }),
  updateMember: (token, regno, body) => apiRequest(`/members/${regno}`, { method: 'PATCH', token, body }),
  membersByStatus: (token, status, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/members/status/${status}${search ? `?${search}` : ''}`, { token })
  },
  blockMember: (token, regno) => apiRequest(`/members/${regno}/block`, { method: 'PATCH', token }),
  unblockMember: (token, regno) => apiRequest(`/members/${regno}/unblock`, { method: 'PATCH', token }),
  panByStatus: (token, status, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/pan-verifications/status/${status}${search ? `?${search}` : ''}`, { token })
  },
  updatePanStatus: (token, id, status) => apiRequest(`/pan-verifications/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  }),
  payouts: (token, status, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/payouts/${status}${search ? `?${search}` : ''}`, { token })
  },
  distributePayouts: (token, body) => apiRequest('/payouts/distribute', { method: 'PATCH', token, body }),
  pins: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/pins/pin${search ? `?${search}` : ''}`, { token })
  },
  pinTransfers: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/pins/transfers${search ? `?${search}` : ''}`, { token })
  },
  usedPins: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/pins/used${search ? `?${search}` : ''}`, { token })
  },
  pinPlans: (token) => apiRequest('/pins/plans', { token }),
  createPinPlan: (token, body) => apiRequest('/pins/plans', { method: 'POST', token, body }),
  updatePinPlan: (token, id, body) => apiRequest(`/pins/plans/${id}`, { method: 'PATCH', token, body }),
  generatePins: (token, body) => apiRequest('/pins/generate', { method: 'POST', token, body }),
  transferPins: (token, body) => apiRequest('/pins/transfer', { method: 'POST', token, body }),
  ranks: (token) => apiRequest('/members/ranks', { token }),
  rankHistory: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/history${search ? `?${search}` : ''}`, { token })
  },
  commissions: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/commissions${search ? `?${search}` : ''}`, { token })
  },
  rankPlan: (token) => apiRequest('/ranks/plan', { token }),
  rankRewards: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/rewards${search ? `?${search}` : ''}`, { token })
  },
  updateReward: (token, id, body) => apiRequest(`/ranks/rewards/${id}`, { method: 'PATCH', token, body }),
  gpgSubscriptions: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/gpg-subscriptions${search ? `?${search}` : ''}`, { token })
  },
  updateGpgSubscription: (token, id, body) => apiRequest(`/ranks/gpg-subscriptions/${id}`, { method: 'PATCH', token, body }),
  autoAssignGpg: (token, body) => apiRequest('/ranks/gpg-subscriptions/auto-assign', { method: 'POST', token, body }),
  licenseUsages: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/license-usages${search ? `?${search}` : ''}`, { token })
  },
  rankChallenges: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/ranks/rank-challenges${search ? `?${search}` : ''}`, { token })
  },
  auditLogs: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/admin/audit-logs${search ? `?${search}` : ''}`, { token })
  },
  upgradeRank: (token, body) => apiRequest('/ranks/upgrade', { method: 'POST', token, body }),
  products: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/commerce/products${search ? `?${search}` : ''}`, { token })
  },
  createProduct: (token, body) => apiRequest('/commerce/products', { method: 'POST', token, body }),
  updateProduct: (token, id, body) => apiRequest(`/commerce/products/${id}`, { method: 'PATCH', token, body }),
  dashboardMessages: (token) => apiRequest('/support/dashboard-messages', { token }),
  createDashboardMessage: (token, body) => apiRequest('/support/dashboard-messages', { method: 'POST', token, body }),
  helpDesk: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/support/tickets${search ? `?${search}` : ''}`, { token })
  },
  replyHelpDesk: (token, id, body) => apiRequest(`/support/tickets/${id}/replies`, { method: 'POST', token, body }),
  deleteHelpDesk: (token, id) => apiRequest(`/support/tickets/${id}`, { method: 'DELETE', token }),
  orders: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/reports/orders${search ? `?${search}` : ''}`, { token })
  },
  onlineTransactions: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/reports/online-transactions${search ? `?${search}` : ''}`, { token })
  },
  downlineBusiness: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/reports/downline-business${search ? `?${search}` : ''}`, { token })
  },
}

export const memberApi = {
  dashboard: (token) => apiRequest('/users/me/dashboard', { token }),
  wallet: (token) => apiRequest('/users/me/wallet', { token }),
  createMember: (token, body) => apiRequest('/members/member', { method: 'POST', token, body }),
  payouts: (token) => apiRequest('/users/me/payouts', { token }),
  requestWithdrawal: (token, body) => apiRequest('/users/me/withdrawals', { method: 'POST', token, body }),
  network: (token) => apiRequest('/users/me/network', { token }),
  updateProfile: (token, body) => apiRequest('/users/me/profile', { method: 'PATCH', token, body }),
  changePassword: (token, body) => apiRequest('/users/me/password', { method: 'PATCH', token, body }),
  submitKyc: (token, body) => apiRequest('/users/me/kyc', { method: 'POST', token, body }),
  orders: (token) => apiRequest('/users/me/orders', { token }),
  usePin: (token, body) => apiRequest('/pins/use', { method: 'POST', token, body }),
  commissions: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/users/me/commissions${search ? `?${search}` : ''}`, { token })
  },
  mlmSummary: (token) => apiRequest('/users/me/mlm', { token }),
  subscribeGpg: (token, body = {}) => apiRequest('/users/me/gpg-subscriptions', { method: 'POST', token, body }),
  products: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/commerce/products${search ? `?${search}` : ''}`, { token })
  },
  cart: (token) => apiRequest('/commerce/cart', { token }),
  addToCart: (token, body) => apiRequest('/commerce/cart', { method: 'POST', token, body }),
  updateCartItem: (token, id, body) => apiRequest(`/commerce/cart/${id}`, { method: 'PATCH', token, body }),
  removeCartItem: (token, id) => apiRequest(`/commerce/cart/${id}`, { method: 'DELETE', token }),
  checkout: (token, body) => apiRequest('/commerce/checkout', { method: 'POST', token, body }),
  walletLedger: (token) => apiRequest('/commerce/wallet-ledger', { token }),
  addFund: (token, body) => apiRequest('/commerce/wallet-ledger/add-fund', { method: 'POST', token, body }),
  uploads: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/uploads${search ? `?${search}` : ''}`, { token })
  },
  createUpload: (token, body) => apiRequest('/uploads', { method: 'POST', token, body }),
  createSupportTicket: (token, body) => apiRequest('/support/tickets', { method: 'POST', token, body }),
  supportTickets: (token, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/support/tickets${search ? `?${search}` : ''}`, { token })
  },
  downline: (token, regno, params = {}) => {
    const search = queryString(params)
    return apiRequest(`/members/${regno}/downline${search ? `?${search}` : ''}`, { token })
  },
}
