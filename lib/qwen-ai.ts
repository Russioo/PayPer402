const QWEN_API_KEY = process.env.QWEN_API_KEY;
const KIE_API_BASE = 'https://api.kie.ai';

interface CreateQwenTaskOptions {
  prompt: string;
  imageSize?: 'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  numInferenceSteps?: number;
  seed?: number;
  guidanceScale?: number;
  enableSafetyChecker?: boolean;
  outputFormat?: 'png' | 'jpeg';
  negativePrompt?: string;
  acceleration?: 'none' | 'regular' | 'high';
}

export async function createQwenTask(options: CreateQwenTaskOptions) {
  if (!QWEN_API_KEY) {
    throw new Error('QWEN_API_KEY is not configured');
  }

  const requestBody = {
    model: 'qwen/text-to-image',
    input: {
      prompt: options.prompt,
      image_size: options.imageSize || 'square_hd',
      num_inference_steps: options.numInferenceSteps || 30,
      guidance_scale: options.guidanceScale || 2.5,
      enable_safety_checker: options.enableSafetyChecker !== undefined ? options.enableSafetyChecker : true,
      output_format: options.outputFormat || 'png',
      negative_prompt: options.negativePrompt || ' ',
      acceleration: options.acceleration || 'none',
      ...(options.seed !== undefined && { seed: options.seed }),
    },
  };

  console.log('🎨 Creating Qwen task with body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Qwen API error:', response.status, errorText);
    throw new Error(`Qwen API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Qwen task created:', data);

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to create Qwen task');
  }

  return {
    taskId: data.data.taskId,
  };
}

export async function queryQwenStatus(taskId: string) {
  if (!QWEN_API_KEY) {
    throw new Error('QWEN_API_KEY is not configured');
  }

  console.log(`🔍 Querying Qwen task status: ${taskId}`);

  const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${QWEN_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Qwen query error:', response.status, errorText);
    throw new Error(`Qwen query failed: ${response.status} ${errorText}`);
  }

  const responseData = await response.json();
  console.log('📊 Qwen status response:', JSON.stringify(responseData, null, 2));

  if (responseData.code !== 200) {
    throw new Error(responseData.msg || 'Failed to query Qwen task');
  }

  // Return in same format as other APIs (with data property)
  return { data: responseData.data };
}


