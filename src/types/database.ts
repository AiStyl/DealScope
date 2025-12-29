export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      deals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          company_name: string
          deal_type: 'acquisition' | 'merger' | 'investment' | 'divestiture'
          status: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived'
          target_value: number | null
          currency: string
          industry: string | null
          description: string | null
          assigned_to: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          company_name: string
          deal_type: 'acquisition' | 'merger' | 'investment' | 'divestiture'
          status?: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived'
          target_value?: number | null
          currency?: string
          industry?: string | null
          description?: string | null
          assigned_to?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          company_name?: string
          deal_type?: 'acquisition' | 'merger' | 'investment' | 'divestiture'
          status?: 'draft' | 'in_progress' | 'review' | 'completed' | 'archived'
          target_value?: number | null
          currency?: string
          industry?: string | null
          description?: string | null
          assigned_to?: string | null
          metadata?: Json | null
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          deal_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          status: 'uploading' | 'processing' | 'analyzed' | 'error'
          extracted_text: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          deal_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          status?: 'uploading' | 'processing' | 'analyzed' | 'error'
          extracted_text?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          deal_id?: string
          name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          status?: 'uploading' | 'processing' | 'analyzed' | 'error'
          extracted_text?: string | null
          metadata?: Json | null
        }
      }
      findings: {
        Row: {
          id: string
          created_at: string
          deal_id: string
          document_id: string | null
          agent_id: string
          finding_type: 'risk' | 'opportunity' | 'anomaly' | 'insight' | 'contract_clause'
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
          title: string
          description: string
          evidence: string | null
          confidence: number
          consensus_score: number | null
          models_agreed: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          deal_id: string
          document_id?: string | null
          agent_id: string
          finding_type: 'risk' | 'opportunity' | 'anomaly' | 'insight' | 'contract_clause'
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
          title: string
          description: string
          evidence?: string | null
          confidence: number
          consensus_score?: number | null
          models_agreed?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          deal_id?: string
          document_id?: string | null
          agent_id?: string
          finding_type?: 'risk' | 'opportunity' | 'anomaly' | 'insight' | 'contract_clause'
          severity?: 'critical' | 'high' | 'medium' | 'low' | 'info'
          title?: string
          description?: string
          evidence?: string | null
          confidence?: number
          consensus_score?: number | null
          models_agreed?: string[] | null
          metadata?: Json | null
        }
      }
      agents: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string
          model: 'claude' | 'gpt-4' | 'gemini'
          system_prompt: string
          is_active: boolean
          config: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          model: 'claude' | 'gpt-4' | 'gemini'
          system_prompt: string
          is_active?: boolean
          config?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          model?: 'claude' | 'gpt-4' | 'gemini'
          system_prompt?: string
          is_active?: boolean
          config?: Json | null
        }
      }
      audit_trail: {
        Row: {
          id: string
          timestamp: string
          event_type: 'ai_decision' | 'user_action' | 'system_event' | 'consensus_vote'
          actor_type: 'user' | 'agent' | 'system'
          actor_id: string
          deal_id: string | null
          document_id: string | null
          action: string
          input: Json | null
          output: Json | null
          confidence: number | null
          model_used: string | null
          hash: string
          prev_hash: string | null
        }
        Insert: {
          id?: string
          timestamp?: string
          event_type: 'ai_decision' | 'user_action' | 'system_event' | 'consensus_vote'
          actor_type: 'user' | 'agent' | 'system'
          actor_id: string
          deal_id?: string | null
          document_id?: string | null
          action: string
          input?: Json | null
          output?: Json | null
          confidence?: number | null
          model_used?: string | null
          hash: string
          prev_hash?: string | null
        }
        Update: {
          id?: string
          timestamp?: string
          event_type?: 'ai_decision' | 'user_action' | 'system_event' | 'consensus_vote'
          actor_type?: 'user' | 'agent' | 'system'
          actor_id?: string
          deal_id?: string | null
          document_id?: string | null
          action?: string
          input?: Json | null
          output?: Json | null
          confidence?: number | null
          model_used?: string | null
          hash?: string
          prev_hash?: string | null
        }
      }
      analysis_sessions: {
        Row: {
          id: string
          created_at: string
          deal_id: string
          session_type: 'multi_agent' | 'debate' | 'interrogation' | 'simulation'
          status: 'pending' | 'running' | 'completed' | 'failed'
          input: Json
          output: Json | null
          models_used: string[]
          total_tokens: number | null
          duration_ms: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          deal_id: string
          session_type: 'multi_agent' | 'debate' | 'interrogation' | 'simulation'
          status?: 'pending' | 'running' | 'completed' | 'failed'
          input: Json
          output?: Json | null
          models_used: string[]
          total_tokens?: number | null
          duration_ms?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          deal_id?: string
          session_type?: 'multi_agent' | 'debate' | 'interrogation' | 'simulation'
          status?: 'pending' | 'running' | 'completed' | 'failed'
          input?: Json
          output?: Json | null
          models_used?: string[]
          total_tokens?: number | null
          duration_ms?: number | null
          metadata?: Json | null
        }
      }
    }
  }
}
