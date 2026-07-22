export type SellerDocument = {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
};

export type SellerKnowledgeData = {
  company_summary: string;
  product_summary: string;
  ideal_customer_profile: string[];
  primary_industries: string[];
  business_problems_solved: string[];
  core_capabilities: string[];
  differentiators: string[];
  competitive_advantages: string[];
  pricing_position: string;
  buyer_personas: string[];
  cost_savings: string[];
  time_savings: string[];
  automation_opportunities: string[];
  customer_outcomes: string[];
  proof_points: string[];
  discovery_questions: string[];
  common_objections: string[];
  why_customers_switch: string[];
  recommended_pitch: string;
  confidence: number;
};

export type SellerKnowledgeEnvelope = {
  data: SellerKnowledgeData;
  meta: { model_name: string; prompt_version: string; generated_at: string };
};

export type SellerKnowledgeStatusValue = "NOT_GENERATED" | "GENERATING" | "COMPLETED" | "FAILED";

export type SellerKnowledgeProfile = {
  id: string;
  company_name: string | null;
  company_website: string | null;
  product_website: string | null;
  additional_notes: string | null;
  status: SellerKnowledgeStatusValue;
  confidence: number | null;
  model_name: string | null;
  prompt_version: string | null;
  generated_at: string | null;
  failure_reason: string | null;
  sources_processed: number | null;
  knowledge: SellerKnowledgeEnvelope | null;
  documents: SellerDocument[];
};
