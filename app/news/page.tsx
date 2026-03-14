"use client";
import {
  Newspaper, Plus, X, Globe, Tag, AlignLeft, Hash, Pencil, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface NewsSource { id: number; name: string; url: string; feed_url: string; enabled: boolean; }
interface EditingSource { id: number; name: string; url: string; feed_url: string; }
interface Settings {
  news_include_keywords: string[];
  news_exclude_keywords: string[];
  news_max_items: number;
  news_summary_length: string;
  news_weekend: boolean;
  news_daily_observation: boolean;
}

export default function NewsPage() {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [settings, setSettings] = useState<Settings>({
    news_include_keywords: [], news_exclude_keywords: [],
    news_max_items: 5, news_summary_length: "medium",
    news_weekend: false, news_daily_observation: true,
  });
  const [newInclude, setNewInclude] = useState("");
  const [newExclude, setNewExclude] = useState("");
  const [newSource, setNewSource] = useState({ name: "", url: "", feed_url: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<EditingSource | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/sources").then(r => r.json()).then(d => setSources(d.sources || [])).catch(() => {});
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.settings) setSettings(s => ({ ...s, ...d.settings }));
    }).catch(() => {});
  }, []);

  const toggleSource = async (id: number) => {
    const src = sources.find(s => s.id === id);
    if (!src) return;
    const updated = sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSources(updated);
    await fetch(`/api/sources/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: !src.enabled }) });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSources(sources.map(s => s.id === editing.id ? { ...s, ...editing } : s));
    await fetch(`/api/sources/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editing.name, url: editing.url, feed_url: editing.feed_url }) });
    setEditing(null);
  };

  const removeSource = async (id: number) => {
    setSources(sources.filter(s => s.id !== id));
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
  };

  const addSource = async () => {
    if (!newSource.name || !newSource.url) return;
    const res = await fetch("/api/sources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSource) });
    const d = await res.json();
    if (d.source) setSources([...sources, d.source]);
    setNewSource({ name: "", url: "", feed_url: "" });
    setShowAdd(false);
  };

  const addKeyword = (type: "include" | "exclude", val: string) => {
    const kw = val.trim();
    if (!kw) return;
    const key = type === "include" ? "news_include_keywords" : "news_exclude_keywords";
    if (!settings[key].includes(kw)) setSettings(s => ({ ...s, [key]: [...s[key], kw] }));
  };

  const removeKeyword = (type: "include" | "exclude", kw: string) => {
    const key = type === "include" ? "news_include_keywords" : "news_exclude_keywords";
    setSettings(s => ({ ...s, [key]: s[key].filter((k: string) => k !== kw) }));
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
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">新聞設定</h1>
          <p className="text-muted-foreground mt-1">設定新聞來源與關鍵字，每天早上 8 點自動抓取並推播摘要</p>
        </div>
        <Button className="rounded-xl" onClick={saveSettings} disabled={saving}>
          {saving ? "儲存中…" : "儲存設定"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sources */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />新聞來源</CardTitle>
                  <CardDescription className="mt-1">開啟的來源才會被抓取。每個來源填入 RSS Feed URL。</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowAdd(!showAdd)}>
                  <Plus className="w-4 h-4 mr-1" />新增
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAdd && (
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">名稱</Label><Input placeholder="e.g. 36Kr" value={newSource.name} onChange={e => setNewSource(s => ({ ...s, name: e.target.value }))} className="rounded-xl h-9" /></div>
                    <div className="space-y-1"><Label className="text-xs">網域</Label><Input placeholder="e.g. 36kr.com" value={newSource.url} onChange={e => setNewSource(s => ({ ...s, url: e.target.value }))} className="rounded-xl h-9" /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">RSS Feed URL</Label><Input placeholder="https://36kr.com/feed" value={newSource.feed_url} onChange={e => setNewSource(s => ({ ...s, feed_url: e.target.value }))} className="rounded-xl h-9" /></div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl" onClick={addSource}>新增來源</Button>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowAdd(false)}>取消</Button>
                  </div>
                </div>
              )}
              {sources.map((source) => (
                <div key={source.id} className="p-3 rounded-xl border border-border/50 bg-muted/20">
                  {editing?.id === source.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={editing.name} onChange={e => setEditing(s => s ? { ...s, name: e.target.value } : s)} className="rounded-xl h-8 text-sm" placeholder="名稱" />
                        <Input value={editing.url} onChange={e => setEditing(s => s ? { ...s, url: e.target.value } : s)} className="rounded-xl h-8 text-sm" placeholder="網域" />
                      </div>
                      <Input value={editing.feed_url} onChange={e => setEditing(s => s ? { ...s, feed_url: e.target.value } : s)} className="rounded-xl h-8 text-sm" placeholder="RSS Feed URL" />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-xl h-7 text-xs" onClick={saveEdit}><Check className="w-3 h-3 mr-1" />儲存</Button>
                        <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs" onClick={() => setEditing(null)}>取消</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${source.enabled ? "bg-[#F0EFFF]" : "bg-muted"}`}>
                          <Newspaper className={`w-4 h-4 ${source.enabled ? "text-[#7C6FF7]" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.feed_url || source.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch checked={source.enabled} onCheckedChange={() => toggleSource(source.id)} />
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => setEditing({ id: source.id, name: source.name, url: source.url, feed_url: source.feed_url })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeSource(source.id)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="w-5 h-5 text-primary" />關鍵字設定</CardTitle>
              <CardDescription>包含關鍵字的新聞優先推播；排除關鍵字的新聞直接過濾</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {(["include", "exclude"] as const).map(type => {
                const isInclude = type === "include";
                const keywords = isInclude ? settings.news_include_keywords : settings.news_exclude_keywords;
                const [inputVal, setInputVal] = [isInclude ? newInclude : newExclude, isInclude ? setNewInclude : setNewExclude];
                return (
                  <div key={type} className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      {isInclude ? <Hash className="w-3.5 h-3.5 text-[#7C6FF7]" /> : <X className="w-3.5 h-3.5 text-[#DC2626]" />}
                      {isInclude ? "關注關鍵字" : "排除關鍵字"}
                    </Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {keywords.map(kw => (
                        <Badge key={kw} variant="secondary" className={`pr-1 gap-1 ${isInclude ? "bg-[#F0EFFF] text-[#7C6FF7] border-[#7C6FF7]/20" : "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20"}`}>
                          {kw}
                          <button onClick={() => removeKeyword(type, kw)}><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder={`新增${isInclude ? "關鍵字" : "排除詞"}，Enter 確認`} value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { addKeyword(type, inputVal); setInputVal(""); } }} className="rounded-xl border-border bg-white" />
                      <Button variant="outline" className="rounded-xl" onClick={() => { addKeyword(type, inputVal); setInputVal(""); }}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlignLeft className="w-4 h-4 text-primary" />推播偏好</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>每日最多推送</Label>
                <Select value={String(settings.news_max_items)} onValueChange={v => setSettings(s => ({ ...s, news_max_items: Number(v) }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["3", "5", "10", "0"].map(v => <SelectItem key={v} value={v}>{v === "0" ? "不限" : `${v} 則`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>摘要長度</Label>
                <Select value={settings.news_summary_length} onValueChange={v => setSettings(s => ({ ...s, news_summary_length: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">簡短（1-2 句）</SelectItem>
                    <SelectItem value="medium">適中（3-4 句）</SelectItem>
                    <SelectItem value="long">詳細（一段）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div><p className="text-sm font-medium text-foreground">假日也推播</p><p className="text-xs text-muted-foreground">週六、週日照常執行</p></div>
                <Switch checked={settings.news_weekend} onCheckedChange={v => setSettings(s => ({ ...s, news_weekend: v }))} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div><p className="text-sm font-medium text-foreground">包含今日觀察</p><p className="text-xs text-muted-foreground">在摘要末尾附上趨勢摘要</p></div>
                <Switch checked={settings.news_daily_observation} onCheckedChange={v => setSettings(s => ({ ...s, news_daily_observation: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm border-dashed">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-foreground mb-2">推播格式預覽</p>
              <div className="text-xs text-muted-foreground font-mono bg-muted/40 rounded-lg p-3 space-y-1">
                <p className="font-semibold text-foreground">今日早報｜{new Date().toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })}</p>
                <p>1. <span className="text-[#7C6FF7]">AI 科技</span></p>
                <p className="pl-3 opacity-70">摘要內容...</p>
                <p>2. <span className="text-[#7C6FF7]">半導體</span></p>
                <p className="pl-3 opacity-70">摘要內容...</p>
                {settings.news_daily_observation && <p className="mt-1 opacity-60">今日觀察：...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
