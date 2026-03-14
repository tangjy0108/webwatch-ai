"use client";
import { Briefcase, Plus, X, MapPin, Tag, DollarSign, Building2, Hash, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const cityOptions = [
  { value: "6001001000", label: "台北市" },
  { value: "6001002000", label: "新北市" },
  { value: "6001003000", label: "桃園市" },
  { value: "6001004000", label: "台中市" },
  { value: "6001007000", label: "台南市" },
  { value: "6001008000", label: "高雄市" },
];

const jobCategoryOptions = [
  { value: "product", label: "產品企劃" },
  { value: "engineer", label: "工程師" },
  { value: "data", label: "數據分析" },
  { value: "marketing", label: "行銷企劃" },
  { value: "design", label: "設計" },
  { value: "management", label: "專案管理" },
];

interface JobSettings {
  job_keywords: string[];
  job_cities: string[];
  job_categories: string[];
  job_min_salary: number;
  job_experience: string;
  job_exclude_companies: string[];
  job_notify_new_only: boolean;
  job_notify_salary_change: boolean;
  job_notify_removed: boolean;
}

export default function JobsPage() {
  const [settings, setSettings] = useState<JobSettings>({
    job_keywords: [], job_cities: [], job_categories: [],
    job_min_salary: 0, job_experience: "any",
    job_exclude_companies: [],
    job_notify_new_only: true, job_notify_salary_change: true, job_notify_removed: false,
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings) setSettings(s => ({ ...s, ...d.settings }));
    }).catch(() => {});
  }, []);

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (kw && !settings.job_keywords.includes(kw)) setSettings(s => ({ ...s, job_keywords: [...s.job_keywords, kw] }));
    setNewKeyword("");
  };

  const addCompany = () => {
    const c = newCompany.trim();
    if (c && !settings.job_exclude_companies.includes(c)) setSettings(s => ({ ...s, job_exclude_companies: [...s.job_exclude_companies, c] }));
    setNewCompany("");
  };

  const toggleCity = (val: string) => {
    const next = settings.job_cities.includes(val) ? settings.job_cities.filter(c => c !== val) : [...settings.job_cities, val];
    setSettings(s => ({ ...s, job_cities: next }));
  };

  const toggleCategory = (val: string) => {
    const next = settings.job_categories.includes(val) ? settings.job_categories.filter(c => c !== val) : [...settings.job_categories, val];
    setSettings(s => ({ ...s, job_categories: next }));
  };

  const saveSettings = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setSaving(false);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">職缺追蹤</h1>
          <p className="text-muted-foreground mt-1">設定 104 職缺搜尋條件，每天下午 5 點推播新增與變動職缺</p>
        </div>
        <Button className="rounded-xl" onClick={saveSettings} disabled={saving}>{saving ? "儲存中…" : "儲存設定"}</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Keywords */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />搜尋關鍵字</CardTitle>
              <CardDescription>104 職缺搜尋條件，多個關鍵字取聯集搜尋</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {settings.job_keywords.map(kw => (
                  <Badge key={kw} variant="secondary" className="bg-[#F0EFFF] text-[#7C6FF7] border-[#7C6FF7]/20 pr-1 gap-1">
                    <Hash className="w-3 h-3 opacity-60" />{kw}
                    <button onClick={() => setSettings(s => ({ ...s, job_keywords: s.job_keywords.filter(k => k !== kw) }))}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="新增關鍵字，Enter 確認" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && addKeyword()} className="rounded-xl border-border bg-white" />
                <Button variant="outline" className="rounded-xl" onClick={addKeyword}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>

          {/* City */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />工作地區</CardTitle>
              <CardDescription>可複選</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cityOptions.map(city => (
                  <button key={city.value} onClick={() => toggleCity(city.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${settings.job_cities.includes(city.value) ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}>
                    {city.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" />職務類別</CardTitle>
              <CardDescription>可複選</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobCategoryOptions.map(cat => (
                  <button key={cat.value} onClick={() => toggleCategory(cat.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${settings.job_categories.includes(cat.value) ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-white text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exclude Companies */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" />排除公司</CardTitle>
              <CardDescription>這些公司的職缺不會出現在通知中</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.job_exclude_companies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {settings.job_exclude_companies.map(c => (
                    <Badge key={c} variant="secondary" className="bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20 pr-1 gap-1">
                      {c}<button onClick={() => setSettings(s => ({ ...s, job_exclude_companies: s.job_exclude_companies.filter(x => x !== c) }))}><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input placeholder="公司名稱，Enter 確認" value={newCompany} onChange={e => setNewCompany(e.target.value)} onKeyDown={e => e.key === "Enter" && addCompany()} className="rounded-xl border-border bg-white" />
                <Button variant="outline" className="rounded-xl" onClick={addCompany}><Plus className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><DollarSign className="w-4 h-4 text-primary" />薪資條件</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>月薪下限</Label>
                <Select value={String(settings.job_min_salary)} onValueChange={v => setSettings(s => ({ ...s, job_min_salary: Number(v) }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">不限</SelectItem>
                    <SelectItem value="40000">40K 以上</SelectItem>
                    <SelectItem value="50000">50K 以上</SelectItem>
                    <SelectItem value="60000">60K 以上</SelectItem>
                    <SelectItem value="80000">80K 以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>工作年資</Label>
                <Select value={settings.job_experience} onValueChange={v => setSettings(s => ({ ...s, job_experience: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">不限</SelectItem>
                    <SelectItem value="1">1 年以下</SelectItem>
                    <SelectItem value="1-3">1–3 年</SelectItem>
                    <SelectItem value="3-5">3–5 年</SelectItem>
                    <SelectItem value="5+">5 年以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4 text-primary" />通知偏好</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "job_notify_new_only" as const, label: "只通知新職缺", desc: "過濾重複出現的職缺" },
                { key: "job_notify_salary_change" as const, label: "薪資變動通知", desc: "職缺薪資調整時推播" },
                { key: "job_notify_removed" as const, label: "下架職缺通知", desc: "追蹤的職缺下架時推播" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={settings[item.key]} onCheckedChange={v => setSettings(s => ({ ...s, [item.key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm border-dashed">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-foreground mb-2">推播格式預覽</p>
              <div className="text-xs text-muted-foreground font-mono bg-muted/40 rounded-lg p-3 space-y-1">
                <p className="font-semibold text-foreground">104 職缺更新｜17:00</p>
                <p>新增 <span className="text-[#059669] font-semibold">6</span> 筆符合條件</p>
                <p className="opacity-70">・AI PM｜A 公司｜台北</p>
                <p className="opacity-70">・產品經理｜B 公司｜60K+</p>
                <p className="mt-1">已下架 <span className="text-[#DC2626] font-semibold">2</span> 筆</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
