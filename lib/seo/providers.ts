export type Capability = "rankings" | "volume" | "serps" | "local" | "backlinks" | "citations";
export type ProviderContext = { projectId: string; domain: string; signal: AbortSignal };
export interface SeoProvider<T> {
  id: string; capability: Capability; configured(): boolean;
  sync(context: ProviderContext): Promise<{ records: T[]; cursor?: string; observedAt: string }>;
}
export const futureProviders = [
  { id: "rankings", name: "Rank tracking", description: "Independent keyword positions, locations and device history.", suggestion: "DataForSEO or equivalent" },
  { id: "volume", name: "Search volumes", description: "Provider estimates of monthly demand; never inferred from impressions.", suggestion: "DataForSEO or equivalent" },
  { id: "serps", name: "Competitor SERPs", description: "Competitor visibility and result features from a licensed provider.", suggestion: "DataForSEO or equivalent" },
  { id: "local", name: "Local visibility", description: "Location-aware map grids and local competitor comparison.", suggestion: "A local grid provider" },
  { id: "backlinks", name: "Backlink intelligence", description: "Link discovery and change history with transparent provider provenance.", suggestion: "Ahrefs, DataForSEO or equivalent" },
  { id: "citations", name: "Citation discovery", description: "Business listings and consistency checks across directories.", suggestion: "A citation data provider" },
] as const;
// Intentionally inactive. Credentials alone do not imply a working implementation.
export const inactiveProviders: SeoProvider<never>[] = futureProviders.map(provider => ({
  id: provider.id, capability: provider.id, configured: () => false,
  async sync() { return { records: [], observedAt: new Date().toISOString() }; },
}));
