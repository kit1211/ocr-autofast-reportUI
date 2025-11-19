# API Analytics Dashboard (Next.js 15 + Bun)

Dashboard สำหรับวิเคราะห์และติดตาม API request logs พร้อมระบบคำนวณต้นทุน OCR ที่ใช้ Next.js 15 App Router และ Bun runtime

## Features

- 📊 Dashboard แสดงสถิติ API requests แบบ real-time
- 📈 Charts และ graphs วิเคราะห์ performance
- 🔍 User agent analysis และ comparison
- 💰 OCR cost tracking (OpenRouter pricing)
- 📅 Date range selector (days หรือ custom range)
- 🚀 Built with Next.js 15 + Bun + TailwindCSS 4
- 🎨 UI components จาก shadcn/ui

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **Database**: PostgreSQL (via postgres.js)
- **Styling**: TailwindCSS 4
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## Prerequisites

- Bun >= 1.0
- PostgreSQL database
- Node.js >= 20.0 (สำหรับ compatibility)

## Installation

1. Clone repository:
```bash
git clone <repository-url>
cd dashboard-requestLog-aiOCR_v2
```

2. ติดตั้ง dependencies:
```bash
bun install
```

3. สร้าง `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. แก้ไข `.env.local` ใส่ค่า DATABASE_URL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

## Development

รัน development server:

```bash
bun run dev
```

เปิดบราวเซอร์ที่ [http://localhost:3000](http://localhost:3000)

## Production Build

Build สำหรับ production:

```bash
bun run build
```

รัน production server:

```bash
bun run start
```

## API Endpoints

Dashboard เชื่อมต่อกับ API endpoints ต่อไปนี้:

- `GET /api/health` - Health check
- `GET /api/overview` - สถิติภาพรวม
- `GET /api/endpoints` - วิเคราะห์ endpoints
- `GET /api/user-agents` - วิเคราะห์ user agents
- `GET /api/user-agents/compare` - เปรียบเทียบ user agents
- `GET /api/user-agents/routes` - routes ของ user agent
- `GET /api/errors` - สถิติ errors
- `GET /api/methods` - สถิติ HTTP methods
- `GET /api/ocr/summary` - สรุปค่าใช้จ่าย OCR
- `GET /api/ocr/user-agents` - ค่าใช้จ่าย OCR ตาม user agent
- `GET /api/ocr/paths` - ค่าใช้จ่าย OCR ตาม path

## Database Schema

โปรเจคต้องการ PostgreSQL tables:
- `RequestLog` - เก็บ API request logs
- `OcrResponse` - เก็บข้อมูล OCR responses และ token usage

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── cards/            # Metric cards
│   ├── charts/           # Chart components
│   ├── tables/           # Table components
│   ├── ocr/              # OCR-related components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── db.ts             # Database functions
│   ├── costs.ts          # OCR cost calculations
│   ├── utils.ts          # Helper functions
│   └── api-client.ts     # Client-side API calls
├── types/                 # TypeScript types
│   └── analytics.ts      # Type definitions
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## License

MIT

## Author

Built with ❤️ using Bun + Next.js 15

