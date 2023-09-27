import axios from 'axios';

/**
 * Request 且有重試機制的請求
 * @param {string} endpoint API URL
 * @param {number} maxAttempts 最大重試次數
 * @returns {Promise<any>} 請求結果或錯誤
 */
async function sendRequestAsync(endpoint, maxAttempts = 0) {
  let attempts = 0;

  async function httpRequest() {
    try {
      const response = await axios.get(endpoint);
      console.log(`成功取得資料：${endpoint}`);
      return response.data;
    } catch (error) {
      attempts++;
      console.error(`錯誤發生於 ${endpoint}，嘗試次數：${attempts}`);
      if (attempts < maxAttempts) {
        // 如果尚未達到最大重試次數，則重新嘗試
        return httpRequest();
      } else {
        // 達到最大重試次數，拋出錯誤
        console.error(`達到最大重試次數，放棄請求：${endpoint}`);
        throw new Error(`達到最大重試次數，放棄請求：${endpoint}`);
      }
    }
  }

  return httpRequest();
}

/**
 * 批次處理 Request
 * @param {string[]} batch 批次中的 API URL
 * @param {number} maxAttempts 最大重試次數
 * @returns {Promise<any[]>} 批次內請求結果的數組
 */
async function processBatchAsync(batch, maxAttempts = 0) {
  const batchPromises = batch.map((endpoint) => sendRequestAsync(endpoint, maxAttempts));
  
  // Can i use: https://caniuse.com/mdn-javascript_builtins_promise_allsettled
  const settledPromises = await Promise.allSettled(batchPromises);

  const batchResults = settledPromises
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  console.log('Process Batch Results', batchResults);
  return batchResults;
}

/**
 * 批次處理所有請求
 * @param {string[][]} batches 所有批次
 * @param {number} maxAttempts 最大重試次數
 * @param {number} delay 延遲（毫秒）
 * @returns {Promise<any[]>} 所有請求的結果數組
 */
async function sendBatchesRequestAllSettled (batches, maxAttempts = 0, delay = 0) {  
  const results = [];  

  for (let index = 0; index < batches.length; index++) {
    if (index > 0) {
      // delay
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const batchResults = await processBatchAsync(batches[index], maxAttempts);
    results.push(...batchResults);
    console.log(`批次 ${index + 1} 完成`);
  }

  return results;
}

export default sendBatchesRequestAllSettled;