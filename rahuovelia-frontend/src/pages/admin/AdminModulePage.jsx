import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, Check, ChevronDown, FileText, MessageSquareText, RotateCcw, Search, Send, SlidersHorizontal, X } from 'lucide-react'
import { usePageTitle } from '../../hooks/usePageTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { Pagination, Table, THead, TRow, TCell } from '../../components/ui/Table'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { adminApi } from '../../lib/api'

const panRows = [
  ['AF10012802', 'Atul', 'atulb6613@gmail.com', '6206790544', 'N/A', 'N/A', '31/07/2026', 'Pending'],
  ['AF10012801', 'Rohit', 'rohitkeshrio0496@gmail.com', '7480981223', 'N/A', 'N/A', '31/07/2026', 'Pending'],
  ['AF10012800', 'Abhishek Kumar', 'abhishekkumar16727@gmail.com', '9696230414', 'FHIVPD3983E', 'PAN image', '25/07/2026', 'Pending'],
  ['AF10012799', 'Anshul', 'anshulyadav8619415@gmail.com', '8619415741', 'N/A', 'N/A', '25/07/2026', 'Pending'],
]

const activeRows = [
  ['1', 'AF10012798', 'Comrade', 'Advify Marquies', '8077348756', 'jkumaragra933@gmail.com', 'AF10012063', 'N/A', '25-Jul-2026', '25-Jul-2026'],
  ['2', 'AF10012796', 'Vashu', 'Promoter', '8269074947', 'sunitasahu8779@gmail.com', 'AF10012726', 'N/A', '24-Jul-2026', '24-Jul-2026'],
  ['3', 'AF10012792', 'Renuka', 'Promoter', '8319943710', 'renukavishwkarma925@gmail.com', 'AF1001100', 'N/A', '17-Jul-2026', '17-Jul-2026'],
  ['4', 'AF10012784', 'Subrata', 'Sales Executive', '8972012425', 'sd5687802@gmail.com', 'AF10012745', 'JQDPD3747R', '13-Jul-2026', '17-Jul-2026'],
]

const unpaidRows = [
  ['1', 'AF100131', 'Satish', '8235389377', 'Satishkum08235@gmail.com', 'AF100125', 'N/A', 'satish@111', '02-Jan-2025'],
  ['2', 'AF100143', 'Tribhuvan', '6267977580', 'tribhuvansahu200336@gmail.com', 'AF100115', 'N/A', 'tribhuvasahu', '03-Jan-2025'],
  ['3', 'AF100158', 'Sangeeta', '798788965', 'Sangeetamarkam09@gmail.com', 'AF100107', 'N/A', '123456', '03-Jan-2025'],
  ['4', 'AF100178', 'Puspa', '8982698674', 'Puspa12@gmail.com', 'AF100114', 'N/A', '123456', '03-Jan-2025'],
]

const blockedRows = [
  ['1', 'AF10012773', 'Khushi', '0', '6307927012', 'AF10012763', 'singhdeepak33202@gmail.com', '123456', '04/Jul/2026'],
  ['2', 'AF10012767', 'Chandani', '0', '9355182128', 'AF10012738', 'chand12@gmail.com', '123456', '30/Jun/2026'],
  ['3', 'AF10012763', 'Sona', '0', '6388029060', 'AF10012738', 'Sona12@gmail.com', '123456', '24/Jun/2026'],
  ['4', 'AF10012566', 'Chandrashekhar', '39734', '8149745785', 'AF10012459', 'Chandrashekharsontakke7@gmail.com', 'shekhar123', '01/Feb/2026'],
]

const businessRows = [
  ['1', 'AF10012792', 'Renuka', '8767', '22557', '22587', 'Friday, July 17, 2026'],
  ['2', 'AF10012784', 'Subrata', '8766', '39288', '39288', 'Friday, July 17, 2026'],
  ['3', 'AF10012788', 'Khilavan Prasad', '8765', '39665', '39697', 'Friday, July 17, 2026'],
  ['4', 'AF10012791', 'Husain', '8764', '22575', '22607', 'Friday, July 17, 2026'],
]

const transactionRows = [
  ['1', 'AF10012796', 'Vashu', '8269074947', 'ordv2_ba82076a24a145b580786cec1c6037f6', 'ORD1001105849', '28000.00', '24 Jul 2026'],
  ['2', 'AF10012788', 'Khilavan Prasad', '6268201599', 'ordv2_3705b6862c164270a7198a41052053eb', 'ORD1001105846', '22500.00', '17 Jul 2026'],
  ['3', 'AF10012791', 'Husain', '9981583794', 'ordv2_18aff7f8e922484b9057be974ba264b6', 'ORD1001105847', '24500.00', '17 Jul 2026'],
]

const payoutRows = [
  ['AF100101', 'Ved', '4107.72', '0.00', '4107.72', '82.15', '123.23', '3902.33', 'HDFC', '1010103728', 'Gajajkk', '9302292983', '747294248933', ''],
  ['AF100102', 'Subhash', '4107.72', '0.00', '4107.72', '82.15', '123.23', '3902.33', 'Hdfc', '50100497783469', 'HDFC000788', '8839707773', '', ''],
  ['AF100109', 'Rahul', '1809.81', '0.00', '1809.81', '36.20', '54.29', '1719.32', 'Kotak Mahindra Bank', '9647489063', 'KKBK0006430', '6268676798', '579967202747', 'CWVPN7967C'],
]

const paidRows = [
  ['1', 'AF100125', 'Vanshika', '5409.73', '108.19', '5139.24', '01 May 2026', 'Kotak Mahindra Bank', '9247489227', 'KKBK000133', '7974845006', '957676839279', 'CLJPV2732G'],
  ['2', 'AF100101', 'Ved', '2145.72', '42.91', '2038.43', '01 Apr 2026', 'HDFC', '1010103728', 'Gajajkk', '9302292983', '747294248933', ''],
  ['3', 'AF100102', 'Subhash', '2145.72', '42.91', '2038.43', '01 Apr 2026', 'Hdfc', '50100497783469', 'HDFC000788', '8839707773', '', ''],
]

const pinRows = [
  ['17803', 'Activation License', '2168044907558', '1', 'True', '27/07/2026', '3000'],
  ['17804', 'Activation License', '2168055575674', '1', 'True', '27/07/2026', '3000'],
  ['17805', 'Activation License', '2168066634155', '1', 'True', '27/07/2026', '3000'],
  ['17806', 'Activation License', '2168073194995', '1', 'True', '27/07/2026', '3000'],
]

const usedPinRows = [
  ['1', '17087', '2160881866646', '3000', '30 Jun 2025', 'admin', 'AF1001100', 'Janki', 'AF10012792', 'Renuka', '17 Jul 2026'],
  ['2', '16693', '2156941506272', '3000', '30 Jun 2025', 'admin', 'AF10012745', 'Ishrail', 'AF10012784', 'Subrata', '17 Jul 2026'],
  ['3', '13612', '2126134878913', '3000', '30 Jun 2025', 'admin', 'AF10012705', 'Kishan Kumar', 'AF10012788', 'Khilavan Prasad', '17 Jul 2026'],
]

