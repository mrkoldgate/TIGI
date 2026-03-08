# TIGI — Role & Permission Matrix

> **Version:** 2.0  
> **Status:** Active  
> **Last updated:** March 7, 2026

---

## 1. Role Definitions

### 1.1 Platform Roles

| Role | DB Enum | Description | Assignment |
|---|---|---|---|
| **Buyer** | `INVESTOR` | Purchasing whole properties outright | Self-selected at onboarding |
| **Investor** | `INVESTOR` | Buying fractional ownership tokens | Self-selected at onboarding |
| **Seller** | `OWNER` | Selling owned property | Self-selected at onboarding |
| **Property Owner** | `OWNER` | Listing and managing owned properties | Self-selected at onboarding |
| **Land Owner** | `OWNER` | Listing land for sale, lease, or development | Self-selected at onboarding |
| **Developer** | `INVESTOR` | Leasing land for development projects | Self-selected at onboarding |
| **Legal Professional** | `PROFESSIONAL` | Reviewing documents, compliance advisory | Self-selected at onboarding |
| **Financial Professional** | `PROFESSIONAL` | Investment analysis, portfolio advisory | Self-selected at onboarding |
| **Admin** | `ADMIN` | Full platform operations and configuration | Admin-assigned only |
| **Compliance Officer** | `COMPLIANCE_OFFICER` | KYC/AML review, transaction flagging | Admin-assigned only |

### 1.2 Role → DB Enum Mapping

In the database, the 10 user-facing roles map to 5 stored enums. The user's functional role is determined by their DB enum plus their selected sub-type (stored in `User.userType`):

```
DB Enum: INVESTOR
├── Buyer        (userType: 'buyer')
├── Investor     (userType: 'investor')
└── Developer    (userType: 'developer')

DB Enum: OWNER
├── Seller         (userType: 'seller')
├── Property Owner (userType: 'property_owner')
└── Land Owner     (userType: 'land_owner')

DB Enum: PROFESSIONAL
├── Legal Professional     (userType: 'legal')
└── Financial Professional (userType: 'financial')

DB Enum: ADMIN
└── Admin (single type)

DB Enum: COMPLIANCE_OFFICER
└── Compliance Officer (single type)
```

### 1.3 Role Stacking

- Users can hold **multiple DB enums** — e.g., a Property Owner who also invests has both `OWNER` + `INVESTOR`
- Permissions are **additive** — union of all granted permissions
- `ADMIN` and `COMPLIANCE_OFFICER` are **restricted** — cannot be self-assigned
- Role changes logged to `AuditLog`

---

## 2. Permission Legend

| Symbol | Meaning |
|---|---|
| ✅ | Full access |
| 🔒 | Own resources only |
| 📖 | Read-only |
| ⚡ | Requires KYC verification |
| 🔶 | Requires TIGI Pro subscription |
| ❌ | No access |

---

## 3. Permission Matrices

### 3.1 Marketplace & Property Listings

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Browse marketplace (active listings) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Property detail page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Property images | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Property documents | ⚡ | ⚡ | ⚡ | ✅ | ✅ | ⚡ | ✅ | ✅ | ✅ | ✅ |
| Token info panel | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI valuation (basic) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI valuation (full report) | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | ✅ | ✅ |
| Ownership history | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| All listings (incl. drafts, rejected) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Create property listing (sale) | ❌ | ❌ | ⚡ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create property listing (lease) | ❌ | ❌ | ❌ | ⚡ | ⚡ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Upload property images | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Upload property documents | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Create seed/demo listing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Edit own listing details | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Change own listing price | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pause/unpause own listing | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delist own property | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Edit any listing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Feature/unfeature listing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Approve/reject listing | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Request listing changes | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Verify documents | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 3.2 Investment & Tokens

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Token info on listing | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Own portfolio/holdings | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Own holding detail (cost basis, ROI) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Investment progress on own listing | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| All platform holdings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Purchase fractions (invest) | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ❌ |
| Trigger token mint | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Save to watchlist | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Transfer own tokens | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ❌ | ❌ |
| Resell own fractions (Phase 2) | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ❌ | ❌ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Freeze/unfreeze token | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Burn token | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 3.3 Transactions & Escrow

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Own transactions | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Transaction step tracker (own) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Escrow details (own) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| On-chain verification links | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| All platform transactions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Make purchase offer | ⚡ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Initiate fractional investment | ❌ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ⚡ | ❌ | ❌ |
| Counter-offer | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ❌ |

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Cancel own pending offer | 🔒 | 🔒 | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ | ❌ | ✅ |
| Withdraw from escrow (before conditions met) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ✅ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Accept/reject offer (as seller) | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Mark transaction condition met | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Release escrow | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Refund escrow | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Freeze escrow (dispute) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Flag transaction | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 3.4 Inheritance & Estate Planning

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Own estate plan dashboard | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Own beneficiary designations | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| All estate plans (platform) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Create beneficiary designation | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ⚡🔒 | ❌ | ❌ |

