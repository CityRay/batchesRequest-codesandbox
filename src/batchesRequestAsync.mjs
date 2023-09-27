import axios from 'axios';

/**
 * request 且有重試機制
 * @param {*} endpoint API URL
 * @param {*} maxAttempts 最大重試次數
 * @returns {Promise<any>} 請求結果或錯誤
 */
async function sendRequestAsync(endpoint, maxAttempts = 0) {
  let attempts = 0;

  async function httpRequest() {
    try {
      const response = await axios.get(endpoint);
      console.log(`成功獲取資料：${endpoint}`);
      return response.data;
    } catch (error) {
      attempts++;
      console.error(`錯誤發生於${endpoint}，嘗試次數：${attempts}`);
      if (attempts < maxAttempts) {
        // 如果尚未達到最大重試次數，則重新嘗試
        return httpRequest();
      } else {
        // 達到最大重試次數，返回特殊的錯誤對象表示請求失敗
        console.error(`達到最大重試次數，放棄請求：${endpoint}`);
        return { error: '達到最大重試次數' };
      }
    }
  }

  return httpRequest();
}

// 
/**
 * 批次處理
 * @param {string[]} batch 批次中的 API URL
 * @param {number} maxAttempts 最大重試次數
 * @returns {Promise<any[]>}
 */
async function processBatchAsync(batch, maxAttempts = 0) {
  const batchResults = [];

  for (const endpoint of batch) {
    const result = await sendRequestAsync(endpoint, maxAttempts);
    if (result && !result.error) {
      batchResults.push(result);
    }
  }

  return batchResults;
}

/**
 * async 處理 batches request
 * @param {string[][]} batches 所有批次的數組
 * @param {number} maxAttempts 最大重試次數
 * @param {number} delay 延遲（毫秒）
 */
async function sendBatchesRequestAsync(batches, maxAttempts = 0, delay = 0) {
  const results = [];
  
  for (let index = 0; index < batches.length; index++) {
    if (index > 0) {
      // delay
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const batchResults = await processBatchAsync(batches[index], maxAttempts);
    results.push(...batchResults);
    console.log(`Async 批次 ${index + 1} 完成`);
  }

  return results;
}

export default sendBatchesRequestAsync;