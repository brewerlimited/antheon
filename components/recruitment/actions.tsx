"use client";
import { createContext, useContext } from "react";
import type {
  AvailabilityStatus,
  Broadcast,
  CandidateFilters,
  View,
} from "@/lib/recruitment/types";
export interface ComposerIntent {
  ids: string[];
  jobId?: string;
  kind?: Broadcast["kind"];
  templateId?: string;
}
export interface UIActions {
  navigate: (view: View, filters?: Partial<CandidateFilters>) => void;
  candidate: (id: string) => void;
  editCandidate: (id?: string) => void;
  job: (id: string) => void;
  newJob: () => void;
  client: (id: string) => void;
  site: (id: string) => void;
  status: (ids: string[], status?: AvailabilityStatus, jobId?: string) => void;
  broadcast: (intent: ComposerIntent) => void;
  broadcastResult: (id: string) => void;
  shortlist: (ids: string[], jobId?: string) => void;
  call: (id: string) => void;
  qualification: (candidateId: string, qualificationId?: string) => void;
}
export const UIContext = createContext<UIActions | null>(null);
export function useActions() {
  const actions = useContext(UIContext);
  if (!actions) throw new Error("App actions unavailable");
  return actions;
}
