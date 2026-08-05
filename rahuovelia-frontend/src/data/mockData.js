export const currentUser = {
  id: 'RHV1042',
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  sponsor: 'Vikram Rao (RHV0087)',
  rank: 'Platinum',
  joined: '12 Feb 2025',
  kyc: 'Verified',
}

export const walletSummary = {
  balance: 84250,
  totalEarnings: 412600,
  totalWithdrawn: 328350,
  pendingWithdrawal: 6000,
}

export const earningsBreakdown = [
  { label: 'Direct Referral', value: 168000, tone: 'gold' },
  { label: 'Level Income', value: 96400, tone: 'emerald' },
  { label: 'Matching Bonus', value: 78200, tone: 'rose' },
  { label: 'Rank Reward', value: 70000, tone: 'ink' },
]

export const monthlyEarnings = [
  { month: 'Feb', earnings: 24000 },
  { month: 'Mar', earnings: 31200 },
  { month: 'Apr', earnings: 28800 },
  { month: 'May', earnings: 41500 },
  { month: 'Jun', earnings: 52300 },
  { month: 'Jul', earnings: 61900 },
  { month: 'Aug', earnings: 47800 },
]

export const walletTransactions = [
  { id: 'TXN9931', date: '01 Aug 2026', type: 'Direct Referral', amount: 4200, status: 'Credited' },
  { id: 'TXN9928', date: '30 Jul 2026', type: 'Level Income', amount: 1850, status: 'Credited' },
  { id: 'TXN9915', date: '28 Jul 2026', type: 'Withdrawal', amount: -12000, status: 'Processed' },
  { id: 'TXN9902', date: '24 Jul 2026', type: 'Matching Bonus', amount: 3600, status: 'Credited' },
  { id: 'TXN9871', date: '12 Jul 2026', type: 'Rank Reward', amount: 10000, status: 'Credited' },
]

export const withdrawalRequests = [
  { id: 'WD2231', date: '02 Aug 2026', amount: 6000, method: 'Bank Transfer', status: 'Pending' },
  { id: 'WD2214', date: '28 Jul 2026', amount: 12000, method: 'UPI', status: 'Approved' },
  { id: 'WD2190', date: '18 Jul 2026', amount: 8000, method: 'Bank Transfer', status: 'Approved' },
  { id: 'WD2166', date: '05 Jul 2026', amount: 5000, method: 'UPI', status: 'Rejected' },
]

export const referrals = [
  { id: 'RHV1091', name: 'Kabir Mehta', joined: '18 Jul 2026', status: 'Active', earnings: 3200 },
  { id: 'RHV1088', name: 'Priya Nair', joined: '11 Jul 2026', status: 'Active', earnings: 5100 },
  { id: 'RHV1076', name: 'Rohan Das', joined: '29 Jun 2026', status: 'Inactive', earnings: 0 },
  { id: 'RHV1065', name: 'Sneha Iyer', joined: '14 Jun 2026', status: 'Active', earnings: 7800 },
  { id: 'RHV1054', name: 'Arjun Verma', joined: '02 Jun 2026', status: 'Active', earnings: 2400 },
]

export const treeData = {
  id: 'RHV1042',
  name: 'Ananya Sharma',
  rank: 'Platinum',
  children: [
    {
      id: 'RHV1091',
      name: 'Kabir Mehta',
      rank: 'Gold',
      children: [
        { id: 'RHV1120', name: 'Ira Kapoor', rank: 'Silver', children: [] },
        { id: 'RHV1121', name: 'Dev Malhotra', rank: 'Silver', children: [] },
      ],
    },
    {
      id: 'RHV1088',
      name: 'Priya Nair',
      rank: 'Gold',
      children: [
        { id: 'RHV1130', name: 'Tara Bose', rank: 'Bronze', children: [] },
      ],
    },
  ],
}

export const adminStats = {
  totalUsers: 4821,
  activeUsers: 3902,
  totalBusiness: 18420500,
  currentBusiness: 1265000,
  totalPayout: 18420500,
  pendingKyc: 37,
  pendingWithdrawals: 21,
}

export const adminUserGrowth = [
  { month: 'Feb', users: 2900 },
  { month: 'Mar', users: 3150 },
  { month: 'Apr', users: 3480 },
  { month: 'May', users: 3820 },
  { month: 'Jun', users: 4180 },
  { month: 'Jul', users: 4560 },
  { month: 'Aug', users: 4821 },
]

export const adminUsers = [
  { id: 'RHV1042', name: 'Ananya Sharma', email: 'ananya.sharma@example.com', rank: 'Platinum', status: 'Active', kyc: 'Verified' },
  { id: 'RHV1091', name: 'Kabir Mehta', email: 'kabir.mehta@example.com', rank: 'Gold', status: 'Active', kyc: 'Verified' },
  { id: 'RHV1088', name: 'Priya Nair', email: 'priya.nair@example.com', rank: 'Gold', status: 'Active', kyc: 'Pending' },
  { id: 'RHV1076', name: 'Rohan Das', email: 'rohan.das@example.com', rank: 'Silver', status: 'Inactive', kyc: 'Verified' },
  { id: 'RHV1065', name: 'Sneha Iyer', email: 'sneha.iyer@example.com', rank: 'Gold', status: 'Active', kyc: 'Rejected' },
]

export const adminWithdrawals = [
  { id: 'WD2231', user: 'Ananya Sharma', date: '02 Aug 2026', amount: 6000, method: 'Bank Transfer', status: 'Pending' },
  { id: 'WD2229', user: 'Sneha Iyer', date: '01 Aug 2026', amount: 9500, method: 'UPI', status: 'Pending' },
  { id: 'WD2227', user: 'Kabir Mehta', date: '31 Jul 2026', amount: 4000, method: 'UPI', status: 'Pending' },
  { id: 'WD2214', user: 'Ananya Sharma', date: '28 Jul 2026', amount: 12000, method: 'UPI', status: 'Approved' },
]

export const adminKycQueue = [
  { id: 'KYC0091', user: 'Priya Nair', submitted: '30 Jul 2026', doc: 'Aadhaar + PAN', status: 'Pending' },
  { id: 'KYC0090', user: 'Tara Bose', submitted: '29 Jul 2026', doc: 'Passport', status: 'Pending' },
  { id: 'KYC0088', user: 'Dev Malhotra', submitted: '27 Jul 2026', doc: 'Aadhaar + PAN', status: 'Pending' },
]
