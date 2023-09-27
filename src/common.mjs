export function getBatchesByReduce(urls, chunkSize = 5) {
  return urls.reduce((result, url, index) => {
    const batchIndex = Math.floor(index / chunkSize);
    if (!result[batchIndex]) {
        result[batchIndex] = [];
    }
    result[batchIndex].push(url);
    return result;
  }, []);
}

