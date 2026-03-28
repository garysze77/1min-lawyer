# 1分鐘律師 - Project Specification

## Overview
- **Name**: 1分鐘律師 (1 Minute Lawyer)
- **Type**: Web App (Mobile-first PWA)
- **Concept**: AI-powered legal question triage with lawyer referral
- **Target Users**: Hong Kong residents with legal questions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js + Tailwind CSS + PWA |
| AI | MiniMax M2.7 (via Supabase Edge Function) |
| Forms | Resend |
| Database | Supabase |
| Hosting | Vercel |

## Database Schema

### Table: questions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| category | text | Major category |
| subcategory | text | Sub category |
| question_text | text | User's question |
| ai_response | text | AI analysis |
| created_at | timestamp | Creation time |

### Table: referrals
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_id | uuid | FK to questions |
| name | text | User name |
| contact | text | Email/Phone |
| preferred_lawyer | text | Lawyer choice |
| created_at | timestamp | Creation time |

## UI/UX Design

### Mobile-First
- Primary: Smartphone users
- PWA: Add to Home Screen support
- Responsive: Desktop fallback

### User Flow
1. Welcome screen → Select category
2. Select subcategory
3. Input question
4. AI analysis (loading state)
5. View analysis + recommendation
6. Optional: Request lawyer referral
7. Leave contact info
8. Thank you + feedback

## Legal Categories (6 Major)

| # | Category (EN) | Category (ZH) |
|---|---------------|---------------|
| 1 | Family | 婚姻家庭 |
| 2 | Property | 樓宇地產 |
| 3 | Employment | 僱傭勞工 |
| 4 | Commercial | 商業貿易 |
| 5 | Personal Injury | 個人傷亡 |
| 6 | Criminal | 刑事罪行 |

### Subcategories

#### Family (婚姻家庭)
- 結婚/同居
- 離婚/分居
- 子女監護
- 遺產/遺囑

#### Property (樓宇地產)
- 樓宇買賣
- 租賃糾紛
- 釐印問題
- 大廈管理

#### Employment (僱傭勞工)
- 解僱/賠償
- 合約條款
- 工傷意外
- 強積金

#### Commercial (商業貿易)
- 商業合約
- 債項追討
- 公司註冊
- 知識產權

#### Personal Injury (個人傷亡)
- 交通意外
- 醫療疏忽
- 工傷索償
- 其他意外

#### Criminal (刑事罪行)
- 被捕/保釋
- 毆打/傷人
- 盜竊
- 其他刑事

## AI Response Format

```json
{
  "analysis": "分析用戶情況",
  "relevant_laws": ["香港《公安條例》第245條"],
  "possible_outcomes": "可能結果",
  "recommendation": "建議下一步",
  "disclaimer": "此為AI分析，不構成法律意見"
}
```

## Lawyers (for Referral)

| Lawyer | Specialization | Contact |
|--------|---------------|---------|
| Katrina Kwan | 上市公司監管調查 | TBC |
| Kelly Ho | 婚禮、樓宇、遺產 | TBC |
| Mike Kwok | 大灣區、商務、CFA | TBC |

## Disclaimer

**Important Notice:**
This AI analysis is for reference only and does not constitute legal advice. For professional legal services, please contact a qualified lawyer.

---

*Created by GSwitch for Gary*
