"use client";

import { motion } from "framer-motion";
import { Eye, Globe } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SentIndicator, StatusBadge } from "@/components/dashboard/send-email/status-badge";
import { FacebookIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/brand-icons";
import { formatRelativeDate, getDomain } from "@/lib/format";
import type { Prospect } from "@/lib/prospects";

export function EmailCard({
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      data-selected={selected || undefined}
      className="flex flex-col gap-3 border-b border-border/60 p-4 transition-colors last:border-0 data-selected:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select ${fullName}`}
            className="mt-0.5"
          />
          <Avatar name={fullName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{prospect.company_name}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={prospect.status} />
          <SentIndicator sentAt={prospect.sent_at} />
        </div>
      </div>

      {prospect.subject && (
        <div>
          <p className="truncate text-sm font-medium text-foreground">{prospect.subject}</p>
          {prospect.email_preview && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{prospect.email_preview}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-muted-foreground">
          {prospect.company_website && (
            <a
              href={prospect.company_website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Company website"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <Globe className="size-3.5" />
            </a>
          )}
          {prospect.linkedin_url && (
            <a
              href={prospect.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <LinkedinIcon className="size-3.5" />
            </a>
          )}
          {prospect.facebook_url && (
            <a
              href={prospect.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook profile"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <FacebookIcon className="size-3.5" />
            </a>
          )}
          {prospect.twitter_url && (
            <a
              href={prospect.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter profile"
              className="flex size-7 items-center justify-center rounded-md transition-colors hover:bg-muted hover:text-foreground"
            >
              <TwitterIcon className="size-3.5" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatRelativeDate(prospect.created_at)}</span>
          <Button variant="ghost" size="icon-sm" onClick={onPreview} aria-label={`Preview email for ${fullName}`}>
            <Eye />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
