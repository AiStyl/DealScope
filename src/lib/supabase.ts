import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Deal {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  deal_id?: string
  name: string
  file_path: string
  file_type: string
  file_size: number
  status: 'pending' | 'processing' | 'analyzed' | 'error'
  risk_score?: number
  page_count?: number
  extracted_text?: string
  created_at: string
  updated_at: string
}

export interface Finding {
  id: string
  document_id: string
  analysis_id?: string
  type: 'risk' | 'clause' | 'financial' | 'entity' | 'recommendation'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  page_number?: number
  confidence: number
  model: 'claude' | 'gpt-4' | 'gemini' | 'consensus'
  raw_response?: string
  created_at: string
}

export interface Analysis {
  id: string
  document_id: string
  models_used: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  consensus_score?: number
  processing_time_ms?: number
  created_at: string
  completed_at?: string
}

// Helper functions
export async function uploadDocument(file: File, dealId?: string): Promise<Document | null> {
  try {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    // Create document record
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId,
        name: file.name,
        file_path: uploadData.path,
        file_type: file.type,
        file_size: file.size,
        status: 'pending',
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
      return null
    }

    return docData
  } catch (error) {
    console.error('Upload failed:', error)
    return null
  }
}

export async function getDocuments(dealId?: string): Promise<Document[]> {
  let query = supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (dealId) {
    query = query.eq('deal_id', dealId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Fetch documents error:', error)
    return []
  }

  return data || []
}

export async function getDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Fetch document error:', error)
    return null
  }

  return data
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update document error:', error)
    return null
  }

  return data
}

export async function saveFindings(findings: Omit<Finding, 'id' | 'created_at'>[]): Promise<Finding[]> {
  const { data, error } = await supabase
    .from('findings')
    .insert(findings)
    .select()

  if (error) {
    console.error('Save findings error:', error)
    return []
  }

  return data || []
}

export async function getFindings(documentId: string): Promise<Finding[]> {
  const { data, error } = await supabase
    .from('findings')
    .select('*')
    .eq('document_id', documentId)
    .order('severity', { ascending: true })

  if (error) {
    console.error('Fetch findings error:', error)
    return []
  }

  return data || []
}

export async function createAnalysis(documentId: string, models: string[]): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .insert({
      document_id: documentId,
      models_used: models,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Create analysis error:', error)
    return null
  }

  return data
}

export async function updateAnalysis(id: string, updates: Partial<Analysis>): Promise<Analysis | null> {
  const { data, error } = await supabase
    .from('analyses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update analysis error:', error)
    return null
  }

  return data
}

// Audit logging
export async function logAuditEvent(
  eventType: string,
  action: string,
  details: Record<string, unknown>,
  userId?: string
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      action,
      details,
      user_id: userId,
      ip_address: null, // Would need to pass from request
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}
