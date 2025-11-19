# Changelog

## [2.0.0] - 2025-11-19

### แปลงเป็น Next.js 15

#### Added
- ✨ Next.js 15 App Router structure
- ✨ API Route Handlers (11 endpoints)
- ✨ Client-side API client library (`lib/api-client.ts`)
- ✨ TypeScript path aliases (@/lib, @/components, @/types)
- ✨ TailwindCSS 4 configuration
- ✨ Production build support
- ✨ README.md และ MIGRATION.md documentation
- ✨ .cursorrules สำหรับ development guidelines

#### Changed
- 🔄 โครงสร้างโปรเจคเป็น Next.js App Router
- 🔄 API endpoints จาก Bun.serve เป็น Next.js Route Handlers
- 🔄 React components เป็น Client Components ('use client')
- 🔄 Import paths เป็น @ alias
- 🔄 Styling configuration (TailwindCSS 4)
- 🔄 Package.json scripts สำหรับ Next.js + Bun

#### Fixed
- 🐛 TypeScript type errors ใน Recharts components
- 🐛 Import path conflicts
- 🐛 Client/Server component boundaries

#### Technical Details
- **Framework**: Next.js 15.5.6
- **Runtime**: Bun 1.3.0
- **React**: 19.0.0
- **TailwindCSS**: 4.1.11
- **Database**: PostgreSQL via postgres.js

#### Compatibility
- ✅ รักษา API endpoints ทั้งหมดเหมือนเดิม
- ✅ รักษา Database functions เหมือนเดิม
- ✅ รักษา UI Components เหมือนเดิม
- ✅ รักษา Dashboard features ทั้งหมด
- ✅ ใช้งานกับ Bun runtime ได้

---

## [1.0.0] - Before Migration

### Original React + Bun Version
- React 19 with Bun serve
- HTML imports
- Bun routes API
- PostgreSQL database
- Analytics Dashboard
- OCR cost tracking

