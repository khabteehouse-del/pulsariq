export type UserRole       = "admin" | "manager" | "viewer";
export type DocumentStatus = "pending" | "processing" | "chunking" | "embedding" | "ready" | "failed";
export type MessageRole    = "user" | "assistant";
export type AnalyticsEvent = "query" | "upload" | "delete" | "login" | "export";

export interface Organization {
  id: string; name: string; slug: string;
  logo_url: string | null; created_at: string; updated_at: string;
}
export interface Profile {
  id: string; org_id: string | null; email: string;
  full_name: string | null; avatar_url: string | null;
  role: UserRole; created_at: string; updated_at: string;
}
export interface DocumentMetadata {
  page_count?: number; word_count?: number; sheet_names?: string[];
  slide_count?: number; author?: string; [key: string]: unknown;
}
export interface Document {
  id: string; org_id: string; uploaded_by: string; name: string;
  file_type: string; file_size: number; storage_path: string;
  status: DocumentStatus; chunk_count: number; error_message: string | null;
  metadata: DocumentMetadata; created_at: string; updated_at: string;
}
export interface ChunkMetadata {
  page?: number; slide_number?: number; sheet_name?: string;
  heading?: string; [key: string]: unknown;
}
export interface DocumentChunk {
  id: string; document_id: string; org_id: string; content: string;
  embedding: number[] | null; chunk_index: number;
  metadata: ChunkMetadata; created_at: string;
}
export interface ChatSession {
  id: string; org_id: string; user_id: string; title: string;
  document_ids: string[]; created_at: string; updated_at: string;
}
export interface Citation {
  doc_id: string; chunk_id: string; doc_name: string;
  excerpt: string; page?: number; slide_number?: number; similarity?: number;
}
export interface Message {
  id: string; session_id: string; org_id: string; role: MessageRole;
  content: string; citations: Citation[]; created_at: string;
}
export interface AnalyticsLog {
  id: string; org_id: string; user_id: string | null;
  event_type: AnalyticsEvent; metadata: Record<string, unknown>; created_at: string;
}
export interface Database {
  public: {
    Tables: {
      organizations:   { Row: Organization;   Insert: Omit<Organization,   "id"|"created_at"|"updated_at">; Update: Partial<Omit<Organization,   "id"|"created_at"|"updated_at">>; };
      profiles:        { Row: Profile;        Insert: Omit<Profile,        "created_at"|"updated_at">;      Update: Partial<Omit<Profile,        "id"|"created_at"|"updated_at">>; };
      documents:       { Row: Document;       Insert: Omit<Document,       "id"|"created_at"|"updated_at"|"chunk_count">; Update: Partial<Omit<Document, "id"|"created_at"|"updated_at">>; };
      document_chunks: { Row: DocumentChunk;  Insert: Omit<DocumentChunk,  "id"|"created_at">;             Update: Partial<Omit<DocumentChunk,  "id"|"created_at">>; };
      chat_sessions:   { Row: ChatSession;    Insert: Omit<ChatSession,    "id"|"created_at"|"updated_at">; Update: Partial<Omit<ChatSession,   "id"|"created_at"|"updated_at">>; };
      messages:        { Row: Message;        Insert: Omit<Message,        "id"|"created_at">;             Update: never; };
      analytics_logs:  { Row: AnalyticsLog;   Insert: Omit<AnalyticsLog,   "id"|"created_at">;             Update: never; };
    };
    Functions: {
      match_chunks: {
        Args: { query_embedding: number[]; match_org_id: string; match_document_ids?: string[]|null; match_threshold?: number; match_count?: number; };
        Returns: { id: string; document_id: string; content: string; metadata: ChunkMetadata; similarity: number; }[];
      };
      current_org_id:    { Args: Record<never,never>; Returns: string; };
      current_user_role: { Args: Record<never,never>; Returns: UserRole; };
    };
  };
}
export type MatchedChunk = { id: string; document_id: string; content: string; metadata: ChunkMetadata; similarity: number; };
