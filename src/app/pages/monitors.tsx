import { 
  Globe, 
  Plus, 
  MoreVertical,
  Trash2,
  Pause,
  Play,
  Edit,
  ExternalLink,
  Search,
  X,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useState } from "react";

interface Monitor {
  id: number;
  name: string;
  url: string;
  status: "active" | "paused";
  scheduleTime: string;
  lastCheck: string;
  totalSummaries: number;
  category: string;
}

// Mock data - 预设104和科技新闻
const initialMonitors: Monitor[] = [
  {
    id: 1,
    name: "104 人力銀行",
    url: "https://www.104.com.tw",
    status: "active",
    scheduleTime: "08:00",
    lastCheck: "5 minutes ago",
    totalSummaries: 42,
    category: "Job Listings",
  },
  {
    id: 2,
    name: "科技新聞",
    url: "https://technews.tw",
    status: "active",
    scheduleTime: "08:00",
    lastCheck: "3 minutes ago",
    totalSummaries: 89,
    category: "Tech News",
  },
];

export function Monitors() {
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMonitor, setNewMonitor] = useState({
    name: "",
    url: "",
    category: "",
    scheduleTime: "08:00",
  });

  const filteredMonitors = monitors.filter(
    (monitor) =>
      monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monitor.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monitor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMonitor = () => {
    if (!newMonitor.name || !newMonitor.url) return;

    const monitor: Monitor = {
      id: Date.now(),
      name: newMonitor.name,
      url: newMonitor.url,
      category: newMonitor.category || "General",
      scheduleTime: newMonitor.scheduleTime,
      status: "active",
      lastCheck: "Never",
      totalSummaries: 0,
    };

    setMonitors([...monitors, monitor]);
    setIsAddDialogOpen(false);
    setNewMonitor({
      name: "",
      url: "",
      category: "",
      scheduleTime: "08:00",
    });
  };

  const handleToggleStatus = (id: number) => {
    setMonitors(monitors.map(m => 
      m.id === id 
        ? { ...m, status: m.status === 'active' ? 'paused' : 'active' as const }
        : m
    ));
  };

  const handleDeleteMonitor = (id: number) => {
    setMonitors(monitors.filter(m => m.id !== id));
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">Web Monitors</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tracked websites and content sources
          </p>
        </div>
        <Button 
          className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Monitor
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search monitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border bg-white"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            All ({monitors.length})
          </Button>
          <Button variant="outline" className="rounded-xl">
            Active ({monitors.filter(m => m.status === 'active').length})
          </Button>
          <Button variant="outline" className="rounded-xl">
            Paused ({monitors.filter(m => m.status === 'paused').length})
          </Button>
        </div>
      </div>

      {/* Monitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMonitors.map((monitor) => (
          <Card key={monitor.id} className="border-border shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    monitor.status === 'active' 
                      ? 'bg-[#F0EFFF]' 
                      : 'bg-muted'
                  }`}>
                    <Globe className={`w-6 h-6 ${
                      monitor.status === 'active' 
                        ? 'text-[#7C6FF7]' 
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{monitor.name}</h3>
                      <Badge
                        variant={monitor.status === "active" ? "secondary" : "outline"}
                        className={
                          monitor.status === "active"
                            ? "bg-[#D1FAE5] text-[#059669] border-[#059669]/20"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {monitor.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="truncate">{monitor.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="rounded-lg">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-lg"
                      onClick={() => handleToggleStatus(monitor.id)}
                    >
                      {monitor.status === 'active' ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-lg text-destructive"
                      onClick={() => handleDeleteMonitor(monitor.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Schedule Time</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{monitor.scheduleTime}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">{monitor.category}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last checked</p>
                  <p className="text-sm font-medium text-foreground">{monitor.lastCheck}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Total summaries</p>
                  <p className="text-sm font-medium text-foreground">{monitor.totalSummaries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMonitors.length === 0 && (
        <Card className="border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No monitors found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try adjusting your search</p>
            <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-xl">
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Monitor Dialog */}
      {isAddDialogOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsAddDialogOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <Card className="w-full max-w-lg border-border shadow-xl pointer-events-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Add New Monitor</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Monitor Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tech News, Job Listings"
                    value={newMonitor.name}
                    onChange={(e) => setNewMonitor({ ...newMonitor, name: e.target.value })}
                    className="rounded-xl border-border bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Website URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={newMonitor.url}
                    onChange={(e) => setNewMonitor({ ...newMonitor, url: e.target.value })}
                    className="rounded-xl border-border bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Tech News, Jobs, Finance"
                    value={newMonitor.category}
                    onChange={(e) => setNewMonitor({ ...newMonitor, category: e.target.value })}
                    className="rounded-xl border-border bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Schedule Time</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      id="schedule-time"
                      type="time"
                      value={newMonitor.scheduleTime}
                      onChange={(e) => setNewMonitor({ ...newMonitor, scheduleTime: e.target.value })}
                      className="rounded-xl border-border bg-white"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily check time for this monitor
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl"
                    onClick={handleAddMonitor}
                    disabled={!newMonitor.name || !newMonitor.url}
                  >
                    Add Monitor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