const pinTransactionRows = [
  ['1', 'AF10012792', 'Renuka', '13850', '2128512975823', '3000', '17 Jul 2026', 'Un-Used'],
  ['2', 'AF10012792', 'Renuka', '13851', '2128529854428', '3000', '17 Jul 2026', 'Un-Used'],
  ['3', 'AF10012784', 'Subrata', '13820', '2128211221458', '3000', '17 Jul 2026', 'Un-Used'],
]

const pinGenerationRows = [
  ['1', '17803', '2168044907558', '3000', '27 Jul 2026', 'Not Transferred', 'Un Used'],
  ['2', '17804', '2168055575674', '3000', '27 Jul 2026', 'Not Transferred', 'Un Used'],
  ['3', '17805', '2168066634155', '3000', '27 Jul 2026', 'Not Transferred', 'Un Used'],
  ['4', '17806', '2168073194995', '3000', '27 Jul 2026', 'Not Transferred', 'Un Used'],
]

const rankRows = [
  ['1', 'AF10012798', 'Comrade', 'Sahab', 'Senior Sales Executive', 'Zonal Sales Executive', '41', '42', '7/25/2026 12:43:44 PM'],
  ['2', 'AF10012749', 'Manisha', 'Tantubai', 'Fashion Influencer', 'Vision Influencer', '14', '19', '7/14/2026 3:33:06 PM'],
  ['3', 'AF10012782', 'SURAJ KUMAR', 'CHOUHAN', 'Vision Influencer', 'Promoter', '19', '24', '7/14/2026 3:31:26 PM'],
  ['4', 'AF10012758', 'Payal', 'Teakm', 'Sales Executive', 'Junior Sales Executive', '29', '38', '7/5/2026 4:55:59 PM'],
]

const helpDeskTickets = [
  { id: '1', source: 'fallback', regno: 'AF10011698', subject: 'Gmail change', createdAt: '5/2/2025 3:32:17 PM', message: 'Please update my registered Gmail address.' },
  { id: '2', source: 'fallback', regno: 'AF10011796', subject: 'IFSC code change', createdAt: '7/27/2025 7:39:29 PM', message: 'I need to change my bank IFSC code.' },
  { id: '3', source: 'fallback', regno: 'AF10012190', subject: 'Login error', createdAt: '9/3/2025 2:54:57 PM', message: 'I am unable to login to my account.' },
  { id: '4', source: 'fallback', regno: 'AF10012343', subject: 'Return karna', createdAt: '9/24/2025 7:10:55 PM', message: 'I want help with returning my order.' },
  { id: '5', source: 'fallback', regno: 'AF10012425', subject: "I'd password", createdAt: '10/12/2025 4:55:32 PM', message: 'Please help me recover or reset my ID password.' },
  { id: '6', source: 'fallback', regno: 'AF10012128', subject: 'My income', createdAt: '10/31/2025 12:23:28 PM', message: 'Please check and confirm my income details.' },
]

const helpDeskRows = helpDeskTickets.map((ticket) => [
  ticket.id,
  ticket.regno,
  ticket.subject,
  ticket.createdAt,
  { type: 'supportShow', ticket },
  { type: 'supportDelete', ticket },
])

