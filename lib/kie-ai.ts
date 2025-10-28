// Kie.ai API Integration for Sora 2

const KIE_AI_API_URL = process.env.KIE_AI_API_URL || 'https://api.kie.ai/api/v1';
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;

export interface CreateTaskRequest {
  model: string;
  callBackUrl?: string;
  input: {
    prompt: string;
    aspect_ratio?: 'portrait' | 'landscape';
    n_frames?: '10' | '15';
    size?: 'standard' | 'high';
    remove_watermark?: boolean;
  };
}

export interface CreateTaskResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export interface QueryTaskResponse {
  code: number;
  msg: string;
  message?: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail';
    createTime: number;
    completeTime?: number;
    updateTime?: number;
    costTime?: number;
    consumeCredits?: number;
    remainedCredits?: number;
    resultJson?: string;
    failCode?: string | null;
    failMsg?: string | null;
    param?: string;
  };
}

export interface TaskResult {
  resultUrls: string[];
  resultWaterMarkUrls?: string[];
}

/**
 * Create a new Sora 2 generation task
 */
export async function createSoraTask(
  prompt: string,
  options?: {
    aspect_ratio?: 'portrait' | 'landscape';
    n_frames?: '10' | '15';
    size?: 'standard' | 'high';
    remove_watermark?: boolean;
    callBackUrl?: string;
  }
): Promise<CreateTaskResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY is not configured');
  }

  // Determine model based on quality
  const model = options?.size === 'high' 
    ? 'sora-2-pro-text-to-video'  // 1080P HD
    : options?.size === 'standard'
    ? 'sora-2-pro-text-to-video'  // 720P (Pro with standard size)
    : 'sora-2-text-to-video';      // Basic

  const requestBody: CreateTaskRequest = {
    model,
    input: {
      prompt,
      aspect_ratio: options?.aspect_ratio || 'landscape',
      n_frames: options?.n_frames || '10',
      remove_watermark: options?.remove_watermark ?? true,
    },
  };

  // Add size parameter for Pro models
  if (options?.size) {
    requestBody.input.size = options.size;
  }

  if (options?.callBackUrl) {
    requestBody.callBackUrl = options.callBackUrl;
  }

  const response = await fetch(`${KIE_AI_API_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store',  // Next.js: aldrig cache denne request!
  });

  const data = await response.json();
  
  console.log('Kie.ai Response:', {
    status: response.status,
    ok: response.ok,
    data: data
  });

  if (!response.ok) {
    throw new Error(
      `Kie.ai API error: ${response.status} - ${data.message || data.msg || JSON.stringify(data)}`
    );
  }
  
  if (data.code !== 200) {
    throw new Error(
      `Kie.ai task creation failed: Code ${data.code} - ${data.message || data.msg || JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * Query the status of a task
 */
export async function queryTaskStatus(taskId: string): Promise<QueryTaskResponse> {
  if (!KIE_AI_API_KEY) {
    throw new Error('KIE_AI_API_KEY is not configured');
  }

  console.log('🔍 Querying Kie.ai task:', taskId);
  console.log('🔑 Using API Key:', KIE_AI_API_KEY?.substring(0, 10) + '...');
  console.log('🌐 API URL:', `${KIE_AI_API_URL}/jobs/recordInfo?taskId=${taskId}`);

  // Disable Next.js fetch cache - VIGTIGT!
  const response = await fetch(`${KIE_AI_API_URL}/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_AI_API_KEY}`,
    },
    cache: 'no-store',  // Next.js: aldrig cache denne request!
    next: { revalidate: 0 }  // Next.js: revalidate hver gang
  });

  const data = await response.json();
  
  console.log('📥 RAW Kie.ai Response:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('📊 Parsed Kie.ai data:');
  console.log('  - HTTP status:', response.status);
  console.log('  - Response code:', data.code);
  console.log('  - Response msg:', data.msg);
  console.log('  - Has data object:', !!data.data);
  
  if (data.data) {
    console.log('  - Task state:', data.data.state);
    console.log('  - Task ID:', data.data.taskId);
    console.log('  - Has resultJson:', !!data.data.resultJson);
    if (data.data.resultJson) {
      console.log('  - resultJson content:', data.data.resultJson);
      const parsed = JSON.parse(data.data.resultJson);
      console.log('  - Video URL:', parsed.resultUrls[0]);
    }
  }

  if (!response.ok || data.code !== 200) {
    throw new Error(
      `Kie.ai API error: ${response.status} - ${data.msg || data.message || 'Unknown error'}`
    );
  }

  return data;
}

/**
 * Parse the result JSON from a completed task
 */
export function parseTaskResult(resultJson: string): TaskResult {
  try {
    return JSON.parse(resultJson);
  } catch (error) {
    throw new Error('Failed to parse task result JSON');
  }
}

/**
 * Wait for task completion (polling)
 */
export async function waitForTaskCompletion(
  taskId: string,
  options?: {
    maxAttempts?: number;
    pollInterval?: number;
  }
): Promise<QueryTaskResponse> {
  const maxAttempts = options?.maxAttempts || 60; // 60 attempts
  const pollInterval = options?.pollInterval || 5000; // 5 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const response = await queryTaskStatus(taskId);

    if (response.data.state === 'success') {
      return response;
    }

    if (response.data.state === 'fail') {
      throw new Error(
        `Task failed: ${response.data.failMsg || 'Unknown error'} (Code: ${response.data.failCode})`
      );
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('Task timeout: Maximum polling attempts reached');
}

