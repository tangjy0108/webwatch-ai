# WebWatch AI

每日新聞摘要 + 104 職缺監控，透過 Telegram Bot 推播通知。

- RSS 新聞抓取、關鍵字過濾、摘要推播
- OpenAI-compatible AI digest 產生器，可把當日新聞整理成免費版摘要
- 104 職缺掃描、薪資門檻 / 類別 / 年資 / 排除公司過濾
- 追蹤新職缺、薪資變動、下架職缺
- 設定儲存在 Supabase，排程由外部 cron 觸發

## 技術架構

- Frontend / Backend: Next.js 15 (App Router)
- Database: Supabase (PostgreSQL)
- Deployment: Vercel
- Notification: Telegram Bot API
- Scheduler: cron-job.org 或其他外部 scheduler

## 需要的環境變數

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxx
# 舊命名也支援，但較不建議
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
CRON_SECRET=你自訂的一長串隨機字串

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
# 可選：若不想存在資料庫，也可以直接放 env
TELEGRAM_CHAT_ID=123456789

# Gemini
GEMINI_API_KEY=你的_google_ai_studio_api_key
# 可選：未設定時預設會用 Gemini OpenAI compatibility endpoint
NEWS_AI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
# 可選：未設定時預設使用 gemini-2.5-flash
NEWS_AI_MODEL=gemini-2.5-flash
```

說明：
- `SUPABASE_SECRET_KEY` 只用在 server side，不要暴露到前端。
- 如果你目前手上只有舊的 `service_role` JWT key，也可以先放到 `SUPABASE_SERVICE_ROLE_KEY`。
- `CRON_SECRET` 會保護 `/api/cron/news` 和 `/api/cron/jobs`，手動執行頁面不需要它。
- `TELEGRAM_BOT_TOKEN` 和 `GEMINI_API_KEY` 都屬於 secret，請放在 Vercel env，不要放在站內設定頁。
- AI digest 目前走 Gemini 的 OpenAI compatibility 介面。

## Supabase 初始化 / 升級

1. 到 Supabase 建 project
2. 打開 SQL Editor
3. 執行 [supabase/migration.sql](./supabase/migration.sql)

這份 migration 可以重跑，會補齊新欄位：
- `news_summary_length`
- `news_weekend`
- `job_experience`
- `job_exclude_companies`
- `job_notify_salary_change`
- `job_notify_removed`
- `jobs_weekend`
- `job_items.description`
- `job_items.salary_low`
- `job_items.salary_high`
- `job_items.category_tags`
- `job_items.experience_bucket`
- `job_items.removed_at`

## 本地開發

```bash
npm install
npm run dev
```

## 部署到 Vercel

1. Import Git Repository
2. 在 Vercel `Environment Variables` 填入上面的 Supabase / Cron / Telegram / Gemini 變數
3. Deploy

## 站內設定流程

1. 先在 Vercel 設好 `TELEGRAM_BOT_TOKEN` 與 `GEMINI_API_KEY`
2. 到「設定」頁點「自動取得」取得 Chat ID
3. 點「驗證」確認 Telegram 通知路徑可用
4. 點「發送測試訊息」確認 Telegram 收得到
5. 到「新聞設定」開啟 RSS 來源並設定關鍵字
6. 到「設定」頁調整 AI Digest 的 Base URL / Model / Prompt / Temperature
7. 到「職缺追蹤」設定關鍵字、城市、薪資 / 類別 / 年資等條件

## 排程設定

### 新聞抓取

- URL: `POST https://你的域名/api/cron/news`
- Header: `Authorization: Bearer <CRON_SECRET>`

### 職缺掃描

- URL: `POST https://你的域名/api/cron/jobs`
- Header: `Authorization: Bearer <CRON_SECRET>`

台灣時間範例：
- 新聞：每天早上 8:00
- 職缺：每天傍晚 5:00

如果你用 cron-job.org，除了 Method 選 `POST`，也記得把 `Authorization` header 一起加上。

## 目前 flow

### 新聞

1. 前台設定儲存到 `settings` / `news_sources`
2. 外部 cron 觸發 `/api/cron/news`
3. 後端抓 RSS、做關鍵字過濾、和 `news_items` 去重
4. 新聞寫入 Supabase
5. 如果已啟用 AI Digest，會使用 `GEMINI_API_KEY` 把今日候選新聞送到模型並寫入 `news_digests`
6. 如果 Telegram 已設定且 `notify_news=true`，就送摘要並記一筆 `notification_logs`

### 職缺

1. 前台設定儲存到 `settings`
2. 外部 cron 觸發 `/api/cron/jobs`
3. 後端抓 104、套用城市 / 類別 / 最低薪資 / 年資 / 排除公司過濾
4. 寫入 / 更新 `job_items`
5. 比對新職缺、薪資變動、下架職缺
6. 如果 Telegram 已設定且 `notify_jobs=true`，就送通知並記一筆 `notification_logs`

## 手動測試 API

```bash
curl -X POST https://你的域名/api/news/run
curl -X POST https://你的域名/api/jobs/run
curl -X POST https://你的域名/api/test-notify
```

手動執行 API 會直接跑 job，不需要 `CRON_SECRET`。
