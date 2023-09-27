import apiEndpoints from './apiEndpoints.mjs';
import { getBatchesByReduce } from "./common.mjs";

// Promise 版本
import sendBatchesRequestByPromise from "./batchesRequestByPromise.mjs";
// Promise 版本
// import sendBatchesRequestAllSettled from "./batchesRequestByAllSettled.mjs";
// Async 版本
// import batchesRequestByAsync from "./batchesRequestAsync.mjs"

const maxConcurrentRequests = 3;
const delay = 1500;
const getBatches = getBatchesByReduce(apiEndpoints, maxConcurrentRequests);
console.log(delay, getBatches);

sendBatchesRequestByPromise(getBatches, maxConcurrentRequests, delay)
  .then((data) => {
      console.log('所有請求完成');
      console.log('sendBatchesRequestByPromise: ', data);
    })
    .catch((error) => {
      console.error('請求失敗：', error);
    });
  

// batchesRequestByAsync(getBatches, maxConcurrentRequests, delay)
//   .then((data) => {
//       console.log('所有請求完成');
//       console.log('batchesRequestByAsync: ', data);
//     })
//     .catch((error) => {
//       console.error('請求失敗：', error);
//     });

// sendBatchesRequestAllSettled(getBatches, maxConcurrentRequests, delay)
//   .then((data) => {
//       console.log('所有請求完成');
//       console.log('batchesRequestByAsync: ', data);
//     })
//     .catch((error) => {
//       console.error('請求失敗：', error);
//     });