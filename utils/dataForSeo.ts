import pLimit from 'p-limit';

const API_CONCURRENCY = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface DataForSeoTask {
  location_code: string;
  language_name: string;
  keyword: string;
  device: string;
  priority: number;
  pingback_url?: string;
  tag?: string;
}

interface DataForSeoResult {
  success: boolean;
  taskId?: string;
  error?: any;
  data?: any;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryFetch(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      await sleep(RETRY_DELAY);
      return retryFetch(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return retryFetch(url, options, retries - 1);
    }
    throw error;
  }
}

export async function getDataForSeoCredentials() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    throw new Error('Missing DataForSEO credentials');
  }
  
  return {
    login,
    password,
    authHeader: 'Basic ' + btoa(`${login}:${password}`)
  };
}

export async function createDataForSeoTasks(tasks: DataForSeoTask[], searchEngine: string): Promise<DataForSeoResult> {
  try {
    const { authHeader } = await getDataForSeoCredentials();
    console.log('authHeader', authHeader)
    
    const response = await retryFetch(`https://api.dataforseo.com/v3/serp/${searchEngine}/organic/task_post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify(tasks)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create tasks: ${response.statusText}`);
    }
    
    const resultData = await response.json();
    if (resultData?.tasks?.[0]?.status_code !== 20100) {
      throw new Error(`API returned error: ${JSON.stringify(resultData?.tasks?.[0]?.status_message)}`);
    }
    
    return {
      success: true,
      data: resultData.tasks
    };
  } catch (error) {
    console.error('Error creating DataForSEO tasks:', error);
    return {
      success: false,
      error
    };
  }
}

export async function getDataForSeoTaskResults(taskIds: string[], searchEngine: string) {
  const { authHeader } = await getDataForSeoCredentials();
  const limit = pLimit(API_CONCURRENCY);
  
  const results = await Promise.all(
    taskIds.map(taskId => 
      limit(async () => {
        try {
          const response = await retryFetch(
            `https://api.dataforseo.com/v3/serp/${searchEngine}/organic/task_get/regular/${taskId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader
              }
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to get task ${taskId}: ${response.statusText}`);
          }
          
          const resultData = await response.json();
          return {
            success: true,
            taskId,
            data: resultData
          };
        } catch (error) {
          console.error(`Error fetching task ${taskId}:`, error);
          return {
            success: false,
            taskId,
            error
          };
        }
      })
    )
  );
  
  return results;
}
