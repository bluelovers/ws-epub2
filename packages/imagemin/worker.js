"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageminBufferWorker = void 0;
const worker_threads_1 = require("worker_threads");
const index_1 = __importStar(require("./index"));
const bluebird_1 = __importDefault(require("bluebird"));
const path_1 = require("path");
exports.imageminBufferWorker = function imageminBufferWorker(oldBuffer, options) {
    return null;
};
exports.default = exports.imageminBufferWorker;
if (worker_threads_1.isMainThread) {
    const __worker = (() => {
        let p = path_1.parse(__filename);
        return path_1.join(p.dir, p.name + '.js');
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
                if ((newBuffer === null || newBuffer === void 0 ? void 0 : newBuffer.length) > 0 && index_1.isAllowedBuffer(newBuffer = Buffer.from(newBuffer))) {
                    resolve(newBuffer);
                }
                else {
                    reject((_a = v.error) !== null && _a !== void 0 ? _a : index_1.newError());
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
                reject(index_1.newError());
                worker.terminate();
            });
        });
    }
    exports.imageminBufferWorker = exports.default = imageminBufferWorker;
}
else {
    let { oldBuffer, options, } = worker_threads_1.workerData;
    oldBuffer = Buffer.from(oldBuffer);
    index_1.default(oldBuffer, options)
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