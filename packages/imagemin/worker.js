"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageminBufferWorker = void 0;
const tslib_1 = require("tslib");
const worker_threads_1 = require("worker_threads");
const index_1 = (0, tslib_1.__importStar)(require("./index"));
const bluebird_1 = (0, tslib_1.__importDefault)(require("bluebird"));
const path_1 = require("path");
const imageminBufferWorker = function imageminBufferWorker(oldBuffer, options) {
    return null;
};
exports.imageminBufferWorker = imageminBufferWorker;
exports.default = exports.imageminBufferWorker;
if (worker_threads_1.isMainThread) {
    const __worker = (() => {
        let p = (0, path_1.parse)(__filename);
        return (0, path_1.join)(p.dir, p.name + '.js');
    })();
    function imageminBufferWorker(oldBuffer, options) {
        return new bluebird_1.default(async (resolve, reject) => {
            oldBuffer = await oldBuffer;
            const worker = new worker_threads_1.Worker(__worker, {
                workerData: {
                    oldBuffer,
                    options,
                },
            });
            worker.on('message', (v) => {
                var _a;
                let newBuffer = v.newBuffer;
                if ((newBuffer === null || newBuffer === void 0 ? void 0 : newBuffer.length) > 0 && (0, index_1.isAllowedBuffer)(newBuffer = Buffer.from(newBuffer))) {
                    resolve(newBuffer);
                }
                else {
                    reject((_a = v.error) !== null && _a !== void 0 ? _a : (0, index_1.newError)());
                }
                worker.terminate();
            });
            worker.on('error', (e) => {
                reject(e);
                worker.terminate();
            });
            worker.on('exit', (code) => {
                if (code !== 0) {
                    //console.error(`Worker stopped with exit code ${code}`)
                }
                reject((0, index_1.newError)());
                worker.terminate();
            });
        });
    }
    exports.imageminBufferWorker = exports.default = imageminBufferWorker;
}
else {
    let { oldBuffer, options, } = worker_threads_1.workerData;
    oldBuffer = Buffer.from(oldBuffer);
    (0, index_1.default)(oldBuffer, options)
        .then(newBuffer => {
        worker_threads_1.parentPort.postMessage({
            newBuffer,
        });
    })
        .catch(error => {
        worker_threads_1.parentPort.postMessage({
            error,
        });
    });
}
//# sourceMappingURL=worker.js.map