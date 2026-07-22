import { apiFetch } from "@/lib/api";

export type DailyActivity = {
  date: string;
  added: number;
  sent: number;
};

export type StatsOverview = {
  total_prospects: number;
  completed_count: number;
  generating_count: number;
  failed_count: number;
  sent_count: number;
  csv_upload_count: number;
  seller_knowledge_status: "NOT_GENERATED" | "GENERATING" | "COMPLETED" | "FAILED";
  has_seller_knowledge: boolean;
  daily_activity: DailyActivity[];
};

export function fetchStatsOverview(): Promise<StatsOverview> {
  return apiFetch<StatsOverview>("/api/stats/overview");
}
