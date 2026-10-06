export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type Row = { id: string; [key: string]: Json };
export type Role = "super_admin" | "admin" | "client";
export type Project = {
  id: string; organisation_id: string; website_id: string; name: string; url: string;
  status: string; service_area: string; start_date: string; services: string[];
};
export type SearchDay = { date: string; kind: string; dimension: string; page: string; clicks: number; impressions: number; position: number };
export type AnalyticsDay = { date: string; kind: string; dimension: string; users: number; sessions: number; engaged_sessions: number; actions: number };
export type Period = { start: string; end: string; previousStart: string; previousEnd: string; label: string };
export type Totals = { clicks: number; impressions: number; ctr: number; position: number | null; sessions: number; engaged: number; actions: number; searchDays: number; analyticsDays: number };
export type Workspace = {
  project: Project; search: SearchDay[]; analytics: AnalyticsDay[];
  integrations: Row[]; keywords: Row[]; ranks: Row[]; issues: Row[]; opportunities: Row[];
  tasks: Row[]; activity: Row[]; reports: Row[]; pages: Row[]; conversions: Row[];
  competitors: Row[]; backlinks: Row[]; citations: Row[]; local: Row[]; audits: Row[];
  pageMetrics: Row[]; baselines: Row[]; migrations: Row[]; redirects: Row[]; notes: Row[];
  syncLogs: Row[]; searchProperties: Row[]; analyticsProperties: Row[];
  members: Row[]; notifications: Row[]; truncated: boolean;
};
export const text = (row: Row, key: string, fallback = "") => typeof row[key] === "string" ? row[key] as string : fallback;
export const num = (row: Row, key: string) => Number(row[key] ?? 0);
export const list = (row: Row, key: string): string[] => Array.isArray(row[key]) ? (row[key] as Json[]).filter((v): v is string => typeof v === "string") : [];
export const tabs = ["Overview", "Search performance", "Analytics", "Rankings", "Local SEO", "Technical", "Pages", "Competitors", "Backlinks", "Conversions", "Opportunities", "Tasks", "Activity", "Reports", "Migration", "Integrations", "Settings"] as const;
export const slug = (value: string) => value.toLowerCase().replaceAll(" ", "-");
