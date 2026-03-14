# WebWatch AI

每日新聞摘要 + 104 職缺監控，透過 Telegram Bot 推播通知。

- 每天早上 8 點自動抓取 RSS 新聞並推送摘要
- 每天下午 5 點掃描 104 職缺，有新職缺立即通知
- 支援關鍵字過濾、多城市、來源管理

## 技術架構

- **Frontend / Backend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Notification**: Telegram Bot API
- **Scheduler**: 外部排程（cron-job.org）

---

## 你還需要完成的步驟

### 1. 建立 Supabase 專案

1. 前往 [supabase.com](https://supabase.com) → 建立新專案
2. 進入 **SQL Editor**，貼上並執行 `supabase/migration.sql` 的全部內容
3. 記下以下三個值（在 Project Settings → API）：
   - `Project URL`
   - `anon public` key
   - `service_role` key（**保密，不要外露**）

### 2. 設定環境變數（本地）

```bash
cp .env.local.example .env.local
```

填入 Supabase 的值：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. 部署到 Vercel

1. 前往 [vercel.com](https://vercel.com) → Import Git Repository → 選這個 repo
2. 在 **Environment Variables** 填入上面三個變數（與 `.env.local` 相同）
3. Deploy

### 4. 設定 Telegram Bot

1. 在 Telegram 搜尋 **@BotFather** → 發送 `/newbot` → 取得 Bot Token
2. 開啟你的 Bot 對話，發送任意訊息（讓 Bot 知道你的 Chat ID）
3. 進入部署好的網站 → **設定頁面**
4. 填入 Bot Token → 點「驗證」→ 自動取得 Chat ID
5. 點「發送測試訊息」確認 Telegram 收到

### 5. 設定外部排程（cron-job.org）

1. 前往 [cron-job.org](https://cron-job.org)（免費）→ 註冊
2. 建立兩個排程任務：

| 任務 | URL | 時間（UTC） | 對應台灣時間 |
|------|-----|------------|------------|
| 新聞早報 | `POST https://你的域名/api/cron/news` | `0 0 * * *` | 早上 8:00 |
| 職缺掃描 | `POST https://你的域名/api/cron/jobs` | `0 9 * * *` | 下午 5:00 |

Method 選 **POST**，儲存即可

### 6. 設定新聞與職缺條件（在網站上操作）

- **新聞頁面**：開啟想訂閱的 RSS 來源，設定關注 / 排除關鍵字
- **職缺頁面**：填入搜尋關鍵字（如「產品經理」）、選擇城市

---

## 本地開發

```bash
npm install
cp .env.local.example .env.local  # 填入 Supabase 設定
npm run dev
```

## 手動觸發 API

```bash
# 手動執行新聞抓取
curl -X POST https://你的域名/api/cron/news

# 手動執行職缺掃描
curl -X POST https://你的域名/api/cron/jobs
```
