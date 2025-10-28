import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Allow up to 2 images OR 1 ZIP file
    const hasZipFile = files.some(file => file.type === 'application/zip' || file.name.endsWith('.zip'));
    if (hasZipFile && files.length > 1) {
      return NextResponse.json(
        { error: 'Only 1 ZIP file can be uploaded at a time' },
        { status: 400 }
      );
    }
    
    if (!hasZipFile && files.length > 2) {
      return NextResponse.json(
        { error: 'Maximum 2 images allowed' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // Upload to Supabase Storage
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      
      // Determine content type
      let contentType = file.type;
      if (!contentType) {
        if (extension === 'zip') contentType = 'application/zip';
        else if (['jpg', 'jpeg'].includes(extension)) contentType = 'image/jpeg';
        else if (extension === 'png') contentType = 'image/png';
        else if (extension === 'webp') contentType = 'image/webp';
      }
      
      // Upload to Supabase Storage bucket 'veo-images'
      const { data, error } = await supabaseAdmin.storage
        .from('veo-images')
        .upload(filename, buffer, {
          contentType: contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return NextResponse.json(
          { error: 'Failed to upload file', message: error.message },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('veo-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error.message },
      { status: 500 }
    );
  }
}

