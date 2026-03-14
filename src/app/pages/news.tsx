import {
  Newspaper,
  Plus,
  X,
  Globe,
  Tag,
  AlignLeft,
  Hash,
  Pencil,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useState } from "react";

interface NewsSource {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
}

const initialSources: NewsSource[] = [
  { id: 1, name: "科技新報", url: "technews.tw", enabled: true },
  { id: 2, name: "iThome", url: "ithome.com.tw", enabled: true },
  { id: 3, name: "TechCrunch", url: "techcrunch.com", enabled: false },
  { id: 4, name: "The Verge", url: "theverge.com", enabled: false },
];

interface EditingSource {
  id: number;
  name: string;
  url: string;
}

const defaultIncludeKeywords = ["AI", "人工智能", "台積電", "半導體", "新創", "產品經理"];
const defaultExcludeKeywords = ["廣告", "贊助", "業配"];

export function News() {
  const [sources, setSources] = useState<NewsSource[]>(initialSources);
  const [includeKeywords, setIncludeKeywords] = useState<string[]>(defaultIncludeKeywords);
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>(defaultExcludeKeywords);
  const [newInclude, setNewInclude] = useState("");
  const [newExclude, setNewExclude] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [showAddSource, setShowAddSource] = useState(false);
  const [editingSource, setEditingSource] = useState<EditingSource | null>(null);

  const toggleSource = (id: number) => {
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const addIncludeKeyword = () => {
    const kw = newInclude.trim();
    if (kw && !includeKeywords.includes(kw)) {
      setIncludeKeywords([...includeKeywords, kw]);
    }
    setNewInclude("");
  };

  const addExcludeKeyword = () => {
    const kw = newExclude.trim();
    if (kw && !excludeKeywords.includes(kw)) {
      setExcludeKeywords([...excludeKeywords, kw]);
    }
    setNewExclude("");
  };

  const saveEdit = () => {
    if (!editingSource) return;
    setSources(sources.map(s =>
      s.id === editingSource.id
        ? { ...s, name: editingSource.name, url: editingSource.url }
        : s
    ));
    setEditingSource(null);
  };

  const addSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    setSources([...sources, {
      id: Date.now(),
      name: newSourceName.trim(),
      url: newSourceUrl.trim(),
      enabled: true,
    }]);
    setNewSourceName("");
    setNewSourceUrl("");
    setShowAddSource(false);
  };

  const removeSource = (id: number) => {
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">新聞設定</h1>
        <p className="text-muted-foreground mt-1">
          設定新聞來源與關鍵字，每天早上 8 點自動抓取並推播摘要
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* News Sources */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    新聞來源
                  </CardTitle>
                  <CardDescription className="mt-1">
                    開啟的來源才會被抓取
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowAddSource(!showAddSource)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAddSource && (
                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">名稱</Label>
                      <Input
                        placeholder="e.g. 36Kr"
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        className="rounded-xl h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">網域</Label>
                      <Input
                        placeholder="e.g. 36kr.com"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        className="rounded-xl h-9"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl" onClick={addSource}>新增來源</Button>
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setShowAddSource(false)}>取消</Button>
                  </div>
                </div>
              )}
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-3 rounded-xl border border-border/50 bg-muted/20"
                >
                  {editingSource?.id === source.id ? (
                    // Inline edit mode
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editingSource.name}
                          onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                          className="rounded-xl h-8 text-sm"
                          placeholder="名稱"
                        />
                        <Input
                          value={editingSource.url}
                          onChange={(e) => setEditingSource({ ...editingSource, url: e.target.value })}
                          className="rounded-xl h-8 text-sm"
                          placeholder="網域或完整 URL"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-xl h-7 text-xs" onClick={saveEdit}>
                          <Check className="w-3 h-3 mr-1" />
                          儲存
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs" onClick={() => setEditingSource(null)}>
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Normal display mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          source.enabled ? "bg-[#F0EFFF]" : "bg-muted"
                        }`}>
                          <Newspaper className={`w-4 h-4 ${source.enabled ? "text-[#7C6FF7]" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={() => toggleSource(source.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingSource({ id: source.id, name: source.name, url: source.url })}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSource(source.id)}
                        >
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
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                關鍵字設定
              </CardTitle>
              <CardDescription>
                包含關鍵字的新聞優先推播；排除關鍵字的新聞直接過濾
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Include */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#7C6FF7]" />
                  關注關鍵字
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {includeKeywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="bg-[#F0EFFF] text-[#7C6FF7] border-[#7C6FF7]/20 pr-1 gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => setIncludeKeywords(includeKeywords.filter(k => k !== kw))}
                        className="hover:text-[#5b52d6] ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="新增關鍵字，Enter 確認"
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addIncludeKeyword()}
                    className="rounded-xl border-border bg-white"
                  />
                  <Button variant="outline" className="rounded-xl" onClick={addIncludeKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Exclude */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-[#DC2626]" />
                  排除關鍵字
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {excludeKeywords.map((kw) => (
                    <Badge
                      key={kw}
                      variant="secondary"
                      className="bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20 pr-1 gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => setExcludeKeywords(excludeKeywords.filter(k => k !== kw))}
                        className="hover:text-[#b91c1c] ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="新增排除詞，Enter 確認"
                    value={newExclude}
                    onChange={(e) => setNewExclude(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addExcludeKeyword()}
                    className="rounded-xl border-border bg-white"
                  />
                  <Button variant="outline" className="rounded-xl" onClick={addExcludeKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Preferences */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlignLeft className="w-4 h-4 text-primary" />
                推播偏好
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>每日最多推送</Label>
                <Select defaultValue="5">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 則</SelectItem>
                    <SelectItem value="5">5 則</SelectItem>
                    <SelectItem value="10">10 則</SelectItem>
                    <SelectItem value="0">不限</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>摘要長度</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">簡短（1-2 句）</SelectItem>
                    <SelectItem value="medium">適中（3-4 句）</SelectItem>
                    <SelectItem value="long">詳細（一段）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">假日也推播</p>
                  <p className="text-xs text-muted-foreground">週六、週日照常執行</p>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">包含今日觀察</p>
                  <p className="text-xs text-muted-foreground">在摘要末尾附上趨勢摘要</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm border-dashed">
            <CardContent className="p-5">
              <div className="flex items-start gap-2 mb-2">
                <Newspaper className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">推播格式預覽</p>
                  <div className="text-xs text-muted-foreground space-y-1 font-mono bg-muted/40 rounded-lg p-3">
                    <p className="font-semibold text-foreground">今日早報｜3/14</p>
                    <p>1. <span className="text-[#7C6FF7]">AI 科技</span></p>
                    <p className="pl-3 opacity-70">摘要內容...</p>
                    <p>2. <span className="text-[#7C6FF7]">半導體</span></p>
                    <p className="pl-3 opacity-70">摘要內容...</p>
                    <p className="mt-1 opacity-60">今日觀察：...</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
