export type AvailabilityStatus =
  | "available"
  | "open"
  | "working"
  | "not-looking"
  | "unknown";
export type View =
  | "overview"
  | "candidates"
  | "jobs"
  | "placements"
  | "clients"
  | "messages"
  | "compliance"
  | "settings";
export type Channel = "SMS" | "WhatsApp" | "Email";
export type PayType = "CIS" | "PAYE" | "Ltd / subcontract";
export interface Trade {
  id: string;
  name: string;
}
export interface Recruiter {
  id: string;
  name: string;
  initials: string;
  colour: string;
}
export interface Town {
  name: string;
  postcode: string;
  lat: number;
  lng: number;
}
export interface QualificationType {
  id: string;
  name: string;
  family: string;
  code?: string;
  keywords?: string;
}
export interface Qualification {
  id: string;
  typeId: string;
  customName?: string;
  provider?: string;
  category?: string;
  number: string;
  issued: string;
  expiry: string;
  verified: boolean;
  document?: string;
}
export interface Candidate {
  id: string;
  name: string;
  trade: string;
  secondary: string[];
  town: string;
  postcode: string;
  phone: string;
  email: string;
  status: AvailabilityStatus;
  availableFrom: string;
  reviewDate?: string;
  radius: number;
  rate: number;
  payType: PayType;
  experience: number;
  recruiterId: string;
  source: string;
  preference: Channel;
  doNotContact: boolean;
  lastContact: string;
  statusConfirmed: string;
  qualifications: Qualification[];
  created: string;
}
export interface Client {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  notes: string;
}
export interface Site {
  id: string;
  clientId: string;
  name: string;
  town: string;
  postcode: string;
  contact: string;
  start: string;
  finish: string;
  notes: string;
}
export interface Job {
  id: string;
  reference: string;
  trade: string;
  clientId: string;
  siteId: string;
  required: number;
  start: string;
  finish: string;
  rate: number;
  payType: PayType;
  hours: number;
  tickets: string[];
  desirable: string[];
  description: string;
  recruiterId: string;
  urgency: "Normal" | "Priority" | "Urgent";
  status: "open" | "completed";
  shortlist: string[];
}
export interface Placement {
  id: string;
  candidateId: string;
  clientId: string;
  siteId: string;
  jobId?: string;
  role: string;
  start: string;
  finish: string;
  actualFinish?: string;
  rate: number;
  notes: string;
  status: "current" | "upcoming" | "completed";
}
export type ResponseStatus =
  | "Interested"
  | "Not interested"
  | "Call me"
  | "No response"
  | "Working"
  | "Available now"
  | "Open to work"
  | "Not looking";
export interface BroadcastRecipient {
  candidateId: string;
  delivery: "delivered" | "pending";
  response: ResponseStatus;
  preview: string;
}
export interface Message {
  id: string;
  candidateId: string;
  broadcastId: string;
  direction: "in" | "out";
  text: string;
  created: string;
  channel: Channel;
}
export interface Broadcast {
  id: string;
  title: string;
  jobId?: string;
  channel: Channel;
  template: string;
  kind: "job" | "availability" | "renewal" | "general";
  recipients: BroadcastRecipient[];
  created: string;
  simulated: boolean;
}
export interface Note {
  id: string;
  candidateId?: string;
  clientId?: string;
  text: string;
  created: string;
  author: string;
}
export interface Activity {
  id: string;
  candidateId?: string;
  jobId?: string;
  broadcastId?: string;
  title: string;
  detail: string;
  created: string;
  read: boolean;
}
export interface CandidateFilters {
  search: string;
  availability: string;
  availableBy: string;
  trade: string;
  town: string;
  radius: string;
  postcode: string;
  ticket: string;
  expiry: string;
  experience: string;
  lastContact: string;
  clientId: string;
  siteId: string;
  recruiterId: string;
  payType: string;
  source: string;
  preference: string;
  contactable: string;
}
export interface SavedView {
  id: string;
  name: string;
  filters: CandidateFilters;
}
export interface MessageTemplate {
  id: string;
  name: string;
  text: string;
}
export interface DemoData {
  version: number;
  candidates: Candidate[];
  clients: Client[];
  sites: Site[];
  jobs: Job[];
  placements: Placement[];
  broadcasts: Broadcast[];
  messages: Message[];
  notes: Note[];
  activity: Activity[];
  savedViews: SavedView[];
  templates: MessageTemplate[];
  sequence: number;
}
export type PlacementInput = Omit<Placement, "id" | "candidateId" | "status">;
export type Command =
  | { type: "candidate"; candidate: Candidate; edit?: boolean }
  | {
      type: "status";
      ids: string[];
      status: AvailabilityStatus;
      availableFrom?: string;
      reviewDate?: string;
      finish?: string;
      placement?: PlacementInput;
    }
  | { type: "recruiter"; ids: string[]; recruiterId: string }
  | { type: "qualification"; candidateId: string; qualification: Qualification }
  | { type: "note"; candidateId?: string; clientId?: string; text: string }
  | { type: "job"; job: Job }
  | { type: "shortlist"; jobId: string; ids: string[]; remove?: boolean }
  | {
      type: "broadcast";
      ids: string[];
      title: string;
      channel: Channel;
      template: string;
      kind: Broadcast["kind"];
      jobId?: string;
    }
  | { type: "simulate"; broadcastId: string }
  | { type: "save-view"; name: string; filters: CandidateFilters }
  | { type: "delete-view"; id: string }
  | { type: "template"; template: MessageTemplate }
  | { type: "read-notifications" }
  | { type: "call"; candidateId: string };
