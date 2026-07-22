"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Eye, Globe } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SentIndicator, StatusBadge } from "@/components/dashboard/send-email/status-badge";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/brand-icons";
import { formatRelativeDate, getDomain } from "@/lib/format";
import type { Prospect } from "@/lib/prospects";

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string | null;
  label: string;
  icon: ReactNode;
}) {
  if (!href) {
    return <span className="flex size-7 items-center justify-center text-muted-foreground/30">{icon}</span>;
  }
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EmailRow({
  prospect,
  selected,
  onToggleSelect,
  onPreview,
}: {
  prospect: Prospect;
  selected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
}) {
  const fullName = `${prospect.first_name} ${prospect.last_name}`.trim();

  return (
    <motion.tr
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      data-selected={selected || undefined}
      className="group border-b border-border/60 transition-colors last:border-0 hover:bg-muted/40 data-selected:bg-muted/30"
    >
      <td className="w-10 py-3 pl-4">
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label={`Select ${fullName}`} />
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <Avatar name={fullName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{prospect.title || prospect.email}</p>
          </div>
        </div>
      </td>
      <td className="max-w-40 truncate py-3 pr-4 text-sm text-foreground">{prospect.company_name}</td>
      <td className="py-3 pr-4 text-sm">
        {prospect.company_website ? (
          <a
            href={prospect.company_website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            <Globe className="size-3.5 shrink-0" />
            <span className="truncate">{getDomain(prospect.company_website)}</span>
          </a>
        ) : (
          <span className="text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="py-3 pr-1 text-center">
        <SocialLink href={prospect.linkedin_url} label="LinkedIn profile" icon={<LinkedinIcon className="size-3.5" />} />
      </td>
      <td className="py-3 pr-1 text-center">
        <SocialLink href={prospect.facebook_url} label="Facebook profile" icon={<FacebookIcon className="size-3.5" />} />
      </td>
      <td className="py-3 pr-4 text-center">
        <SocialLink href={prospect.twitter_url} label="Twitter profile" icon={<TwitterIcon className="size-3.5" />} />
      </td>
      <td className="max-w-56 truncate py-3 pr-4 text-sm font-medium text-foreground">
        {prospect.subject || <span className="font-normal text-muted-foreground/50">—</span>}
      </td>
      <td className="max-w-xs truncate py-3 pr-4 text-sm text-muted-foreground">
        {prospect.email_preview || <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={prospect.status} />
          <SentIndicator sentAt={prospect.sent_at} />
        </div>
      </td>
      <td className="py-3 pr-4 text-sm whitespace-nowrap text-muted-foreground">
        {formatRelativeDate(prospect.created_at)}
      </td>
      <td className="py-3 pr-4">
        <Button variant="ghost" size="icon-sm" onClick={onPreview} aria-label={`Preview email for ${fullName}`}>
          <Eye />
        </Button>
      </td>
    </motion.tr>
  );
}