const pageConfigs = {
  '/admin/pan-card/unverified': {
    title: 'Verify PAN Card',
    subtitle: 'Search member PAN submissions and approve or cancel them',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name', 'Enter mobile Number', 'From Date', 'To Date'],
    reportTitle: 'Verify PAN Card',
    columns: ['Regno', 'Name', 'Email ID', 'Mobile No', 'PAN No.', 'PAN Copy', 'Date of Joining', 'Status', 'Action'],
    rows: panRows.map((row) => [...row, 'Verify / Cancel']),
  },
  '/admin/pan-card/verified': {
    title: 'Verified PAN Card',
    subtitle: 'Approved member PAN records',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name', 'Enter mobile Number', 'From Date', 'To Date'],
    reportTitle: 'Verified PAN Card',
    columns: ['Regno', 'Name', 'Email ID', 'Mobile No', 'PAN No.', 'PAN Copy', 'Date of Joining', 'Status'],
    rows: panRows.map((row) => [...row.slice(0, 7), 'Verified']),
  },
  '/admin/company-business/current': {
    title: 'Current Company Business',
    subtitle: 'Search current datewise business like the referral dashboard',
    searchTitle: 'Search Current Datewise Business',
    filters: ['Business Details', 'From Date', 'To Date', 'Regno/Name', 'Approved'],
    reportTitle: 'Total Business Detail',
    note: 'Please find company monthly business detail. Enter start date to end date.',
    columns: ['S. No.', 'Regno', 'Name', 'Orderid', 'PV', 'Total', 'Sale Date', 'Bill'],
    rows: businessRows.map((row) => [...row, 'Bill']),
  },
  '/admin/company-business/downline': {
    title: 'User Downline Business',
    subtitle: 'Check downline business report for a selected member',
    searchTitle: 'User Business Report',
    filters: ['From Date', 'To Date', 'Enter Check Downline Regno', 'Regno/Name'],
    reportTitle: 'User Report',
    columns: ['S. No.', 'Regno', 'Name', 'Orderid', 'PV', 'Total', 'Sale Date'],
    rows: businessRows,
  },
  '/admin/members/active': {
    title: 'Active Members',
    subtitle: 'Active members with rank, sponsor and payment dates',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name/Mobile No', 'Enter Pin No.', 'From Date', 'To Date'],
    reportTitle: 'Active Members',
    columns: ['S. No.', 'Reg No', 'Name', 'User Rank', 'Mobile No.', 'Email ID', 'Sponsor ID', 'PAN No', 'DOJ', 'Paid Date', 'Edit', 'Block'],
    rows: activeRows.map((row) => [...row, 'Edit', 'Block']),
  },
  '/admin/members/unpaid': {
    title: 'Unpaid Members',
    subtitle: 'Members who have not completed payment',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name', 'Enter Mobile No.', 'From Date', 'To Date'],
    reportTitle: 'Unpaid Members',
    columns: ['S. No.', 'Reg No', 'Name', 'Mobile No.', 'Email ID', 'Sponsor ID', 'PAN No.', 'Password', 'DOJ', 'Edit', 'Block'],
    rows: unpaidRows.map((row) => [...row, 'Edit', 'Block']),
  },
  '/admin/members/blocked': {
    title: 'Blocked Members',
    subtitle: 'Blocked accounts with unblock controls',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name', 'Enter Pin No.'],
    reportTitle: 'Blocked Members',
    columns: ['S. No.', 'Regno', 'Name', 'Plan', 'Mobile No.', 'Sponsorid', 'Emailid', 'Password', 'DOJ', 'Edit', 'Unblock'],
    rows: blockedRows.map((row) => [...row, 'Edit', 'Unblock']),
  },
  '/admin/members/online-transaction-report': {
    title: 'Online Transaction Report',
    subtitle: 'Online payment transaction history',
    searchTitle: 'Search Member',
    filters: ['Reg No./Name/Mobile No', 'From Date', 'To Date'],
    reportTitle: 'User Online Transaction Report',
    columns: ['Slno.', 'Regno No.', 'Name', 'Mobile', 'Amountid', 'Order ID', 'Transaction Amount', 'Date'],
    rows: transactionRows,
  },
  '/admin/payout/distribute': {
    title: 'Distribute Payout',
    subtitle: 'Eligible payout list before distribution',
    searchTitle: 'Search Members',
    filters: ['Reg No./Name', 'From Date', 'To Date'],
    reportTitle: 'Payout Distribution',
    columns: ['Regno', 'Name', 'Generation Bonus', 'Level Bonus', 'Total Amount', 'TDS', 'Admin', 'Net Amount', 'Bank Name', 'A/C No', 'IFSC_Code', 'Mobile', 'Aadhaar No.', 'Pancard No.'],
    rows: payoutRows,
  },
  '/admin/payout/distributed': {
    title: 'Distributed Payout',
    subtitle: 'Completed payout distribution report',
    searchTitle: 'Search Members',
    filters: ['Reg No./Name', 'From Date', 'To Date'],
    reportTitle: 'Distributed Payout',
    columns: ['Slno.', 'Regno', 'Name', 'Total Amount', 'TDS', 'Net Amount', 'Payment Date', 'Bank Name', 'A/C No', 'IFSC_Code', 'Mobile No.', 'Aadhaar No.', 'PAN No.'],
    rows: paidRows,
  },
  '/admin/payout/income-detail': {
    title: 'Income Detail',
    subtitle: 'Audit direct differential, rank differential and group incentive income',
    searchTitle: 'Search Income',
    filters: ['Reg No./Name', 'From Date', 'To Date'],
    reportTitle: 'Income Detail',
    columns: ['Date', 'Earner Regno', 'Earner', 'Type', 'From ID', 'Base Amount', 'Percent', 'Amount', 'Status'],
    rows: [],
  },
  '/admin/pins/activated': {
    title: 'Activated Pins',
    subtitle: 'View generated active pins by pin value',
    searchTitle: 'Active Pins',
    filters: ['Pin Value'],
    reportTitle: 'Active Pins',
    columns: ['', 'Pinslno', 'Planname', 'Pin', 'Pinid', 'Status', 'Generateddate', 'Pinvalue'],
    rows: pinRows.map((row) => ['', ...row]),
  },
  '/admin/pins/used': {
    title: 'Used Pins Report',
    subtitle: 'Search used pins datewise',
    searchTitle: 'Search Datewise',
    filters: ['Date From', 'Date To'],
    reportTitle: 'Used Pins Report',
    columns: ['S.N', 'Pinslno', 'Pin', 'Pin Amount', 'Date of Creation', 'Createdby', 'Used By', 'User Name', 'Used For', 'User For Name', 'Used Date'],
    rows: usedPinRows,
  },
  '/admin/pins/transaction-report': {
    title: 'Pin Transaction Report',
    subtitle: 'Pin transfer status and usage report',
    searchTitle: 'Pin Transaction Report',
    filters: ['Reg No./Name', 'From Date', 'To Date'],
    reportTitle: 'Pin Transaction Report',
    columns: ['Slno.', 'Regno', 'Name', 'Pin Sl No', 'Pin', 'Pin Value', 'Transfer Date', 'Used Status'],
    rows: pinTransactionRows,
  },
  '/admin/pins/generation-report': {
    title: 'Pin Generation Report',
    subtitle: 'Generated pin report by plan and date',
    searchTitle: 'Pin Generation Report',
    filters: ['Select Plan', 'From Date', 'To Date'],
    reportTitle: 'Pin Generation Report',
    columns: ['Slno.', 'Pin Sl No', 'Pin', 'Pin Value', 'Created Date', 'Transfer Status', 'Used Status'],
    rows: pinGenerationRows,
  },
  '/admin/rank-setting/report': {
    title: 'Set Rank Report',
    subtitle: 'Rank upgrade details and percentage changes',
    reportTitle: 'Rank Upgrade Details',
    columns: ['Slno.', 'Regno', 'Name', 'Last Name', 'Old Rank', 'Current Rank', 'Old Percents', 'Current Percents', 'Date'],
    rows: rankRows,
  },
  '/admin/rank-setting/plan': {
    title: 'Plan Summary',
    subtitle: 'Client rank, shopping, differential income and group incentive rules',
    reportTitle: 'Rank And Income Plan',
    columns: ['Rank', 'Percent', 'Self Shopping', 'Criteria BV', 'Level', 'Challenge'],
    rows: [],
  },
  '/admin/rank-setting/rewards': {
    title: 'Reward Report',
    subtitle: 'Track reward eligibility from client handwritten plan',
    searchTitle: 'Search Rewards',
    filters: ['Reg No./Name'],
    reportTitle: 'Reward Eligibility',
    columns: ['Regno', 'Name', 'Rank', 'Percent', 'Self BV', 'Team BV', 'Reward Claims'],
    rows: [],
  },
  '/admin/utility-desk/member-help-desk': {
    title: 'Member Help Desk',
    subtitle: 'Reply to member support messages and manage open requests',
    reportTitle: 'Member Messages',
    columns: ['ID', 'Agent ID', 'Subject', 'Date Time', 'Details', 'Delete'],
    rows: helpDeskRows,
    utility: 'member',
  },
}

const formConfigs = {
  '/admin/pins/generate-new': {
    kind: 'generatePin',
    title: 'Generate Pin',
    subtitle: 'Generate activation pins by selected pin value',
    button: 'Generate',
    fields: [
      { label: 'Pin Value', type: 'select', options: ['3000', '5000', '10000'] },
      { label: 'No Of Pin', placeholder: 'Enter No of Pin' },
    ],
  },
  '/admin/pins/transfer': {
    kind: 'transferPin',
    title: 'Pin Transfer',
    subtitle: 'Verify member ID and transfer pins',
    button: 'Get pin',
    wide: true,
    fields: [
      { label: 'EnterYour ID', placeholder: 'Enter user ID' },
      { label: 'Name', helper: 'Please Verify Your ID & Check User Name' },
      { label: 'Pin type', type: 'select', options: ['3000', '5000', '10000'] },
      { label: 'No of Pins', placeholder: 'Enter number of pins' },
    ],
  },
  '/admin/rank-setting/set-rank': {
    kind: 'rankUpgrade',
    title: 'Upgrade Rank',
    subtitle: 'Upgrade member rank manually',
    button: 'Rank Upgrade',
    fields: [
      { label: 'User ID', placeholder: 'Enter User Id' },
      {
        label: 'Rank',
        type: 'select',
        options: [
          'Free Signup',
          'Fashion Influencer',
          'Vision Influencer',
          'Promoter',
          'Sales Executive',
          'Junior Sales Executive',
          'Senior Sales Executive',
          'Zonal Sales Executive',
        ],
      },
    ],
  },
  '/admin/change-password': {
    kind: 'adminChangePassword',
    title: 'Change Password',
    subtitle: 'Update the admin account password',
    button: 'Change Password',
    fields: [
      { label: 'Old Password', type: 'password', placeholder: 'Enter old password' },
      { label: 'New Password', type: 'password', placeholder: 'Enter new password' },
      { label: 'Confirm Password', type: 'password', placeholder: 'Re-enter new password' },
    ],
  },
  '/admin/utility-desk/message-to-dashboard': {
    kind: 'dashboardMessage',
    title: 'Message Box To Dashboard',
    subtitle: 'Send a notice to all member dashboards',
    button: 'Send',
    messageOnly: true,
    fields: [
      { label: 'Dashboard Message', type: 'textarea', placeholder: 'Write dashboard announcement...' },
    ],
  },
}

