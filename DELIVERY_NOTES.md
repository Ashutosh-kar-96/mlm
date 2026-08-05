# Rahuovelia MLM Delivery Notes

## Implemented Client Plan Logic

- Free Signup rank: 10%.
- Rank/self shopping ladder: 14%, 19%, 24%, 29%, 38%, 41%, 42%.
- Rank differential income on new approved orders/activations.
- 38% group incentive: Gen 1 to Gen 5 = 7%, 4.5%, 3%, 2%, 1%.
- 41% group incentive: Gen 1 to Gen 5 = 11.25%, 6.25%, 4.5%, 2.5%, 1%.
- Reward eligibility report and claim status tracking: Pending, Approved, Paid, Rejected.

## Admin Screens

- Rank Setting > Plan Summary
- Rank Setting > Reward Report
- Rank Setting > Set Rank
- Payout > Income Detail
- Company Business > Find Current Company Business
- Company Business > User Downline Business

## Member Screens

- My Payout > Income Detail
- Wallet
- My Business > My Downline
- Shopping Order > My Orders

## Local Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd rahuovelia-frontend
npm run dev
```

## Production Build

Frontend:

```bash
cd rahuovelia-frontend
npm run build
```

Backend:

```bash
cd backend
npm start
```

Set `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` in backend environment. Set `VITE_API_URL` in frontend environment to the production backend API URL.

## Historical Commission Recalculation

Preview affected orders:

```bash
cd backend
npm run recalculate:commissions -- --dry-run=true
```

Apply recalculation for all approved orders:

```bash
cd backend
npm run recalculate:commissions -- --dry-run=false
```

Apply for one order:

```bash
cd backend
npm run recalculate:commissions -- --order-id=ORD1000001 --dry-run=false
```

Apply for a date range:

```bash
cd backend
npm run recalculate:commissions -- --from=2026-08-01 --to=2026-08-31 --dry-run=false
```
