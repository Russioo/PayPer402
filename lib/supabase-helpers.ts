import { supabaseAdmin } from './supabase';

/**
 * Download an image from a URL and upload it to Supabase Storage
 */
export async function downloadAndUploadToSupabase(
  imageUrl: string,
  bucketName: string = 'generated-images'
): Promise<string> {
  try {
    // Download image from source URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'png';
    const filename = `${timestamp}-${randomStr}.${extension}`;
    
    // Upload to Supabase
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: blob.type || 'image/png',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Failed to download and upload image:', error);
    throw error;
  }
}

/**
 * Download multiple images and upload them to Supabase
 */
export async function downloadAndUploadMultipleToSupabase(
  imageUrls: string[],
  bucketName: string = 'generated-images'
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (const imageUrl of imageUrls) {
    try {
      const publicUrl = await downloadAndUploadToSupabase(imageUrl, bucketName);
      uploadedUrls.push(publicUrl);
    } catch (error) {
      console.error(`Failed to process image ${imageUrl}:`, error);
      // Keep original URL as fallback
      uploadedUrls.push(imageUrl);
    }
  }
  
  return uploadedUrls;
}

