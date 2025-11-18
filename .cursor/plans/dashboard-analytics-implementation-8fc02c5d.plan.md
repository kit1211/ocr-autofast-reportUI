<!-- 8fc02c5d-af02-45d3-a5b4-dd35abe1d262 558ea237-e190-44e0-b14d-01aeb82925a4 -->
# User Agent Comparison Feature Implementation Plan

## Overview

เพิ่มส่วนเปรียบเทียบ User Agent ที่สามารถเลือก User Agent หลักมาเปรียบเทียบกับตัวอื่นๆ พร้อมแสดงผลเป็น Bar Chart, Pie Chart และ Comparison Table

## 1. Backend API Enhancement

### 1.1 เพิ่ม API Endpoint สำหรับเปรียบเทียบ

สร้าง endpoint ใหม่: `GET /api/user-agents/compare`

**Parameters:**

- `days` หรือ `startDate` + `endDate` - ช่วงเวลา
- `primaryAgent` - User Agent หลักที่ต้องการเปรียบเทียบ
- `groupOthers` - Boolean (true = รวม Others, false = แสดงแยก)
- `limit` - จำนวน User Agent อื่นที่จะแสดง (default: 10)

**Response Structure:**

```typescript
{
  primary: {
    userAgent: string,
    totalRequests: number,
    successCount: number,
    errorCount: number,
    successRate: number,
    errorRate: number,
    avgResponseTime: number
  },
  others: [
    {
      userAgent: string,
      totalRequests: number,
      successCount: number,
      errorCount: number,
      successRate: number,
      errorRate: number,
      avgResponseTime: number
    }
  ],
  summary: {
    primaryPercentage: number,
    othersPercentage: number
  }
}
```

### 1.2 สร้าง Database Query Function

ไฟล์: `src/lib/db.ts`

สร้าง `getUserAgentComparison()` function:

- Query ข้อมูล User Agent ที่เลือก (primary)
- Query ข้อมูล User Agent อื่นๆ
- คำนวณ success rate, error rate, avg response time
- รองรับการรวม/แยก User Agent อื่นๆ

## 2. Frontend Types

### 2.1 เพิ่ม Types

ไฟล์: `src/types/analytics.ts`

```typescript
interface UserAgentComparison {
  primary: UserAgentMetrics;
  others: UserAgentMetrics[];
  summary: {
    primaryPercentage: number;
    othersPercentage: number;
  };
}

interface UserAgentMetrics {
  userAgent: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  errorRate: number;
  avgResponseTime: number;
}
```

## 3. API Client

### 3.1 เพิ่ม Function

ไฟล์: `src/lib/api.ts`

สร้าง `fetchUserAgentComparison()`:

- รับ parameters: range, primaryAgent, groupOthers, limit
- เรียก `/api/user-agents/compare`
- Return typed response

## 4. UI Components

### 4.1 User Agent Selector Component

ไฟล์: `src/components/UserAgentSelector.tsx`

**Features:**

- Dropdown เลือก User Agent (ดึงจาก current user agent list)
- Toggle switch: "รวม User Agent อื่นๆ" / "แสดงแยกรายตัว"
- Slider/Input: จำนวน User Agent ที่จะแสดง (ถ้าเลือกแยก)
- ปุ่ม "เปรียบเทียบ"

### 4.2 Comparison Bar Chart

ไฟล์: `src/components/charts/UserAgentComparisonBarChart.tsx`

**แสดง:**

- แกน X: User Agent names
- แกน Y: จำนวน requests
- Bar สี: แยกตาม success/error
- Tooltip: แสดงรายละเอียดครบ

### 4.3 Comparison Pie Chart

ไฟล์: `src/components/charts/UserAgentComparisonPieChart.tsx`

**แสดง:**

- สัดส่วน requests ระหว่าง Primary vs Others
- Label: แสดง percentage
- Colors: สีต่างกันสำหรับ Primary และ Others/Each Agent

### 4.4 Comparison Table