const fallbackConfig = {
  title: 'Admin Module',
  subtitle: 'Configure this admin section',
  searchTitle: 'Search Records',
  filters: ['Reg No./Name', 'From Date', 'To Date'],
  reportTitle: 'Records',
  columns: ['Reference', 'Member', 'Date', 'Status'],
  rows: [],
}

const statusTone = {
  Pending: 'gold',
  Verified: 'success',
  Ready: 'success',
  Active: 'success',
  Unpaid: 'gold',
  Blocked: 'danger',
  Distributed: 'success',
  Used: 'success',
  'Un-Used': 'gold',
}

const asMoney = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const asDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const memberName = (member) => [member?.firstName, member?.lastName].filter(Boolean).join(' ') || member?.username || member?.regno || '-'

const memberRow = (member, index) => [
  String(index + 1),
  member.regno,
  memberName(member),
  member.rank?.rankName || 'Member',
  member.mobileNo || '-',
  member.emailId || '-',
  member.sponsorId || '-',
  member.panNo || member.panVerification?.panNo || '-',
  asDate(member.doj),
  asDate(member.paidDate),
]

const liveConfigs = {
  '/admin/pan-card/unverified': {
    load: (token, params) => adminApi.panByStatus(token, 'pending', params),
    rows: (data) => data.items.map((item) => [
      item.member?.regno,
      memberName(item.member),
      item.member?.emailId || '-',
      item.member?.mobileNo || '-',
      item.panNo || '-',
      item.panImage || '-',
      asDate(item.member?.doj),
      item.status,
      {
        type: 'panAction',
        id: item.id,
        regno: item.member?.regno,
        name: memberName(item.member),
      },
    ]),
  },
  '/admin/pan-card/verified': {
    load: (token, params) => adminApi.panByStatus(token, 'verified', params),
    rows: (data) => data.items.map((item) => [
      item.member?.regno,
      memberName(item.member),
      item.member?.emailId || '-',
      item.member?.mobileNo || '-',
      item.panNo || '-',
      item.panImage || '-',
      asDate(item.member?.doj),
      item.status,
    ]),
  },
  '/admin/company-business/current': {
    load: (token, params) => adminApi.orders(token, params),
    rows: (data) => data.items.map((order, index) => [
      String(index + 1),
      order.regno,
      order.name,
      order.orderId,
      asMoney(order.pv),
      asMoney(order.totalAmount),
      asDate(order.saleDate),
      order.billPath || 'Bill',
    ]),
  },
  '/admin/company-business/downline': {
    load: (token, params) => adminApi.downlineBusiness(token, params),
    rows: (data) => data.items.map((row, index) => [
      String(index + 1),
      row.downlineRegno,
      memberName(row.downline),
      row.id,
      asMoney(row.businessAmount),
      asMoney(row.businessAmount),
      asDate(row.fromDate),
    ]),
  },
  '/admin/members/active': {
    load: (token, params) => adminApi.membersByStatus(token, 'active', params),
    rows: (data) => data.items.map((member, index) => [
      ...memberRow(member, index),
      { type: 'memberEdit', regno: member.regno },
      { type: 'memberStatus', action: 'block', regno: member.regno, name: memberName(member) },
    ]),
  },
  '/admin/members/unpaid': {
    load: (token, params) => adminApi.membersByStatus(token, 'unpaid', params),
    rows: (data) => data.items.map((member, index) => [
      String(index + 1),
      member.regno,
      memberName(member),
      member.mobileNo || '-',
      member.emailId || '-',
      member.sponsorId || '-',
      member.panNo || member.panVerification?.panNo || '-',
      'Hidden',
      asDate(member.doj),
      { type: 'memberEdit', regno: member.regno },
      { type: 'memberStatus', action: 'block', regno: member.regno, name: memberName(member) },
    ]),
  },
  '/admin/members/blocked': {
    load: (token, params) => adminApi.membersByStatus(token, 'blocked', params),
    rows: (data) => data.items.map((member, index) => [
      String(index + 1),
      member.regno,
      memberName(member),
      asMoney(member.planAmount),
      member.mobileNo || '-',
      member.sponsorId || '-',
      member.emailId || '-',
      'Hidden',
      asDate(member.doj),
      { type: 'memberEdit', regno: member.regno },
      { type: 'memberStatus', action: 'unblock', regno: member.regno, name: memberName(member) },
    ]),
  },
  '/admin/members/online-transaction-report': {
    load: (token, params) => adminApi.onlineTransactions(token, params),
    rows: (data) => data.items.map((txn, index) => [
      String(index + 1),
      txn.regno,
      txn.name,
      txn.mobile || '-',
      txn.amountTxnId,
      txn.orderId || '-',
      asMoney(txn.transactionAmount),
      asDate(txn.txnDate),
    ]),
  },
  '/admin/payout/distribute': {
    load: (token, params) => adminApi.payouts(token, 'pending', params),
    rows: (data) => data.items.map((payout) => [
      payout.regno,
      payout.name,
      asMoney(payout.generationBonus),
      asMoney(payout.levelBonus),
      asMoney(payout.totalAmount),
      asMoney(payout.tds),
      asMoney(payout.adminCharge),
      asMoney(payout.netAmount),
      payout.bankName || '-',
      payout.accountNo || '-',
      payout.ifscCode || '-',
      payout.mobile || '-',
      payout.aadhaarNo || '-',
      payout.panNo || '-',
    ]),
  },
  '/admin/payout/distributed': {
    load: (token, params) => adminApi.payouts(token, 'distributed', params),
    rows: (data) => data.items.map((payout, index) => [
      String(index + 1),
      payout.regno,
      payout.name,
      asMoney(payout.totalAmount),
      asMoney(payout.tds),
      asMoney(payout.netAmount),
      asDate(payout.paymentDate),
      payout.bankName || '-',
      payout.accountNo || '-',
      payout.ifscCode || '-',
      payout.mobile || '-',
      payout.aadhaarNo || '-',
      payout.panNo || '-',
    ]),
  },
  '/admin/payout/income-detail': {
    load: (token, params) => adminApi.commissions(token, params),
    rows: (data) => data.items.map((item) => [
      asDate(item.createdAt),
      item.earnerRegno,
      memberName(item.earner),
      item.type,
      item.sourceRegno,
      asMoney(item.baseAmount),
      asMoney(item.percentage),
      asMoney(item.amount),
      item.status,
    ]),
  },
  '/admin/pins/activated': {
    load: (token, params) => adminApi.pins(token, { ...params, activeStatus: true }),
    rows: (data) => data.items.map((pin) => [
      '',
      pin.pinSlNo,
      pin.plan?.planName || 'Activation License',
      pin.pinNo,
      pin.planId,
      String(pin.activeStatus),
      asDate(pin.generatedDate),
      asMoney(pin.pinValue),
    ]),
  },
  '/admin/pins/used': {
    load: (token, params) => adminApi.usedPins(token, params),
    rows: (data) => data.items.map((usage, index) => [
      String(index + 1),
      usage.pin?.pinSlNo || '-',
      usage.pin?.pinNo || '-',
      asMoney(usage.pin?.pinValue),
      asDate(usage.pin?.generatedDate),
      'admin',
      usage.usedByRegno,
      usage.usedByName || '-',
      usage.usedForRegno,
      usage.usedForName || '-',
      asDate(usage.usedDate),
    ]),
  },
  '/admin/pins/transaction-report': {
    load: (token, params) => adminApi.pinTransfers(token, params),
    rows: (data) => data.items.map((transfer, index) => [
      String(index + 1),
      transfer.toRegno,
      transfer.toName || memberName(transfer.toMember),
      transfer.pin?.pinSlNo || '-',
      transfer.pin?.pinNo || '-',
      asMoney(transfer.pinTypeValue || transfer.pin?.pinValue),
      asDate(transfer.transferDate),
      transfer.pin?.usedStatus ? 'Used' : 'Un-Used',
    ]),
  },
  '/admin/pins/generation-report': {
    load: (token, params) => adminApi.pins(token, params),
    rows: (data) => data.items.map((pin, index) => [
      String(index + 1),
      pin.pinSlNo,
      pin.pinNo,
      asMoney(pin.pinValue),
      asDate(pin.generatedDate),
      pin.transferStatus ? 'Transferred' : 'Not Transferred',
      pin.usedStatus ? 'Used' : 'Un-Used',
    ]),
  },
  '/admin/rank-setting/report': {
    load: (token, params) => adminApi.rankHistory(token, params),
    rows: (data) => data.items.map((item, index) => [
      String(index + 1),
      item.regno,
      memberName(item.member),
      item.member?.lastName || '',
      item.oldRankName || '-',
      item.newRankName || '-',
      item.oldPercent || '0.00',
      item.newPercent || '0.00',
      asDate(item.createdAt),
    ]),
  },
  '/admin/rank-setting/plan': {
    load: (token) => adminApi.rankPlan(token),
    rows: (data) => [
      ...data.ranks.map((rank) => [
        rank.rankName,
        asMoney(rank.percentage),
        asMoney(rank.selfShoppingAmount),
        asMoney(rank.criteriaBv),
        rank.levelNo ?? '-',
        rank.challengeBusinessBv ? `${asMoney(rank.challengeBusinessBv)} BV / ${rank.challengeMonths || '-'} months` : '-',
      ]),
      ...(data.groupIncentives || []).flatMap((plan) => (plan.generations || []).map((percent, index) => [
        `${plan.rankPercent}% Group Incentive Gen ${index + 1}`,
        asMoney(percent),
        '-',
        '-',
        `Gen ${index + 1}`,
        'Extra group income',
      ])),
    ],
  },
  '/admin/rank-setting/rewards': {
    load: (token, params) => adminApi.rankRewards(token, params),
    rows: (data) => data.items.map((item) => [
      item.regno,
      item.name || '-',
      item.rankName,
      asMoney(item.rankPercent),
      asMoney(item.selfBv),
      asMoney(item.teamBv),
      {
        type: 'rewardClaims',
        claims: item.rewards?.filter((reward) => reward.eligible && reward.claim).map((reward) => ({
          ...reward.claim,
          reward: reward.reward,
        })) || [],
      },
    ]),
  },
  '/admin/utility-desk/member-help-desk': {
    load: (token, params) => adminApi.helpDesk(token, params),
    rows: (data) => data.items.map((item) => [
      item.id,
      item.regno,
      item.subject || '-',
      asDate(item.createdAt),
      { type: 'supportShow', ticket: item },
      { type: 'supportDelete', ticket: item },
    ]),
  },
}

