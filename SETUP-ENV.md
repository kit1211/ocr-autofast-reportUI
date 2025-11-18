# 🔧 Environment Variables Setup

## การตั้งค่า Environment Variables

Dashboard ใช้ environment variables เพื่อจัดการ configuration ต่างๆ

## 📝 ขั้นตอนการตั้งค่า

### 1. คัดลอกไฟล์ตัวอย่าง
```bash
# สำหรับ Windows
copy .env.example .env

# สำหรับ Linux/Mac
cp .env.example .env
```

### 2. แก้ไขค่าใน `.env`
เปิดไฟล์ `.env` และแก้ไขค่าตามต้องการ:

```env
# Database Configuration
DATABASE_URL='postgresql://username:password@host:port/database'

# API Server Configuration
API_PORT=3001

# Frontend Configuration
API_BASE_URL=http://localhost:3001
```

## 🔐 ตัวแปรที่ใช้

### DATABASE_URL (Required)
Connection string สำหรับ PostgreSQL database

**Format:**
```
postgresql://username:password@host:port/database
```

**ตัวอย่าง:**
```
DATABASE_URL='postgresql://dbmasteruser:mypassword@35.186.148.23:5432/ocrai'
```

**หมายเหตุ:** 
- ต้องใส่ single quotes ถ้า password มีอักขระพิเศษ เช่น `&`, `(`, `)`, `!`
- Database connection จะใช้ **READ-ONLY mode** เพื่อความปลอดภัย

### API_PORT (Optional)
Port ที่ Backend API Server จะทำงาน

**Default:** `3001`

**ตัวอย่าง:**
```
API_PORT=3001
```

### API_BASE_URL (Optional)
Base URL ของ Backend API สำหรับ Frontend

**Default:** `http://localhost:3001`

**ตัวอย่าง:**
```
# Development
API_BASE_URL=http://localhost:3001

# Production
API_BASE_URL=https://api.yourdomain.com
```

## 🚨 Security Best Practices

### 1. ไม่ commit `.env` เข้า Git
ไฟล์ `.env` ถูก ignore ใน `.gitignore` แล้ว

### 2. ใช้ `.env.example` เป็นเทมเพลต
เก็บโครงสร้างของ environment variables ไว้ใน `.env.example` (ไม่มีค่าจริง)

### 3. ใช้ค่าที่แตกต่างกันสำหรับแต่ละ environment
```bash
# Development
.env

# Production
.env.production

# Staging
.env.staging
```

### 4. Database Credentials
- ใช้ read-only user สำหรับ dashboard
- จำกัด IP ที่สามารถเชื่อมต่อได้
- ใช้ SSL/TLS สำหรับ production

## 🔄 การใช้งาน Environment ต่างๆ

### Development (Local)
```bash
# ใช้ .env ปกติ
bun run server
bun run dev
```

### Production
```bash
# ตั้งค่า environment variables ผ่าน system
export DATABASE_URL='postgresql://...'
export API_PORT=3001

# หรือใช้ไฟล์ .env.production
bun run server
bun run start
```

### Docker (ถ้าใช้)
```dockerfile
ENV DATABASE_URL='postgresql://...'
ENV API_PORT=3001
ENV API_BASE_URL=http://api:3001
```

## ✅ ตรวจสอบการตั้งค่า

### 1. ทดสอบ Database Connection
```bash
bun run server
```

ถ้าเชื่อมต่อสำเร็จจะเห็น:
```
🚀 API Server running at http://localhost:3001
📊 Endpoints available:
   - GET /api/health
   ...
```

### 2. ตรวจสอบ Health Endpoint
```bash
curl http://localhost:3001/api/health
```

ควรได้ response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "2025-11-17T..."
  }
}
```

## 🐛 Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
**สาเหตุ:** ไม่พบไฟล์ `.env` หรือไม่มีตัวแปร DATABASE_URL

**แก้ไข:**
1. ตรวจสอบว่ามีไฟล์ `.env` ในโฟลเดอร์ root
2. ตรวจสอบว่ามี `DATABASE_URL=...` ในไฟล์
3. Restart server

### Error: "Database connection failed"
**สาเหตุ:** ไม่สามารถเชื่อมต่อ database ได้

**แก้ไข:**
1. ตรวจสอบ DATABASE_URL ว่าถูกต้อง
2. ตรวจสอบว่า database server ทำงานอยู่
3. ตรวจสอบ firewall/network connectivity
4. ตรวจสอบ username/password

### Frontend ไม่เชื่อมต่อกับ Backend
**สาเหตุ:** API_BASE_URL ไม่ตรงกับ Backend

**แก้ไข:**
1. ตรวจสอบว่า Backend ทำงานที่ port ไหน
2. แก้ไข `API_BASE_URL` ใน `.env`
3. Restart frontend

## 📚 เพิ่มเติม

### Bun Auto-loads .env
Bun โหลด `.env` อัตโนมัติ ไม่ต้องใช้ `dotenv` package:
```typescript
// ไม่ต้องทำ
// require('dotenv').config()

// ใช้ได้เลย
const dbUrl = process.env.DATABASE_URL;
```

### ลำดับการโหลด
1. `.env.local` (ถ้ามี)
2. `.env.development` / `.env.production` (ตาม NODE_ENV)
3. `.env`

### การ Override ค่า
```bash
# Override ชั่วคราว
DATABASE_URL='postgresql://...' bun run server

# ตั้งค่าถาวรใน shell
export DATABASE_URL='postgresql://...'
bun run server
```

---

**อัพเดทล่าสุด:** November 17, 2025  
**สำหรับ:** Dashboard Analytics v1.0