ไฟล์: `src/components/tables/UserAgentComparisonTable.tsx`

**Columns:**

1. User Agent
2. Total Requests
3. Success Count (%)
4. Error Count (%)
5. Success Rate
6. Error Rate
7. Avg Response Time

**Features:**

- Highlight row ของ Primary Agent
- Sortable columns
- Color coding สำหรับ rates

### 4.5 Comparison Section Container

ไฟล์: `src/components/UserAgentComparison.tsx`

**Layout:**

```
[User Agent Selector]
[Bar Chart] [Pie Chart]
[Comparison Table]
```

**State Management:**

- Selected user agent
- Group others toggle
- Limit value
- Loading state
- Comparison data

## 5. Integration with Dashboard

### 5.1 เพิ่มใน Dashboard

ไฟล์: `src/components/Dashboard.tsx`

**ตำแหน่ง:** เพิ่มก่อน `<UserAgentTable>`

```jsx
<UserAgentComparison
  dateRange={dateRange}
  availableUserAgents={userAgentData}
  loading={loading}
/>
```

## 6. Styling & UX

### 6.1 Responsive Design

- Grid layout สำหรับ charts (2 columns desktop, 1 column mobile)
- Collapsible section (เปิด/ปิดได้)
- Loading skeletons

### 6.2 Colors

- Primary Agent: สีน้ำเงิน (#3b82f6)
- Others (grouped): สีเทา (#6b7280)
- Success: สีเขียว (#22c55e)
- Error: สีแดง (#ef4444)

### 6.3 Labels ภาษาไทย

- "เปรียบเทียบ User Agent"
- "User Agent หลัก"
- "รวม User Agent อื่นๆ"
- "แสดงแยกรายตัว"
- "จำนวน User Agent ที่แสดง"

## 7. Testing Considerations

- ทดสอบกับ User Agent ที่มีจำนวนน้อย (< 5)
- ทดสอบกับ User Agent ที่มีจำนวนมาก (> 20)
- ทดสอบ toggle รวม/แยก
- ทดสอบการเปลี่ยน date range
- ทดสอบ responsive design

## Implementation Order

1. Backend API + Database query
2. Types + API client
3. User Agent Selector
4. Charts components (Bar, Pie)
5. Comparison Table
6. Container component
7. Dashboard integration
8. Styling & Polish

### To-dos

- [ ] ติดตั้ง postgres และ recharts ด้วย bun
- [ ] สร้าง TypeScript types สำหรับ analytics data
- [ ] สร้าง database module พร้อม connection และ query functions
- [ ] สร้าง Backend API server ด้วย Bun.serve
- [ ] สร้าง Frontend API client สำหรับเรียก backend
- [ ] สร้าง 5 overview cards components
- [ ] สร้าง charts components ด้วย recharts
- [ ] สร้าง tables components สำหรับ endpoint และ user agent analysis
- [ ] สร้าง DateRangeSelector component
- [ ] สร้าง main Dashboard component ที่รวมทุกอย่างเข้าด้วยกัน
- [ ] Integrate Dashboard เข้ากับ App.tsx และอัพเดท package.json scripts
- [ ] ทดสอบการทำงานของ dashboard และแก้ไข bugs (ถ้ามี)
- [ ] สร้าง API endpoint /api/user-agents/compare และ database query function
- [ ] เพิ่ม TypeScript types สำหรับ User Agent Comparison
- [ ] เพิ่ม fetchUserAgentComparison() ใน api.ts
- [ ] สร้าง UserAgentSelector component พร้อม dropdown และ toggle
- [ ] สร้าง UserAgentComparisonBarChart component
- [ ] สร้าง UserAgentComparisonPieChart component
- [ ] สร้าง UserAgentComparisonTable component
- [ ] สร้าง UserAgentComparison container component รวมทุกอย่าง
- [ ] Integrate UserAgentComparison เข้ากับ Dashboard
- [ ] ปรับแต่ง styling, responsive design และ UX