Note: Any user who holds tokens can create designations. The ⚡ indicates KYC is required first.

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Edit own beneficiary designation | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| Revoke own designation | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Trigger inheritance transfer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Verify legal documents for trigger | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 3.5 Leasing

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Browse lease listings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lease detail + terms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Own active leases (as tenant) | 🔒 | 🔒 | ❌ | ❌ | ❌ | 🔒 | ❌ | ❌ | ❌ | ✅ |
| Own lease listings (as landlord) | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Applications for own lease | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| All platform leases | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Create lease listing | ❌ | ❌ | ❌ | ⚡🔒 | ⚡🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Apply for lease | ⚡ | ⚡ | ❌ | ⚡ | ❌ | ⚡ | ❌ | ❌ | ❌ | ❌ |

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Edit own lease listing terms | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cancel own lease application | 🔒 | 🔒 | ❌ | 🔒 | ❌ | 🔒 | ❌ | ❌ | ❌ | ✅ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Accept/reject lease application | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Terminate active lease | ❌ | ❌ | ❌ | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 3.6 AI Features

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Basic valuation (free) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Full valuation report | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | ✅ | ✅ |
| Investment recommendations | 🔶 | 🔶 | ❌ | ❌ | ❌ | 🔶 | ❌ | 🔶 | ❌ | ✅ |
| Market intelligence dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Market intelligence (advanced) | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | ✅ | ✅ |
| Fraud detection alerts | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Request valuation (own listing) | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ |
| Request valuation (any listing) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Generate legal document summary | ❌ | ❌ | 🔶 | 🔶 | 🔶 | ❌ | 🔶 | ❌ | ✅ | ✅ |
| Run property comparison | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | 🔶 | ✅ | ✅ |

---

### 3.7 Legal & Compliance

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Own KYC status | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| KYC review queue | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| KYC submission details | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Audit log (own actions) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit log (all actions) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |
| Regulatory badges on listings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

#### CREATE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Submit KYC verification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload compliance documents | ❌ | ❌ | 🔒 | 🔒 | 🔒 | ❌ | 🔒 | ❌ | ❌ | ✅ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Approve/reject KYC | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Verify/reject document | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| File SAR (suspicious activity) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

### 3.8 User Management & Admin

#### VIEW Permissions

| Resource | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Own profile | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| Other users' public profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 📖 | ✅ |
| User management list | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| User detail (full) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| System health/monitoring | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

#### EDIT Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Edit own profile | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| Change own password | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| Change own roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Add INVESTOR or OWNER role to self | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

#### APPROVE Permissions

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| Change any user's role | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Suspend/unsuspend user | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete user account | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Toggle subscription tier | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign COMPLIANCE_OFFICER role | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Assign ADMIN role | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 3.9 Wallet & Blockchain

| Action | Buyer | Investor | Seller | Prop Owner | Land Owner | Developer | Legal | Financial | Compliance | Admin |
|---|---|---|---|---|---|---|---|---|---|---|
| **VIEW** own wallet address | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| **VIEW** own on-chain balances | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| **VIEW** platform treasury | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CREATE** connect external wallet | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **CREATE** export custodial keys | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ❌ |
| **EDIT** disconnect wallet | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |
| **EDIT** switch wallet | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | ❌ | ✅ |

---

## 4. Cannot-Access Summary

Quick reference of what each role explicitly **cannot** do:

### Buyer
- ❌ Create property listings
- ❌ Create lease listings
- ❌ Approve/reject any listing, KYC, or transaction
- ❌ Access admin dashboard or compliance tools
- ❌ Trigger token minting or manage tokens
- ❌ View other users' portfolios, transactions, or private data

### Investor
- ❌ Create property or lease listings
- ❌ Accept/reject offers (unless also an Owner)
- ❌ Access admin dashboard or compliance tools
- ❌ Trigger token minting
- ❌ View other users' private data

### Seller / Property Owner / Land Owner
- ❌ Access admin dashboard or compliance tools
- ❌ Trigger token minting (admin-only)
- ❌ Approve/reject other owners' listings
- ❌ Review KYC submissions
- ❌ Intervene in others' escrows
- ❌ View platform-wide transaction or user data

### Developer
- ❌ Create property or lease listings (can only apply for leases)
- ❌ Accept/reject offers
- ❌ Access admin or compliance tools
- ❌ Trigger token minting

### Legal Professional
- ❌ Create property or lease listings
- ❌ Invest or transact (unless also has INVESTOR role)
- ❌ Accept/reject lease applications
- ❌ Access admin dashboard (unless also has COMPLIANCE_OFFICER role)
- ❌ Mint tokens, manage escrows

### Financial Professional
- ❌ Create property or lease listings
- ❌ Accept/reject offers or applications
- ❌ Access admin or compliance tools
- ❌ Generate legal document summaries (unless Pro subscriber)

