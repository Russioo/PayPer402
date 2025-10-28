const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;
const KIE_API_BASE = 'https://api.kie.ai';

interface CreateIdeogramTaskOptions {
  prompt: string;
  renderingSpeed?: 'TURBO' | 'BALANCED' | 'QUALITY';
  style?: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN';
  expandPrompt?: boolean;
  imageSize?: 'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  numImages?: '1' | '2' | '3' | '4';
  seed?: number;
  negativePrompt?: string;
}

export async function createIdeogramTask(options: CreateIdeogramTaskOptions) {
  if (!IDEOGRAM_API_KEY) {
    throw new Error('IDEOGRAM_API_KEY is not configured');
  }

  const requestBody = {
    model: 'ideogram/v3-text-to-image',
    input: {
      prompt: options.prompt,
      rendering_speed: options.renderingSpeed || 'BALANCED',
      style: options.style || 'AUTO',
      expand_prompt: options.expandPrompt !== undefined ? options.expandPrompt : true,
      image_size: options.imageSize || 'square_hd',
      num_images: options.numImages || '1',
      ...(options.seed !== undefined && { seed: options.seed }),
      ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
    },
  };

  console.log('🎨 Creating Ideogram task with body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${IDEOGRAM_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Ideogram API error:', response.status, errorText);
    throw new Error(`Ideogram API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Ideogram task created:', data);

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to create Ideogram task');
  }

  return {
    taskId: data.data.taskId,
  };
}

export async function queryIdeogramStatus(taskId: string) {
  if (!IDEOGRAM_API_KEY) {
    throw new Error('IDEOGRAM_API_KEY is not configured');
  }

  console.log(`🔍 Querying Ideogram task status: ${taskId}`);

  const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${IDEOGRAM_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Ideogram query error:', response.status, errorText);
    throw new Error(`Ideogram query failed: ${response.status} ${errorText}`);
  }

  const responseData = await response.json();
  console.log('📊 Ideogram status response:', JSON.stringify(responseData, null, 2));

  if (responseData.code !== 200) {
    throw new Error(responseData.msg || 'Failed to query Ideogram task');
  }

  // Return in same format as other APIs (with data property)
  return { data: responseData.data };
}

