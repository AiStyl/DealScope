import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const dealId = formData.get('dealId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PDF, DOCX, TXT' }, { status: 400 })
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum 50MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${sanitizedName}`

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    // Generate signed URL (expires in 7 days) for private bucket
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7) // 7 days

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
    }

    // Create document record in database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        deal_id: dealId || null,
        name: file.name,
        file_path: uploadData.path,
        file_type: file.type,
        file_size: file.size,
        status: 'pending',
      })
      .select()
      .single()

    if (docError) {
      console.error('Database insert error:', docError)
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([fileName])
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 })
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      event_type: 'document',
      action: 'upload',
      details: {
        document_id: docData.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        ...docData,
        signed_url: signedUrlData?.signedUrl || null,
      },
      message: 'Document uploaded successfully. Ready for analysis.',
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Fetch documents error:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({ documents: data })

  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
