# ບຸນມີໄຊ ຂົນສົ່ງດ່ວນລາວຈີນ (Bounmixay) — ระบบติดตามพัสดุ

โปรเจกต์แบ่งเป็น 3 ส่วน:

- **`main-system/`** — ระบบหลัก (React + Ionic + Tailwind) สำหรับพนักงาน ใช้บนคอมพิวเตอร์ / แท็บเล็ต / iPad: เข้าสู่ระบบ, แดชบอร์ด, รับพัสดุ, ลูกค้า, รายงานการเงิน, สาขา
- **`mobile-app/`** — แอปมือถือ PWA (React + Ionic + Tailwind) สำหรับผู้บริหาร/หัวหน้าสาขา: สรุปยอดขาย, สถานะพัสดุแยกตามสาขา, สรุปการเงิน
- **`supabase/schema.sql`** — โครงสร้างฐานข้อมูล (ตาราง + Row Level Security) สำหรับรันบน Supabase project
- **`supabase/migrations/`** — สคริปต์ปรับโครงสร้างฐานข้อมูลที่ออกทีหลัง รันตามลำดับเลขไฟล์บนโปรเจกต์ที่เคยรัน `schema.sql` ไปแล้ว

ทั้งสองแอปเชื่อม Supabase ตัวเดียวกัน คนละ URL/deploy กันคนละแอป

**หมายเหตุสำคัญ:** ระบบนี้เป็นแบบ **"รับของจากจีนเข้าสาขา แล้วลูกค้ามารับเองที่สาขา"** ไม่ใช่ส่งถึงบ้าน — สถานะพัสดุจึงมีแค่ `pending_pickup` (ของค้าง รอลูกค้ามารับ), `picked_up` (ลูกค้ารับไปแล้ว), `returned` (ส่งกลับ) และมี `is_damaged` แยกต่างหากสำหรับของเสียหาย พร้อมช่อง `cost_amount` (ต้นทุน) คู่กับ `cod_amount` (ราคาขาย) เพื่อคำนวณกำไรที่ค้างอยู่กับของที่ยังไม่มีคนมารับ

## เริ่มต้นใช้งาน

### 1. สร้าง Supabase project

สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) แล้วเปิด **SQL Editor** รันไฟล์ [`supabase/schema.sql`](supabase/schema.sql) ทั้งไฟล์ครั้งเดียว — จะได้ตาราง `branches`, `profiles`, `customers`, `parcels`, `transactions` พร้อม RLS ที่แยกข้อมูลตามสาขา (staff เห็นแค่สาขาตัวเอง, admin เห็นทุกสาขา)

ถ้าเคยรัน `schema.sql` ไปแล้วก่อนหน้านี้ (โปรเจกต์ที่ใช้งานอยู่) ให้เปิด SQL Editor รันไฟล์ใน [`supabase/migrations/`](supabase/migrations) ตามลำดับเลขไฟล์เพิ่มเติมด้วย เพื่ออัปเดตโครงสร้างตารางให้ตรงกับโค้ดล่าสุด

จากนั้นคัดลอก **Project URL** และ **anon public key** จาก Settings → API

### 2. สร้างผู้ใช้และสาขาแรก

1. ใน Supabase → Authentication → Users → เพิ่มผู้ใช้ (อีเมล + รหัสผ่าน)
2. ใน SQL Editor เพิ่มสาขาแรก:
   ```sql
   insert into branches (name) values ('ສາຂານະຄອນຫຼວງວຽງຈັນ');
   ```
3. ผูกผู้ใช้ที่สร้างเข้ากับสาขาและกำหนดสิทธิ์ (แทน `<user-id>` และ `<branch-id>` ด้วยค่าจริงจากตาราง `auth.users` และ `branches`):
   ```sql
   insert into profiles (id, full_name, role, branch_id)
   values ('<user-id>', 'ชื่อพนักงาน', 'admin', '<branch-id>');
   ```
   ตั้ง `role` เป็น `'admin'` สำหรับผู้ที่ต้องเห็นทุกสาขา (เช่น ผู้บริหารที่ใช้แอปมือถือ) หรือ `'staff'` สำหรับพนักงานสาขาที่เห็นเฉพาะสาขาตัวเอง

### 3. ตั้งค่าและรันแต่ละแอป

```bash
cd main-system
cp .env.example .env   # แล้วกรอก VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

```bash
cd mobile-app
cp .env.example .env   # กรอกค่าเดียวกันกับ main-system
npm install
npm run dev
```

`main-system` รันที่ `http://localhost:5173` และ `mobile-app` ควรรันที่พอร์ตอื่น (ตั้ง `--port` ถ้ารันสองแอปพร้อมกัน)

### Build สำหรับใช้งานจริง

```bash
npm run build
```

ในแต่ละโฟลเดอร์แอป ได้ไฟล์สถิตในโฟลเดอร์ `dist/` นำไป deploy บน Vercel/Netlify หรือ static host ใดก็ได้ — `mobile-app` จะได้ service worker (PWA) มาด้วย ทำให้กด "เพิ่มไปที่หน้าจอหลัก" บนมือถือ/iPad ได้เหมือนแอปจริง
