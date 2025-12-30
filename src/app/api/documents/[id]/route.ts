import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/documents/[id] - Get document details with fresh signed URL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Generate fresh signed URL (1 hour expiry for viewing)
    let signedUrl = null
    if (document.file_path) {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 60 * 60) // 1 hour

      if (!signedUrlError && signedUrlData) {
        signedUrl = signedUrlData.signedUrl
      }
    }

    // Fetch findings for this document
    const { data: findings } = await supabase
      .from('findings')
      .select('*')
      .eq('document_id', documentId)
      .order('severity', { ascending: true })

    return NextResponse.json({
      document: {
        ...document,
        signed_url: signedUrl,
      },
      findings: findings || [],
    })

  } catch (error) {
    console.error('GET document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    // Fetch document to get file path
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from storage
    if (document.file_path) {
      await supabase.storage
        .from('documents')
        .remove([document.file_path])
    }

    // Delete findings first (foreign key)
    await supabase
      .from('findings')
      .delete()
      .eq('document_id', documentId)

    // Delete document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'document',
      action: 'delete',
      details: { document_id: documentId },
    })

    return NextResponse.json({ success: true, message: 'Document deleted' })

  } catch (error) {
    console.error('DELETE document error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
