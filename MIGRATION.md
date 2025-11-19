# การแปลงโปรเจคจาก React ไป Next.js 15

## สรุปการแปลง

โปรเจคนี้ได้รับการแปลงจาก React app ที่ใช้ Bun serve กับ HTML imports มาเป็น **Next.js 15** (App Router) โดยรักษาความสามารถทั้งหมดของ API และ Dashboard เดิมไว้

## การเปลี่ยนแปลงหลัก

### 1. โครงสร้างโปรเจค

#### เดิม (React + Bun serve):
```
src/
├── index.tsx          # Entry point
├── server.ts          # Bun.serve with routes
├── index.html         # HTML with script imports
├── components/        # React components
├── lib/              # Utilities และ DB functions
└── types/            # TypeScript types
```

#### ใหม่ (Next.js 15):
```
app/
├── api/              # API Route Handlers
│   ├── health/
│   ├── overview/
│   ├── endpoints/
│   ├── user-agents/
│   ├── errors/
│   ├── methods/
│   └── ocr/
├── layout.tsx        # Root layout
├── page.tsx          # Home page
└── globals.css       # Global styles

components/           # React Client Components
lib/                  # Utilities และ DB functions
types/                # TypeScript types
```

### 2. API Routes

เดิมใช้ `Bun.serve()` กับ routes object:
```typescript
Bun.serve({
  routes: {
    "/api/health": { GET: handler },
    "/api/overview": { GET: handler },
    // ...
  }
})
```

ใหม่ใช้ Next.js Route Handlers:
```typescript
// app/api/health/route.ts
export async function GET() {
  // handler logic
}
```

### 3. React Components

เพิ่ม `'use client'` directive ให้กับทุก component ที่ใช้:
- `useState`
- `useEffect`
- `useMemo`
- React hooks อื่นๆ

เปลี่ยน import paths จาก relative เป็น alias:
```typescript
// เดิม
import { formatNumber } from '../lib/utils';
import type { DateRange } from '../types/analytics';

// ใหม่
import { formatNumber } from '@/lib/utils';
import type { DateRange } from '@/types/analytics';
```

### 4. Database & API Client

**lib/db.ts**: ยังคงใช้ `postgres.js` เหมือนเดิม (Server-side only)

**lib/api-client.ts**: สร้างใหม่สำหรับ client-side API calls
```typescript
// Client components ใช้ api-client.ts
import { fetchOverview } from '@/lib/api-client';

// API routes ใช้ db.ts โดยตรง
import { getOverviewStats } from '@/lib/db';
```

### 5. Styling

- ใช้ **TailwindCSS 4** (เวอร์ชันล่าสุด)
- `app/globals.css` สำหรับ global styles
- `tailwind.config.ts` สำหรับ Tailwind configuration

### 6. Environment Variables

เดิม: `.env` (Bun auto-load)  
ใหม่: `.env.local` (Next.js convention)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## API Endpoints (เหมือนเดิม)

ทั้งหมด 11 endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/overview` | สถิติภาพรวม |
| GET | `/api/endpoints` | วิเคราะห์ endpoints |
| GET | `/api/user-agents` | วิเคราะห์ user agents |
| GET | `/api/user-agents/compare` | เปรียบเทียบ user agents |
| GET | `/api/user-agents/routes` | Routes ของ user agent |
| GET | `/api/errors` | สถิติ errors |
| GET | `/api/methods` | สถิติ HTTP methods |
| GET | `/api/ocr/summary` | สรุปค่าใช้จ่าย OCR |
| GET | `/api/ocr/user-agents` | ค่าใช้จ่าย OCR ตาม user agent |
| GET | `/api/ocr/paths` | ค่าใช้จ่าย OCR ตาม path |

## การใช้งาน

### Development
```bash
bun run dev
```
เปิดที่ http://localhost:3000

### Production Build
```bash
bun run build
```

### Production Run
```bash
bun run start
```

## ข้อดีของการแปลงเป็น Next.js

1. **App Router**: Modern routing system กับ Server/Client Components
2. **API Routes**: Built-in API handling ไม่ต้องจัดการ server เอง
3. **TypeScript**: Better type checking กับ Next.js 15
4. **SEO**: Server-side rendering support
5. **Production Ready**: Optimized build และ deployment
6. **Ecosystem**: ใช้ได้กับ Vercel, AWS, Docker ได้ง่าย

## ความเข้ากันได้

- ✅ ใช้ **Bun** เป็น runtime ได้
- ✅ Database functions เหมือนเดิม 100%
- ✅ UI Components เหมือนเดิมทุกอย่าง
- ✅ API response format เหมือนเดิม
- ✅ Dashboard features ครบทุกอย่าง

## Notes

- ไฟล์ใน `src/` เดิมยังคงอยู่ (สำหรับอ้างอิง)
- สามารถลบ `src/server.ts`, `src/index.tsx` ได้หลังจาก verify แล้ว
- Next.js 15 ใช้ React 19 (latest)
- Build output อยู่ใน `.next/` folder

## ปัญหาที่แก้ไข

1. **TypeScript Errors**: แก้ไข type issues ใน Recharts components
2. **Import Paths**: แปลงเป็น @ alias ทั้งหมด
3. **Client Components**: เพิ่ม 'use client' ให้ components ที่ใช้ hooks
4. **API Routing**: แยก API routes เป็นไฟล์แยกตาม Next.js convention

## การ Deploy

### Vercel (แนะนำ)
```bash
vercel deploy
```

### Docker
```bash
# Build
docker build -t dashboard-app .

# Run
docker run -p 3000:3000 dashboard-app
```

### PM2
```bash
pm2 start "bun run start" --name dashboard
```

---

**Migration Date**: 2025-11-19  
**Next.js Version**: 15.5.6  
**Bun Version**: 1.3.0  
**React Version**: 19.0.0

