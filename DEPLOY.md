# Vercel Deployment Guide

## ขั้นตอนการ Deploy

### 1. Login เข้า Vercel

```bash
vercel login
```

เลือกวิธี login (แนะนำ GitHub)

### 2. ตั้งค่า Environment Variables

```bash
vercel env add DATABASE_URL production
```

ใส่ค่า PostgreSQL connection string จาก .env file

### 3. Deploy

#### Deploy แบบ Preview (ทดสอบ):
```bash
vercel
```

#### Deploy แบบ Production:
```bash
vercel --prod
```

### 4. ตรวจสอบ Deployment

หลังจาก deploy สำเร็จ Vercel จะแสดง URL ของเว็บไซต์

## สิ่งที่ต้องเตรียม

- ✅ Git repository: https://github.com/ChangPuakk/ocr-autofast-report.git
- ✅ Vercel account
- ✅ DATABASE_URL environment variable

## ไฟล์ที่สร้างไว้แล้ว

- ✅ `vercel.json` - Vercel configuration
- ✅ `api/` - Serverless Functions สำหรับ API routes
- ✅ `.vercelignore` - ไฟล์ที่ ignore ในการ deploy

## API Routes ที่พร้อมใช้งาน

- `/api/health`
- `/api/overview`
- `/api/endpoints`
- `/api/user-agents`
- `/api/errors`
- `/api/methods`
- `/api/user-agents/compare`
- `/api/user-agents/routes`
- `/api/ocr/summary`
- `/api/ocr/user-agents`
- `/api/ocr/paths`

## Troubleshooting

### ถ้า build ล้มเหลว:
1. ตรวจสอบว่า `bun run build` ทำงานได้ใน local
2. ตรวจสอบ environment variables ใน Vercel dashboard
3. ดู build logs ใน Vercel dashboard

### ถ้า API ไม่ทำงาน:
1. ตรวจสอบว่า DATABASE_URL ตั้งค่าถูกต้อง
2. ตรวจสอบว่า database อนุญาต connection จาก Vercel IP
3. ดู function logs ใน Vercel dashboard

