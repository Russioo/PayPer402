// Veo 3.1 API Integration (via Kie.ai)

const VEO_AI_API_URL = process.env.VEO_AI_API_URL || 'https://api.kie.ai/api/v1';
const VEO_AI_API_KEY = process.env.VEO_AI_API_KEY || process.env.KIE_AI_API_KEY;

export interface CreateVeoTaskRequest {
  prompt: string;
  imageUrls?: string[];
  model?: 'veo3' | 'veo3_fast';
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number;
  callBackUrl?: string;
  enableTranslation?: boolean;
  watermark?: string;
}

export interface CreateVeoTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface QueryVeoTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    paramJson?: string;
    completeTime?: string;
    response?: {
      taskId: string;
      resultUrls: string[];
      originUrls?: string[];
      resolution?: string;
    };
    successFlag: 0 | 1 | 2 | 3;  // 0: Generating, 1: Success, 2: Failed, 3: Generation Failed
    errorCode?: number;
    errorMessage?: string;
    createTime: string;
    fallbackFlag?: boolean;
  };
}

export interface VeoTaskResult {
  resultUrls: string[];
  resultWaterMarkUrls?: string[];
}

/**
 * Create a new Veo 3.1 generation task
 */
export async function createVeoTask(
  prompt: string,
  options?: {
    aspectRatio?: '16:9' | '9:16' | 'Auto';
    imageUrls?: string[];
    generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';
    seeds?: number;
    callBackUrl?: string;
  }
): Promise<CreateVeoTaskResponse> {
  if (!VEO_AI_API_KEY) {
    throw new Error('VEO_AI_API_KEY is not configured');
  }

  const requestBody: CreateVeoTaskRequest = {
    prompt,
    model: 'veo3_fast', // Kun fast model
    aspectRatio: options?.aspectRatio || '16:9',
    enableTranslation: true,
  };

  // Tilføj imageUrls hvis de er angivet
  if (options?.imageUrls && options.imageUrls.length > 0) {
    requestBody.imageUrls = options.imageUrls;
    
    // Automatisk bestem generationType baseret på antal billeder
    if (!options.generationType) {
      if (options.imageUrls.length === 1) {
        requestBody.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      } else if (options.imageUrls.length === 2) {
        requestBody.generationType = 'FIRST_AND_LAST_FRAMES_2_VIDEO';
      } else if (options.imageUrls.length >= 3) {
        requestBody.generationType = 'REFERENCE_2_VIDEO';
      }
    } else {
      requestBody.generationType = options.generationType;
    }
  } else {
    requestBody.generationType = 'TEXT_2_VIDEO';
  }

  // Tilføj seeds hvis angivet
  if (options?.seeds) {
    requestBody.seeds = options.seeds;
  }

  // Tilføj callback URL hvis angivet
  if (options?.callBackUrl) {
    requestBody.callBackUrl = options.callBackUrl;
  }

  console.log('🎬 Creating Veo 3.1 task:', requestBody);

  const response = await fetch(`${VEO_AI_API_URL}/veo/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VEO_AI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store',
  });

  const data = await response.json();
  
  console.log('Veo Response:', {
    status: response.status,
    ok: response.ok,
    data: data
  });

  if (!response.ok || data.code !== 200) {
    throw new Error(
      `Veo API error: ${response.status} - ${data.msg || JSON.stringify(data)}`
    );
  }

  return data;
}

/**
 * Query the status of a Veo task
 */
export async function queryVeoTaskStatus(taskId: string): Promise<QueryVeoTaskResponse> {
  if (!VEO_AI_API_KEY) {
    throw new Error('VEO_AI_API_KEY is not configured');
  }

  console.log('🔍 Querying Veo task:', taskId);
  console.log('🔑 Using API Key:', VEO_AI_API_KEY?.substring(0, 10) + '...');
  console.log('🌐 API URL:', `${VEO_AI_API_URL}/veo/record-info?taskId=${taskId}`);

  const response = await fetch(`${VEO_AI_API_URL}/veo/record-info?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VEO_AI_API_KEY}`,
    },
    cache: 'no-store',
    next: { revalidate: 0 }
  });

  const data = await response.json();
  
  console.log('📥 RAW Veo Response:');
  console.log(JSON.stringify(data, null, 2));
  
  console.log('📊 Parsed Veo data:');
  console.log('  - HTTP status:', response.status);
  console.log('  - Response code:', data.code);
  console.log('  - Response msg:', data.msg);
  console.log('  - Has data object:', !!data.data);
  
  if (data.data) {
    console.log('  - Success flag:', data.data.successFlag);
    console.log('  - Task ID:', data.data.taskId);
    console.log('  - Has response:', !!data.data.response);
    if (data.data.response && data.data.response.resultUrls) {
      console.log('  - Video URLs:', data.data.response.resultUrls);
      console.log('  - First video URL:', data.data.response.resultUrls[0]);
    }
  }

  if (!response.ok || data.code !== 200) {
    throw new Error(
      `Veo API error: ${response.status} - ${data.msg || 'Unknown error'}`
    );
  }

  return data;
}

/**
 * Parse the result from a completed Veo task
 */
export function parseVeoTaskResult(response: QueryVeoTaskResponse['data']['response']): VeoTaskResult {
  if (!response || !response.resultUrls) {
    throw new Error('No result URLs in Veo response');
  }
  
  return {
    resultUrls: response.resultUrls,
  };
}