function isMemberRegistrationCell(columns, cell, cellIndex) {
  const column = String(columns[cellIndex] || '').toLowerCase()
  const value = String(cell || '').trim()
  const memberIdColumn =
    column.includes('reg') ||
    column.includes('sponsor') ||
    column.includes('createdby') ||
    column.includes('used by') ||
    column.includes('used for')

  return /^[A-Z]{2,}\d{3,}$/i.test(value) && memberIdColumn
}

const filterParams = (values = {}) => {
  const params = {}
  Object.entries(values).forEach(([label, value]) => {
    const clean = String(value || '').trim()
    if (!clean) return
    const key = label.toLowerCase()
    if (key.includes('from') || key.includes('date from')) params.fromDate = clean
    else if (key.includes('to') || key.includes('date to')) params.toDate = clean
    else if (key.includes('mobile')) params.mobile = clean
    else if (key.includes('pin value') || key.includes('plan') || key.includes('pin type')) params.pinValue = clean
    else if (key.includes('downline')) params.downlineRegno = clean
    else if (key.includes('order')) params.orderId = clean
    else if (key.includes('name') && key.includes('reg')) params.q = clean
    else if (key.includes('reg')) params.regno = clean
    else params.q = clean
  })
  return params
}

function SearchPanel({ title, filters, onSearch }) {
  const [values, setValues] = useState({})
  const setValue = (filter, value) => setValues((current) => ({ ...current, [filter]: value }))
  const clear = () => {
    setValues({})
    onSearch?.({})
  }
  const submit = (event) => {
    event.preventDefault()
    onSearch?.(values)
  }

  return (
    <Card className="overflow-hidden p-0 shadow-sm" animate={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900/8 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-100 text-gold-700">
            <SlidersHorizontal size={17} strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-950">{title}</h2>
            <p className="text-xs text-ink-400">Filter records by plan and date range</p>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-900/10 px-3 py-2 text-xs font-medium text-ink-500 transition hover:border-gold-400 hover:text-gold-700"
        >
          <RotateCcw size={14} strokeWidth={1.8} />
          Clear
        </button>
      </div>
      <form className="grid gap-4 p-5 md:grid-cols-3 xl:grid-cols-[1.25fr_1fr_1fr_auto]" onSubmit={submit}>
        {filters.map((filter) => (
          filter.toLowerCase().includes('select') || filter.toLowerCase().includes('plan') ? (
            <label key={filter} className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">{filter}</span>
              <span className="relative flex items-center">
                <select
                  value={values[filter] || ''}
                  onChange={(event) => setValue(filter, event.target.value)}
                  className="h-[42px] w-full appearance-none rounded-lg border border-ink-900/12 bg-white px-3.5 pr-10 text-sm text-ink-900 outline-none transition-shadow duration-150 focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
                >
                  <option value="">All Plans</option>
                  <option value="3000">Activation License - Rs 3,000</option>
                  <option value="5000">Growth Plan - Rs 5,000</option>
                  <option value="10000">Premium Plan - Rs 10,000</option>
                </select>
                <ChevronDown size={16} strokeWidth={1.8} className="pointer-events-none absolute right-3.5 text-ink-400" />
              </span>
            </label>
          ) : (
            <Input
              key={filter}
              label={filter}
              placeholder={filter}
              value={values[filter] || ''}
              onChange={(event) => setValue(filter, event.target.value)}
              type={filter.toLowerCase().includes('date') ? 'date' : 'text'}
              icon={filter.toLowerCase().includes('date') ? CalendarDays : undefined}
            />
          )
        ))}
        <div className="flex items-end">
          <Button type="submit" className="h-[42px] w-full md:w-auto" variant="gold" icon={Search}>
            Search
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ActionForm({ config }) {
  const { token } = useAuth()
  const toast = useToast()
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)

  const valueFor = (field) => values[field.label] ?? field.options?.[0] ?? ''
  const setValue = (field, value) => setValues((current) => ({ ...current, [field.label]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (config.kind === 'generatePin') {
        await adminApi.generatePins(token, {
          pinValue: Number(values['Pin Value'] || config.fields[0].options[0]),
          noOfPins: Number(values['No Of Pin'] || 1),
        })
      } else if (config.kind === 'transferPin') {
        await adminApi.transferPins(token, {
          toRegno: values['EnterYour ID'],
          pinValue: Number(values['Pin type'] || config.fields[2].options[0]),
          noOfPins: Number(values['No of Pins'] || 1),
        })
      } else if (config.kind === 'dashboardMessage') {
        await adminApi.createDashboardMessage(token, {
          message: values['Dashboard Message'],
          active: true,
        })
      } else if (config.kind === 'rankUpgrade') {
        await adminApi.upgradeRank(token, {
          regno: values['User ID'],
          rankName: values.Rank || config.fields[1].options[0],
        })
      } else if (config.kind === 'adminChangePassword') {
        if (values['New Password'] !== values['Confirm Password']) {
          toast.push('New password and confirm password do not match.', 'error')
          return
        }
        await adminApi.changePassword(token, {
          oldPassword: values['Old Password'],
          newPassword: values['New Password'],
        })
      } else {
        toast.push('This action needs a dedicated backend workflow.', 'info')
        return
      }
      toast.push(`${config.title} completed successfully.`, 'success')
      setValues({})
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (config.messageOnly) {
    return (
      <UtilityMessageForm config={config} onSubmit={submit} values={values} setValue={setValue} saving={saving} />
    )
  }

  return (
    <div className={config.wide ? 'flex justify-center' : 'flex justify-center pt-8'}>
      <Card className={config.wide ? 'w-full max-w-5xl overflow-hidden p-0 shadow-sm' : 'w-full max-w-md overflow-hidden p-0 shadow-sm'} animate={false}>
        {config.wide && (
          <div className="border-b border-ink-900/8 bg-gradient-to-r from-ink-950 to-ink-700 px-5 py-3 text-center text-sm font-semibold uppercase text-gold-100">
            {config.title}
          </div>
        )}
        <form className={config.wide ? 'p-6' : 'p-7'} onSubmit={submit}>
          {!config.wide && (
            <div className="mb-5">
              <h3 className="font-display text-3xl font-semibold text-ink-950">{config.title}</h3>
              {config.subtitle && <p className="mt-1 text-sm text-ink-400">{config.subtitle}</p>}
            </div>
          )}
          <div className={config.wide ? 'max-w-xl space-y-4' : 'space-y-5'}>
            {config.fields.map((field) => (
              <div key={field.label} className={config.wide ? 'grid gap-2 sm:grid-cols-[150px_1fr_auto]' : ''}>
                <label
                  className={
                    config.wide
                      ? 'flex items-center justify-center rounded-lg bg-ink-950 px-3 py-2 text-xs font-semibold text-gold-100'
                      : 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400'
                  }
                >
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    className="w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
                    value={valueFor(field)}
                    onChange={(event) => setValue(field, event.target.value)}
                  >
                    {field.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder || ''}
                    value={valueFor(field)}
                    onChange={(event) => setValue(field, event.target.value)}
                    className="min-h-32 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
                  />
                ) : (
                  <Input
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    value={valueFor(field)}
                    onChange={(event) => setValue(field, event.target.value)}
                    containerClassName={config.wide ? 'block' : ''}
                  />
                )}
                {field.helper && <p className="self-center text-xs font-medium text-emerald-mlm">{field.helper}</p>}
              </div>
            ))}
          </div>
          <div className={config.wide ? 'mt-5 flex justify-center' : 'mt-5 flex justify-end'}>
            <Button type="submit" size="sm" variant="gold" icon={Send} loading={saving}>
              {config.button}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function UtilityMessageForm({ config, includeReply = false, onSubmit, values, setValue, saving = false }) {
  const [localValues, setLocalValues] = useState({})
  const formValues = values || localValues
  const updateValue = setValue || ((field, value) => setLocalValues((current) => ({ ...current, [field.label]: value })))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gold-100 text-gold-700 ring-1 ring-gold-300/60">
          <MessageSquareText size={20} />
        </div>
        <h2 className="font-display text-3xl font-semibold text-ink-950">{config.title}</h2>
        <p className="mt-1 text-sm text-ink-400">{config.subtitle}</p>
      </div>

      <Card className="overflow-hidden p-0 shadow-sm" animate={false}>
        <div className="border-b border-ink-900/8 bg-gradient-to-r from-ink-950 to-ink-700 px-5 py-3 text-sm font-semibold text-gold-100">
          {includeReply ? 'Reply' : 'Compose Message'}
        </div>
        <form
          className="grid gap-5 p-6 md:grid-cols-[1fr_auto] md:items-end"
          onSubmit={onSubmit || ((event) => event.preventDefault())}
        >
          <div className="space-y-4">
            {includeReply && (
              <Input
                label="Subject"
                placeholder="Reply subject"
                value={formValues.Subject || ''}
                onChange={(event) => updateValue({ label: 'Subject' }, event.target.value)}
              />
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-400">Message</span>
              <textarea
                placeholder="Write message..."
                value={formValues['Dashboard Message'] || formValues.Message || ''}
                onChange={(event) => updateValue({ label: 'Dashboard Message' }, event.target.value)}
                className="min-h-36 w-full rounded-lg border border-ink-900/12 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-shadow focus:border-gold-400 focus:ring-2 focus:ring-gold-300/60"
              />
            </label>
          </div>
          <Button type="submit" variant="gold" icon={Send} loading={saving}>
            {config.button || 'Send'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function PanActionButtons({ action, onPanAction }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="gold"
        icon={Check}
        onClick={() => onPanAction(action, 'Verified')}
      >
        Verify
      </Button>
      <Button
        type="button"
        size="sm"
        variant="danger"
        icon={X}
        onClick={() => onPanAction(action, 'Cancelled')}
      >
        Cancel
      </Button>
    </div>
  )
}

function MemberActionButton({ action, onMemberStatusAction }) {
  if (action.type === 'memberEdit') {
    return (
      <Link
        to={`/admin/member-account/${action.regno}`}
        className="inline-flex items-center justify-center rounded-lg border border-ink-900/15 px-3 py-1.5 text-xs font-medium text-ink-900 transition hover:border-gold-400 hover:text-gold-700"
      >
        Edit
      </Link>
    )
  }

  const isBlock = action.action === 'block'

  return (
    <Button
      type="button"
      size="sm"
      variant={isBlock ? 'danger' : 'gold'}
      onClick={() => onMemberStatusAction(action)}
    >
      {isBlock ? 'Block' : 'Unblock'}
    </Button>
  )
}

function SupportActionButton({ action, onSupportSelect, onSupportDelete }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={action.type === 'supportDelete' ? 'danger' : 'outline'}
      onClick={() => action.type === 'supportDelete' ? onSupportDelete(action.ticket) : onSupportSelect(action.ticket)}
    >
      {action.type === 'supportDelete' ? 'Delete' : 'Show'}
    </Button>
  )
}

function RewardClaimActions({ action, onRewardStatusAction }) {
  if (!action.claims?.length) return <span className="text-xs text-ink-400">No eligible reward</span>

  return (
    <div className="min-w-72 space-y-2">
      {action.claims.map((claim) => (
        <div key={claim.id} className="rounded-lg border border-ink-900/8 bg-white p-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-ink-900">{claim.rewardText || claim.reward}</p>
              <p className="text-[11px] text-ink-400">{claim.title}</p>
            </div>
            <Badge tone={claim.status === 'Paid' ? 'success' : claim.status === 'Rejected' ? 'danger' : claim.status === 'Approved' ? 'gold' : 'neutral'}>
              {claim.status}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['Approved', 'Paid', 'Rejected'].map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={status === 'Rejected' ? 'danger' : status === 'Paid' ? 'gold' : 'outline'}
                disabled={claim.status === status}
                onClick={() => onRewardStatusAction(claim, status)}
              >
                {status === 'Approved' ? 'Approve' : status === 'Paid' ? 'Paid' : 'Reject'}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportTable({ config, onPanAction, onMemberStatusAction, onSupportSelect, onSupportDelete, onRewardStatusAction }) {
  return (
    <Card className="overflow-hidden p-0 shadow-sm" animate={false}>
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/8 bg-white px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
          <FileText size={16} />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink-950">{config.reportTitle}</h3>
        {config.note && <p className="text-xs font-semibold text-rose-mlm">{config.note}</p>}
      </div>
      <div className="bg-ivory-50/60 p-4">
        <Table>
          <THead columns={config.columns} />
          <tbody>
            {config.rows.map((row, rowIndex) => (
              <TRow key={`${config.reportTitle}-${rowIndex}`}>
                {row.map((cell, cellIndex) => {
                  const isRegNo = isMemberRegistrationCell(config.columns, cell, cellIndex)
                  const isPanAction = cell?.type === 'panAction'
                  const isMemberAction = cell?.type === 'memberEdit' || cell?.type === 'memberStatus'
                  const isSupportAction = cell?.type === 'supportShow' || cell?.type === 'supportDelete'
                  const isRewardAction = cell?.type === 'rewardClaims'

                  return (
                    <TCell
                      key={`${cell}-${cellIndex}`}
                      className={
                        isRegNo || cellIndex === 0
                          ? 'font-mono text-xs text-ink-400'
                          : ''
                      }
                    >
                      {isPanAction ? (
                        <PanActionButtons action={cell} onPanAction={onPanAction} />
                      ) : isMemberAction ? (
                        <MemberActionButton action={cell} onMemberStatusAction={onMemberStatusAction} />
                      ) : isSupportAction ? (
                        <SupportActionButton
                          action={cell}
                          onSupportSelect={onSupportSelect}
                          onSupportDelete={onSupportDelete}
                        />
                      ) : isRewardAction ? (
                        <RewardClaimActions action={cell} onRewardStatusAction={onRewardStatusAction} />
                      ) : cell === 'Pending' || cell === 'Verified' || cell === 'Ready' ? (
                        <Badge tone={statusTone[cell]}>{cell}</Badge>
                      ) : isRegNo ? (
                        <Link
                          to={`/admin/member-account/${cell}`}
                          className="font-semibold text-gold-700 underline-offset-4 transition hover:text-ink-950 hover:underline"
                        >
                          {cell}
                        </Link>
                      ) : (
                        cell
                      )}
                    </TCell>
                  )
                })}
              </TRow>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}

export default function AdminModulePage() {
  const { pathname } = useLocation()
  const formConfig = formConfigs[pathname]
  const baseConfig = pageConfigs[pathname] || fallbackConfig
  const [liveRows, setLiveRows] = useState(null)
  const [searchParams, setSearchParams] = useState({})
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0 })
  const [confirmAction, setConfirmAction] = useState(null)
  const [memberStatusAction, setMemberStatusAction] = useState(null)
  const [rewardStatusAction, setRewardStatusAction] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewingTicket, setViewingTicket] = useState(null)
  const [utilityValues, setUtilityValues] = useState({})
  const [savingAction, setSavingAction] = useState(false)
  const { token } = useAuth()
  const toast = useToast()
  const hasLiveConfig = Boolean(liveConfigs[pathname])
  const config = hasLiveConfig ? { ...baseConfig, rows: liveRows || [] } : baseConfig

  usePageTitle(formConfig?.title || config.title, formConfig?.subtitle || config.subtitle)

  useEffect(() => {
    setSearchParams({})
    setMeta({ page: 1, limit: 25, total: 0 })
  }, [pathname])

  useEffect(() => {
    const live = liveConfigs[pathname]
    if (!live || formConfig) {
      setLiveRows(null)
      return
    }

    let alive = true
    setLiveRows([])
    live.load(token, { page: meta.page, limit: meta.limit, ...searchParams })
      .then((data) => {
        if (alive) setLiveRows(live.rows(data))
        if (alive) setMeta(data.meta || { page: meta.page, limit: meta.limit, total: live.rows(data).length })
      })
      .catch((error) => {
        toast.push(error.message, 'error')
        if (alive) setLiveRows([])
      })
    return () => {
      alive = false
    }
  }, [formConfig, meta.page, meta.limit, pathname, searchParams, token, toast])

  const handleSearch = (values) => {
    setSearchParams(filterParams(values))
    setMeta((current) => ({ ...current, page: 1 }))
  }

  const handlePanAction = (action, status) => {
    setConfirmAction({ ...action, status })
  }

  const closePanConfirm = () => {
    if (!savingAction) setConfirmAction(null)
  }

  const confirmPanAction = async () => {
    if (!confirmAction?.id) return

    setSavingAction(true)
    try {
      await adminApi.updatePanStatus(token, confirmAction.id, confirmAction.status)
      setLiveRows((rows) => rows?.filter((row) => !row.some((cell) => cell?.id === confirmAction.id)) || rows)
      toast.push(
        `${confirmAction.regno || 'PAN'} marked ${confirmAction.status === 'Verified' ? 'verified' : 'cancelled'}.`,
        confirmAction.status === 'Verified' ? 'success' : 'error'
      )
      setConfirmAction(null)
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingAction(false)
    }
  }

  const handleMemberStatusAction = (action) => {
    setMemberStatusAction(action)
  }

  const closeMemberStatusConfirm = () => {
    if (!savingAction) setMemberStatusAction(null)
  }

  const confirmMemberStatusAction = async () => {
    if (!memberStatusAction?.regno) return

    setSavingAction(true)
    try {
      if (memberStatusAction.action === 'block') {
        await adminApi.blockMember(token, memberStatusAction.regno)
      } else {
        await adminApi.unblockMember(token, memberStatusAction.regno)
      }
      setLiveRows((rows) => rows?.filter((row) => !row.some((cell) => cell?.regno === memberStatusAction.regno)) || rows)
      toast.push(
        `${memberStatusAction.regno} ${memberStatusAction.action === 'block' ? 'moved to blocked members' : 'moved out of blocked members'}.`,
        memberStatusAction.action === 'block' ? 'error' : 'success'
      )
      setMemberStatusAction(null)
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingAction(false)
    }
  }

  const handleRewardStatusAction = (claim, status) => {
    setRewardStatusAction({ claim, status })
  }

  const closeRewardStatusConfirm = () => {
    if (!savingAction) setRewardStatusAction(null)
  }

  const confirmRewardStatusAction = async () => {
    if (!rewardStatusAction?.claim?.id) return

    setSavingAction(true)
    try {
      const updated = await adminApi.updateReward(token, rewardStatusAction.claim.id, {
        status: rewardStatusAction.status,
      })
      setLiveRows((rows) => rows?.map((row) => row.map((cell) => {
        if (cell?.type !== 'rewardClaims') return cell
        return {
          ...cell,
          claims: cell.claims.map((claim) => claim.id === updated.id ? { ...claim, ...updated } : claim),
        }
      })) || rows)
      toast.push(`Reward marked ${rewardStatusAction.status}.`, rewardStatusAction.status === 'Rejected' ? 'error' : 'success')
      setRewardStatusAction(null)
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingAction(false)
    }
  }

  const showSupportTicket = (ticket) => {
    setViewingTicket(ticket)
    setSelectedTicket(ticket)
    setUtilityValues({
      Subject: ticket.subject || '',
      'Dashboard Message': ticket.replies?.[0]?.reply || '',
    })
  }

  const deleteSupportTicket = async (ticket) => {
    setSavingAction(true)
    try {
      if (token && ticket.source !== 'fallback') {
        await adminApi.deleteHelpDesk(token, ticket.id)
      }
      setLiveRows((rows) => (rows || baseConfig.rows).filter((row) => String(row[0]) !== String(ticket.id)))
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(null)
        setUtilityValues({})
      }
      if (viewingTicket?.id === ticket.id) {
        setViewingTicket(null)
      }
      toast.push(`Ticket HD${ticket.id} deleted.`, 'success')
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingAction(false)
    }
  }

  const updateUtilityValue = (field, value) => {
    setUtilityValues((current) => ({ ...current, [field.label]: value }))
  }

  const sendSupportReply = async (event) => {
    event.preventDefault()
    if (!selectedTicket?.id) {
      toast.push('Select a support ticket from the list before sending a reply.', 'info')
      return
    }
    const reply = utilityValues['Dashboard Message'] || utilityValues.Message || ''
    if (!reply.trim()) {
      toast.push('Write a reply message before sending.', 'error')
      return
    }

    setSavingAction(true)
    try {
      await adminApi.replyHelpDesk(token, selectedTicket.id, { reply })
      toast.push(`Reply sent for ticket HD${selectedTicket.id}.`, 'success')
      setUtilityValues((current) => ({ ...current, 'Dashboard Message': '' }))
    } catch (error) {
      toast.push(error.message, 'error')
    } finally {
      setSavingAction(false)
    }
  }

  if (formConfig) {
    return <ActionForm config={formConfig} />
  }

  if (config.utility === 'member') {
    return (
      <div className="space-y-8">
        <UtilityMessageForm
          includeReply
          onSubmit={sendSupportReply}
          values={utilityValues}
          setValue={updateUtilityValue}
          saving={savingAction}
          config={{
            title: 'Message Box',
            subtitle: selectedTicket ? `Replying to HD${selectedTicket.id} from ${selectedTicket.regno}` : 'Select a ticket below to reply',
            button: 'Send',
          }}
        />
        <ReportTable
          config={config}
          onPanAction={handlePanAction}
          onMemberStatusAction={handleMemberStatusAction}
          onSupportSelect={showSupportTicket}
          onSupportDelete={deleteSupportTicket}
          onRewardStatusAction={handleRewardStatusAction}
        />
        <Modal
          open={Boolean(viewingTicket)}
          onClose={() => setViewingTicket(null)}
          title={viewingTicket?.subject || 'Member Message'}
          maxWidth="max-w-xl"
          footer={
            <Button type="button" variant="gold" onClick={() => setViewingTicket(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-sm text-ink-600">
            <div className="grid gap-2 rounded-lg border border-ink-900/8 bg-ivory-50 p-4 sm:grid-cols-2">
              <p><span className="font-semibold text-ink-950">Agent ID:</span> {viewingTicket?.regno || '-'}</p>
              <p><span className="font-semibold text-ink-950">Date:</span> {asDate(viewingTicket?.createdAt)}</p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-400">Message</p>
              <p className="whitespace-pre-wrap rounded-lg border border-ink-900/8 bg-white p-4 leading-6 text-ink-800">
                {viewingTicket?.message || 'No message content available.'}
              </p>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {config.searchTitle && <SearchPanel title={config.searchTitle} filters={config.filters} onSearch={handleSearch} />}
        <ReportTable
          config={config}
          onPanAction={handlePanAction}
          onMemberStatusAction={handleMemberStatusAction}
          onSupportSelect={showSupportTicket}
          onSupportDelete={deleteSupportTicket}
          onRewardStatusAction={handleRewardStatusAction}
        />
        {hasLiveConfig && (
          <Pagination
            meta={meta}
            page={meta.page}
            limit={meta.limit}
            onPageChange={(page) => setMeta((current) => ({ ...current, page }))}
            onLimitChange={(limit) => setMeta({ page: 1, limit, total: meta.total })}
          />
        )}
      </div>
      <Modal
        open={Boolean(confirmAction)}
        onClose={closePanConfirm}
        title={confirmAction?.status === 'Verified' ? 'Verify PAN Card' : 'Cancel PAN Card'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closePanConfirm} disabled={savingAction}>
              No, keep pending
            </Button>
            <Button
              type="button"
              variant={confirmAction?.status === 'Verified' ? 'gold' : 'danger'}
              loading={savingAction}
              onClick={confirmPanAction}
            >
              Yes, {confirmAction?.status === 'Verified' ? 'verify' : 'cancel'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-ink-500">
          Are you sure you want to {confirmAction?.status === 'Verified' ? 'verify' : 'cancel'} PAN verification for{' '}
          <span className="font-semibold text-ink-950">{confirmAction?.name || confirmAction?.regno}</span>
          {confirmAction?.regno ? <span> ({confirmAction.regno})</span> : null}?
        </p>
      </Modal>
      <Modal
        open={Boolean(memberStatusAction)}
        onClose={closeMemberStatusConfirm}
        title={memberStatusAction?.action === 'block' ? 'Block Member' : 'Unblock Member'}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeMemberStatusConfirm} disabled={savingAction}>
              No, keep as it is
            </Button>
            <Button
              type="button"
              variant={memberStatusAction?.action === 'block' ? 'danger' : 'gold'}
              loading={savingAction}
              onClick={confirmMemberStatusAction}
            >
              Yes, {memberStatusAction?.action === 'block' ? 'block' : 'unblock'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-ink-500">
          Are you sure you want to {memberStatusAction?.action === 'block' ? 'block' : 'unblock'}{' '}
          <span className="font-semibold text-ink-950">{memberStatusAction?.name || memberStatusAction?.regno}</span>
          {memberStatusAction?.regno ? <span> ({memberStatusAction.regno})</span> : null}?
        </p>
      </Modal>
      <Modal
        open={Boolean(rewardStatusAction)}
        onClose={closeRewardStatusConfirm}
        title="Update Reward Status"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeRewardStatusConfirm} disabled={savingAction}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={rewardStatusAction?.status === 'Rejected' ? 'danger' : 'gold'}
              loading={savingAction}
              onClick={confirmRewardStatusAction}
            >
              Yes, mark {rewardStatusAction?.status}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-6 text-ink-500">
          Update reward claim{' '}
          <span className="font-semibold text-ink-950">{rewardStatusAction?.claim?.rewardText}</span>
          {' '}to <span className="font-semibold text-ink-950">{rewardStatusAction?.status}</span>?
        </p>
      </Modal>
    </>
  )
}
