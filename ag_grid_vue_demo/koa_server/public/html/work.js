/*
 * @Author: junsong Chen 779217162@qq.com
 * @Date: 2023-08-18 15:06:31
 * @LastEditTime: 2023-08-18 16:24:51
 * @Description: 
 */
// worker.js

// 接收文件对象及切片大小
function onmessage(file, DefualtChunkSize) {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        chunks = Math.ceil(file.size / DefualtChunkSize),
        currentChunk = 0,
        spark = new SparkMD5.ArrayBuffer(),
        fileReader = new FileReader();

    fileReader.onload = function (e) {
        console.log('read chunk nr', currentChunk + 1, 'of');

        const chunk = e.target.result;
        spark.append(chunk);
        currentChunk++;

        if (currentChunk < chunks) {
            loadNext();
        } else {
            let fileHash = spark.end();
            console.info('finished computed hash', fileHash);
            // 此处为重点，计算完成后，仍然通过postMessage通知主线程
            postMessage({
                fileHash,
                fileReader
            })
        }
    };

    fileReader.onerror = function () {
        console.warn('oops, something went wrong.');
    };

    function loadNext() {
        let start = currentChunk * DefualtChunkSize,
            end = ((start + DefualtChunkSize) >= file.size) ? file.size : start + DefualtChunkSize;
        let chunk = blobSlice.call(file, start, end);
        fileReader.readAsArrayBuffer(chunk);
    }

    loadNext();
}