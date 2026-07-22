import { apiFetch } from "@/lib/api";

export type ProspectStatus =
  | "PENDING"
  | "RESEARCHING"
  | "ANALYZING_OPPORTUNITY"
  | "GENERATING_EMAIL"
  | "COMPLETED"
  | "FAILED";

export type Prospect = {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  company_name: string;
  company_website: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  status: ProspectStatus;
  failure_reason: string | null;
  created_at: string;
  subject: string | null;
  email_preview: string | null;
  email_body: string | null;
  generated_at: string | null;
  sent_at: string | null;
};

export type ProspectListResponse = {
  items: Prospect[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};

export const IN_PROGRESS_STATUSES: ProspectStatus[] = [
  "PENDING",
  "RESEARCHING",
  "ANALYZING_OPPORTUNITY",
  "GENERATING_EMAIL",
];

export type StatusFilter = "all" | "completed" | "generating" | "failed";
export type SortField = "created_at" | "client" | "company" | "status";
export type SortOrder = "asc" | "desc";

export type ProspectListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: StatusFilter;
  sort?: SortField;
  order?: SortOrder;
};

export function fetchProspects(params: ProspectListParams): Promise<ProspectListResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sort: params.sort ?? "created_at",
    order: params.order ?? "desc",
  });
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all") query.set("status", params.status);

  return apiFetch<ProspectListResponse>(`/api/prospects?${query.toString()}`);
}

export function updateProspectOutreach(
  id: string,
  payload: { subject: string; email_body: string }
): Promise<Prospect> {
  return apiFetch<Prospect>(`/api/prospects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type BulkRegenerateResponse = {
  accepted: string[];
  skipped: string[];
};

export function bulkRegenerateProspects(prospectIds: string[]): Promise<BulkRegenerateResponse> {
  return apiFetch<BulkRegenerateResponse>("/api/prospects/bulk-regenerate", {
    method: "POST",
    body: JSON.stringify({ prospect_ids: prospectIds }),
  });
}

export function regenerateProspect(id: string): Promise<BulkRegenerateResponse> {
  return bulkRegenerateProspects([id]);
}

export type BulkSendResult = {
  prospect_id: string;
  success: boolean;
  error: string | null;
};

export type BulkSendResponse = {
  results: BulkSendResult[];
};

export function bulkSendProspects(prospectIds: string[]): Promise<BulkSendResponse> {
  return apiFetch<BulkSendResponse>("/api/prospects/bulk-send", {
    method: "POST",
    body: JSON.stringify({ prospect_ids: prospectIds }),
  });
}
