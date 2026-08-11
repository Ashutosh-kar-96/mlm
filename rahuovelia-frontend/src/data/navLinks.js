import {
  LayoutGrid,
  Users,
  Wallet,
  ArrowDownToLine,
  ShieldCheck,
  Network,
  CreditCard,
  Building2,
  UserCog,
  IndianRupee,
  KeyRound,
  BarChart3,
  LifeBuoy,
  UserCheck,
  UserX,
  FileText,
  Send,
  LockKeyhole,
  PlusCircle,
  Repeat,
  CheckCircle2,
  IdCard,
  UserPlus,
  ShoppingBag,
} from 'lucide-react'

export const userLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { to: '/dashboard/register-member', label: 'Register', icon: UserPlus },
  {
    label: 'My Profile',
    icon: Users,
    children: [
      { to: '/dashboard/profile/edit', label: 'Edit Profile', icon: UserCog },
      { to: '/dashboard/profile/welcome-letter', label: 'My Welcome Letter', icon: FileText },
      { to: '/dashboard/profile/id-card', label: 'My ID Card', icon: IdCard },
      { to: '/dashboard/profile/change-password', label: 'Change Password', icon: LockKeyhole },
    ],
  },
  {
    label: 'KYC',
    icon: ShieldCheck,
    children: [
      { to: '/dashboard/kyc/bank', label: 'Upload Bank Details', icon: Wallet },
      { to: '/dashboard/kyc/pan', label: 'Upload PAN Card', icon: CreditCard },
      { to: '/dashboard/kyc/aadhaar', label: 'Upload Aadhaar Card', icon: IdCard },
    ],
  },
  { to: '/dashboard/network', label: 'My Network', icon: Network },
  {
    label: 'My Business',
    icon: Building2,
    children: [
      { to: '/dashboard/business/direct', label: 'My Direct', icon: Users },
      { to: '/dashboard/business/level-tree', label: 'My Level Tree', icon: Network },
      { to: '/dashboard/business/downline', label: 'My Downline', icon: FileText },
      { to: '/dashboard/business/mlm-status', label: 'MLM Status', icon: BarChart3 },
    ],
  },
  {
    label: 'Active License',
    icon: KeyRound,
    children: [
      { to: '/dashboard/license/activation', label: 'Activation License', icon: KeyRound },
      { to: '/dashboard/license/used', label: 'Used License', icon: CheckCircle2 },
    ],
  },
  { to: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { to: '/dashboard/withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
  {
    label: 'My Payout',
    icon: IndianRupee,
    children: [
      { to: '/dashboard/payout/statement', label: 'Payout Statement', icon: FileText },
      { to: '/dashboard/payout/income-detail', label: 'Income Detail', icon: Wallet },
    ],
  },
  {
    label: 'My Support',
    icon: LifeBuoy,
    children: [
      { to: '/dashboard/support/help-desk', label: 'Help Desk', icon: LifeBuoy },
      { to: '/dashboard/support/contact-us', label: 'Contact Us', icon: Send },
    ],
  },
  {
    label: 'Shopping Order',
    icon: ShoppingBag,
    children: [
      { to: '/dashboard/orders/add-fund', label: 'Add Fund', icon: PlusCircle },
      { to: '/dashboard/orders/transactions', label: 'Transaction Report', icon: FileText },
      { to: '/dashboard/orders/wallet', label: 'Shopping Wallet', icon: Wallet },
      { to: '/dashboard/orders/payment', label: 'Payment', icon: CreditCard },
      { to: '/dashboard/orders/my-orders', label: 'My Orders', icon: ShoppingBag },
    ],
  },
  { to: '/dashboard/continue-shopping', label: 'Continue Shopping', icon: ShoppingBag },
]

export const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid },
  {
    label: 'PAN Card',
    icon: CreditCard,
    children: [
      { to: '/admin/pan-card/unverified', label: 'Unverified', icon: FileText },
      { to: '/admin/pan-card/verified', label: 'Verified', icon: CheckCircle2 },
    ],
  },
  {
    label: 'Company Business',
    icon: Building2,
    children: [
      { to: '/admin/company-business/current', label: 'Find Current Company Business', icon: IndianRupee },
      { to: '/admin/company-business/downline', label: 'User Downline Business', icon: Network },
    ],
  },
  {
    label: 'Members',
    icon: Users,
    children: [
      { to: '/admin/members', label: 'All Members', icon: Users },
      { to: '/admin/members/active', label: 'Active', icon: UserCheck },
      { to: '/admin/members/unpaid', label: 'Unpaid', icon: Wallet },
      { to: '/admin/members/blocked', label: 'Blocked', icon: UserX },
      { to: '/admin/members/tds-report', label: 'TDS Report', icon: FileText },
      { to: '/admin/members/online-transaction-report', label: 'Online Transaction Report', icon: FileText },
    ],
  },
  {
    label: 'Payout',
    icon: IndianRupee,
    children: [
      { to: '/admin/withdrawals', label: 'Withdrawal Requests', icon: ArrowDownToLine },
      { to: '/admin/payout/distribute', label: 'Distribute Payout', icon: Send },
      { to: '/admin/payout/distributed', label: 'Distributed Payout', icon: CheckCircle2 },
      { to: '/admin/payout/income-detail', label: 'Income Detail', icon: FileText },
    ],
  },
  { to: '/admin/kyc', label: 'KYC Queue', icon: ShieldCheck },
  { to: '/admin/change-password', label: 'Change Password', icon: LockKeyhole },
  {
    label: 'Pin Management',
    icon: KeyRound,
    children: [
      { to: '/admin/pins/generate-new', label: 'Generate New Pins', icon: PlusCircle },
      { to: '/admin/pins/activated', label: 'Activated Pins', icon: CheckCircle2 },
      { to: '/admin/pins/transfer', label: 'Pin Transfer', icon: Repeat },
      { to: '/admin/pins/used', label: 'Used Pins', icon: KeyRound },
      { to: '/admin/pins/transaction-report', label: 'Pin Transaction Report', icon: FileText },
      { to: '/admin/pins/generation-report', label: 'Pin Generation Report', icon: FileText },
    ],
  },
  {
    label: 'Rank Setting',
    icon: BarChart3,
    children: [
      { to: '/admin/rank-setting/set-rank', label: 'Set Rank', icon: BarChart3 },
      { to: '/admin/rank-setting/report', label: 'Set Rank Report', icon: FileText },
      { to: '/admin/rank-setting/plan', label: 'Plan Summary', icon: FileText },
      { to: '/admin/rank-setting/rewards', label: 'Reward Report', icon: CheckCircle2, disabled: true },
      { to: '/admin/rank-setting/gpg', label: 'GPG Approval', icon: CheckCircle2 },
      { to: '/admin/rank-setting/licenses', label: 'License History', icon: KeyRound },
      { to: '/admin/rank-setting/challenges', label: 'Rank 41 Challenge', icon: BarChart3 },
    ],
  },
  {
    label: 'Utility Desk',
    icon: LifeBuoy,
    children: [
      { to: '/admin/utility-desk/member-help-desk', label: 'Member Help Desk', icon: LifeBuoy },
      { to: '/admin/utility-desk/message-to-dashboard', label: 'Message To Dashboard', icon: Send },
    ],
  },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
]

export const adminShortcuts = [
  { to: '/admin/members/active', label: 'Active Members', icon: UserCheck },
  { to: '/admin/members/unpaid', label: 'Unpaid Members', icon: Wallet },
  { to: '/admin/members/blocked', label: 'Block Members', icon: UserX },
  { to: '/admin/members', label: 'Edit Member', icon: UserCog },
  { to: '/admin/rank-setting/set-rank', label: 'Rank Upgrade', icon: BarChart3 },
  { to: '/admin/payout/distribute', label: 'Distribute Payout', icon: IndianRupee },
  { to: '/admin/utility-desk/member-help-desk', label: 'Help Desk', icon: LifeBuoy },
  { to: '/admin/utility-desk/message-to-dashboard', label: 'Message To Member', icon: Send },
  { to: '/admin/change-password', label: 'Change Password', icon: LockKeyhole },
]
