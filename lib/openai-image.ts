const IMAGE_4O_API_KEY = process.env.IMAGE_4O_API_KEY;
const KIE_API_BASE = 'https://api.kie.ai';

interface Generate4oImageOptions {
  prompt: string;
  size?: '1:1' | '3:2' | '2:3';
  nVariants?: 1 | 2 | 4;
  filesUrl?: string[];
  isEnhance?: boolean;
}

export async function create4oImageTask(options: Generate4oImageOptions) {
  const { prompt, size = '1:1', nVariants = 1, filesUrl, isEnhance = false } = options;

  try {
    const response = await fetch(`${KIE_API_BASE}/api/v1/gpt4o-image/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IMAGE_4O_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        size,
        nVariants,
        filesUrl,
        isEnhance,
        uploadCn: false,
        enableFallback: false,
      }),
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.msg || 'Failed to create 4o image task');
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error('4o Image task creation failed:', error);
    throw error;
  }
}

export async function query4oImageStatus(taskId: string) {
  try {
    const response = await fetch(
      `${KIE_API_BASE}/api/v1/gpt4o-image/record-info?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${IMAGE_4O_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.msg || 'Failed to query task status');
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error('4o Image status query failed:', error);
    throw error;
  }
}

