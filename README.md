# LenderPro — Frontend

Next.js 15 frontend with Tailwind CSS for loan & interest management.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| /login | Auth (login + register) |
| /dashboard | Stats, charts, recent repayments |
| /borrowers | Borrower management (CRUD) |
| /loans | Loan list with filters + progress |
| /loans/[id] | Loan detail + repayment history |
| /repayments | All repayments across loans |
| /reports | Analytics: trends, pie charts, table |

## Folder Structure
```
src/
├── app/
│   ├── layout.jsx          # Root layout
│   ├── page.jsx            # Redirect → /dashboard
│   ├── (app)/layout.jsx    # Sidebar layout
│   ├── login/
│   ├── dashboard/
│   ├── borrowers/
│   ├── loans/
│   │   └── [id]/           # Loan detail
│   ├── repayments/
│   └── reports/
├── components/
│   ├── layout/
│   │   └── Sidebar.jsx
│   ├── ui/
│   │   └── index.jsx       # Modal, StatCard, StatusBadge, etc.
│   ├── borrowers/
│   │   └── BorrowerForm.jsx
│   ├── loans/
│   │   └── LoanForm.jsx
│   └── repayments/
│       └── RepaymentForm.jsx
└── lib/
    ├── api.js              # Axios + all API calls
    └── utils.js            # formatCurrency, formatDate, etc.
```
