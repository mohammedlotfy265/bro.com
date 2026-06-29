# دليل رفع البرنامج على Vercel

## الخطوات بالترتيب:

### 1. اعمل حساب على Neon (قاعدة بيانات PostgreSQL مجانية)
- روح على https://neon.tech
- اعمل Sign Up (تقدر بـ GitHub)
- اعمل New Project → خد الـ Connection String
- هتلاقي حاجة شكلها كده:
  ```
  postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
  ```
- انسخها عندك

### 2. ارفع الكود على GitHub
```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/USERNAME/delivery-pro.git
git push -u origin main
```

### 3. اعمل Deploy على Vercel
- روح على https://vercel.com
- اعمل Sign In بـ GitHub
- اضغط "New Project"
- اختار الـ repo بتاعك
- في صفحة Settings:
  - **Framework Preset:** Next.js (هيتكشف تلقائياً)
  - **Build Command:** هيستخدم اللي في package.json تلقائياً
  - **Install Command:** bun install
- في قسم **Environment Variables** ضيف:
  - `DATABASE_URL` = (الـ connection string اللي نسخته من Neon)
  - `JWT_SECRET` = `delivery-pro-jwt-secret-key-change-in-production-2024`
- اضغط **Deploy**

### 4. استنى الـ Build يخلص (2-3 دقايق)

### 5. بعد ما الـ Deploy يخلص:
- افتح اللينك اللي Vercel هيديك (هيبقى زي `https://delivery-pro-xxx.vercel.app`)
- أول مرة تفتحها، الـ database هتكون فاضية
- عشان تضيف البيانات الأولية (أدمن، شوب، دليفري):
  - ادخل على اللينك ده في المتصفح:
    ```
    https://YOUR-APP.vercel.app/api/seed
    ```
    (استخدم POST request - تقدر بـ curl أو Postman)
  - أو بـ curl:
    ```bash
    curl -X POST https://YOUR-APP.vercel.app/api/seed
    ```
  - هتلاقي رسالة: "تم إنشاء البيانات الأولية بنجاح"

### 6. بيانات الدخول:
- **أدمن:** 01000000000 / admin123
- **شوب:** 01100000000 / shop123
- **دليفري:** 01200000000 / driver123

### 7. ظبط إعدادات التحويل:
- ادخل كأدمن
- روح على "إعدادات التحويل" في السايدبار
- غيّر أرقام فودافون كاش / إنستاباي / أورنج كاش بأرقامك الحقيقية
- اضغط "حفظ التغييرات"

## ملاحظات مهمة:

✅ **الـ Script بتاعنا ذكي:** بيكتشف تلقائياً لو الـ DATABASE_URL هو PostgreSQL (على Vercel) أو SQLite (محلياً) ويظبط الـ Prisma provider صح.

✅ **Neon مجاني:** تقدر تستخدم النسخة المجانية من Neon لحد 0.5 GB بيانات (أكتر من كافي للتطبيق ده).

✅ **Vercel مجاني:** النسخة المجانية كافية جداً للتطبيق ده.

❌ **مش هتقدر تستخدم SQLite على Vercel** لأن Vercel serverless ومفيش filesystem دايم - عشان كده بنستخدم Neon.

❌ **الـ database اللي هنا محلياً (SQLite) مش هينقل لـ Vercel** - هتبدأ بـ database فاضية على Neon وتملاها بـ /api/seed.

## لو فيه مشاكل:

- **Build failed:** اتأكد إن `DATABASE_URL` مضبوط في Environment Variables على Vercel
- **Database error:** اتأكد إن Neon project شغال وإن الـ connection string صحيح
- **Prisma error:** ممكن تحتاج تعمل `prisma db push` يدوياً - تقدر تضيف build command:
  ```
  bash scripts/switch-db-provider.sh && prisma db push && next build
  ```
