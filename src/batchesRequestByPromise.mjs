import axios from 'axios';

/**
 * request 且有重試機制
 * @param {*} endpoint API URL
 * @param {*} maxAttempts 最大重試次數
 * @returns {Promise<any>} 請求結果或錯誤
 */
function sendRequest (endpoint, maxAttempts = 0) {
  let attempts = 0;

  function httpRequest() {
    return axios.get(endpoint)
      .then((response) => {
        console.log(`成功取得資料：${endpoint}`);
        return response.data;
      })
      .catch((error) => {
        attempts++;
        console.error(`錯誤發生於 ${endpoint}，嘗試次數：${attempts}`);
        if (attempts < maxAttempts) {
          // 如果尚未達到最大重試次數，則重新嘗試
          return httpRequest();
        } else {
          // 達到最大重試次數，返回特殊的錯誤對象表示請求失敗
          console.error(`達到最大重試次數，放棄請求：${endpoint}`);
          return { error: '達到最大重試次數' };
        }
      });
  }

  return httpRequest();
};

/**
 * 批次處理
 * @param {string[]} batch 批次中的 API URL
 * @param {number} maxAttempts 最大重試次數
 */
function processBatch (batch, maxAttempts = 0) {
  const batchPromises = batch.map((endpoint) => sendRequest(endpoint, maxAttempts));
  
  return Promise.all(batchPromises)
    .then((batchResults) => {
      console.log('Process Batch Results', batchResults);
      return batchResults.filter((result) => !!result && !result.error);
    });
};

/**
 * 處理所有 batches request
 * @param {string[][]} batches 所有批次的數組
 * @param {number} maxAttempts 最大重試次數
 * @param {number} delay 延遲（毫秒）
 */
function sendBatchesRequestByPromise (batches, maxAttempts = 0, delay = 0) {  
  // console.log('get batches: ', batches)
  const results = [];  

  return batches.reduce((promise, batch, currentIndex) => {
    return promise.then(() => {
      return new Promise((resolve) => {
        // console.log('currentIndex', currentIndex)
        setTimeout(() => {
          resolve(processBatch(batch, maxAttempts)
            .then((batchResults) => {
              results.push(...batchResults);
            }))
        }, currentIndex === 0 ? 0 : delay);
      })
    });
  }, Promise.resolve())
    .then(() => results);
};


// sendBatchesRequestByPromise(getBatches, 1, 2000)
//   .then((data) => {
//     console.log('所有請求完成');
//     console.log(data);
//   })
//   .catch((error) => {
//     console.error('請求失敗：', error);
//   });


export default sendBatchesRequestByPromise;