### Compliance Officer
- ❌ Invest in properties or create transactions
- ❌ Create property listings
- ❌ Release/refund escrow (admin-only)
- ❌ Manage users (role changes, suspensions — admin-only)
- ❌ Mint or burn tokens (admin-only)
- ❌ Modify audit logs (append-only, no role can edit or delete)
- ❌ Connect a personal wallet or hold tokens

### Admin
- ❌ Invest in properties (conflict of interest — enforced by policy, not by code)
- ❌ Self-remove own Admin role (lockout prevention)
- ❌ Delete or modify audit log records (append-only enforcement at DB level)

---

## 5. Implementation Reference

### 5.1 Middleware Pattern

```typescript
// src/lib/auth/rbac.ts

type Permission = {
  action: 'view' | 'create' | 'edit' | 'approve'
  resource: string
  ownership?: 'own' | 'any'
  requireKyc?: boolean
  requirePro?: boolean
}

// Role-to-permission mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  INVESTOR: [
    { action: 'view', resource: 'marketplace' },
    { action: 'view', resource: 'portfolio', ownership: 'own' },
    { action: 'create', resource: 'investment', requireKyc: true },
    { action: 'create', resource: 'watchlist' },
    { action: 'create', resource: 'beneficiary_designation', requireKyc: true, ownership: 'own' },
    { action: 'view', resource: 'ai_valuation_basic' },
    { action: 'view', resource: 'ai_valuation_full', requirePro: true },
    // ...
  ],
  OWNER: [
    { action: 'create', resource: 'property_listing', requireKyc: true },
    { action: 'edit', resource: 'property_listing', ownership: 'own' },
    { action: 'create', resource: 'lease_listing', requireKyc: true, ownership: 'own' },
    { action: 'approve', resource: 'lease_application', ownership: 'own' },
    { action: 'approve', resource: 'purchase_offer', ownership: 'own' },
    // ...
  ],
  ADMIN: [
    { action: 'view', resource: '*' },
    { action: 'create', resource: '*' },
    { action: 'edit', resource: '*' },
    { action: 'approve', resource: '*' },
  ],
  // ...
}
```

### 5.2 Route Protection

```typescript
// src/middleware.ts

const ROUTE_RULES: Record<string, { roles: string[], requireKyc?: boolean }> = {
  '/marketplace':        { roles: ['*'] },                           // Public
  '/portfolio':          { roles: ['INVESTOR', 'OWNER'] },
  '/listings/new':       { roles: ['OWNER'], requireKyc: true },
  '/inheritance':        { roles: ['INVESTOR', 'OWNER'] },
  '/leasing':            { roles: ['INVESTOR', 'OWNER'] },
  '/admin':              { roles: ['ADMIN'] },
  '/admin/compliance':   { roles: ['ADMIN', 'COMPLIANCE_OFFICER'] },
  '/admin/users':        { roles: ['ADMIN'] },
  '/settings':           { roles: ['*'] },                           // Any authenticated
}
```

### 5.3 UI Rendering

```tsx
// Component-level permission check
function PropertyActions({ property, user }: Props) {
  const canEdit = user.roles.includes('OWNER') && property.ownerId === user.id
  const canApprove = user.roles.includes('COMPLIANCE_OFFICER') || user.roles.includes('ADMIN')
  const canInvest = user.roles.includes('INVESTOR') && user.kycStatus === 'VERIFIED'

  return (
    <>
      {canInvest && <InvestButton propertyId={property.id} />}
      {canEdit && <EditButton propertyId={property.id} />}
      {canApprove && <ApproveButton propertyId={property.id} />}
    </>
  )
}
```

### 5.4 API-Level Enforcement

```typescript
// src/app/api/properties/route.ts
export async function POST(req: Request) {
  const session = await requireAuth(req)
  requireRole(session, ['OWNER', 'ADMIN'])
  requireKyc(session)

  const body = await req.json()
  const data = createPropertySchema.parse(body)

  // Resource-level: if not admin, ownerId must be current user
  if (!session.user.roles.includes('ADMIN')) {
    data.ownerId = session.user.id
  }

  const property = await propertyService.create(data, session.user.id)
  return NextResponse.json({ success: true, data: property })
}
```

---

## 6. Role Lifecycle

### 6.1 Self-Assignment
- During onboarding: INVESTOR, OWNER, PROFESSIONAL sub-types
- Post-onboarding: user can add INVESTOR or OWNER via Settings (additive only)

### 6.2 Admin-Assignment
- COMPLIANCE_OFFICER: Admin grants via user management
- ADMIN: existing Admin grants (2+ admins recommended for redundancy)

### 6.3 Role Revocation
- Admin can remove any non-ADMIN role from any user
- Admin cannot remove own ADMIN role (lockout prevention)
- All role changes logged to AuditLog with `changedBy`, `previousRoles`, `newRoles`

### 6.4 Suspension
- Suspended users retain roles but lose all permissions except viewing own profile
- Suspension is reversible by Admin only
- Suspension triggers: compliance violation, terms of service breach, admin discretion

---

*Document generated: March 7, 2026*  
*Platform: TIGI — Tokenized Intelligent Global Infrastructure*
