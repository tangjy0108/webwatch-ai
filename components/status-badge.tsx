import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "active" | "paused" | "error" | "processing" | "sent";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const configs = {
    active: {
      label: "Active",
      icon: CheckCircle2,
      className: "bg-[#D1FAE5] text-[#059669] border-[#059669]/20",
    },
    sent: {
      label: "Sent",
      icon: CheckCircle2,
      className: "bg-[#D1FAE5] text-[#059669] border-[#059669]/20",
    },
    paused: {
      label: "Paused",
      icon: Clock,
      className: "bg-muted text-muted-foreground border-border",
    },
    error: {
      label: "Error",
      icon: XCircle,
      className: "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20",
    },
    processing: {
      label: "Processing",
      icon: Clock,
      className: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const padding = size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-medium ${padding} ${textSize} ${config.className}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
}