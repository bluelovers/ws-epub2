"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFileOrUrl = void 0;
const hash_sum_1 = __importDefault(require("hash-sum"));
const bluebird_1 = __importDefault(require("bluebird"));
const file_type_1 = require("file-type");
const fs_extra_1 = require("fs-extra");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const upath2_1 = require("upath2");
const logger_1 = __importDefault(require("debug-color2/logger"));
const worker_1 = __importDefault(require("@node-novel/imagemin/worker"));
// @ts-ignore
const abort_controller_1 = __importDefault(require("abort-controller"));
const parse_data_urls_1 = __importDefault(require("parse-data-urls"));
/**
 * 處理附加檔案 本地檔案 > url
 */
function fetchFileOrUrl(file, options) {
    return bluebird_1.default.resolve(file)
        .then(async (file) => {
        var _a;
        let _file;
        let err;
        if (file.data) {
            _file = file.data;
        }
        let is_from_url;
        if (!_file && file.file) {
            _file = await fs_extra_1.readFile(file.file);
        }
        if (!_file && file.url) {
            /**
             * support data url
             */
            await parse_data_urls_1.default(file.url)
                .then(data => {
                var _a;
                if (!file.mime && (data === null || data === void 0 ? void 0 : data.mime)) {
                    file.mime = data.mime;
                }
                if (((_a = data === null || data === void 0 ? void 0 : data.body) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    _file = data.body;
                    is_from_url = true;
                }
            })
                .catch(e => {
                err = e;
                is_from_url = false;
            });
        }
        if (!_file && file.url) {
            let fetchOptions = {
                timeout: options === null || options === void 0 ? void 0 : options.timeout,
                ...((_a = options === null || options === void 0 ? void 0 : options.fetchOptions) !== null && _a !== void 0 ? _a : {})
            };
            fetchOptions.timeout |= 0;
            if (fetchOptions.timeout <= 0) {
                fetchOptions.timeout = 30 * 1000;
            }
            let timer;
            if (!fetchOptions.signal) {
                const controller = new abort_controller_1.default();
                timer = setTimeout(() => controller.abort(), fetchOptions.timeout);
                fetchOptions.signal = controller.signal;
            }
            _file = await cross_fetch_1.default(file.url, fetchOptions)
                .then(function (ret) {
                //console.log(file.name, ret.type, ret.headers);
                if (!file.mime) {
                    let c = ret.headers.get('content-type');
                    if (Array.isArray(c)) {
                        file.mime = c[0];
                    }
                    else if (typeof c === 'string') {
                        file.mime = c;
                    }
                }
                try {
                    // @ts-ignore
                    if (!file.name && !file.basename && ret.headers.raw()['content-disposition'][0].match(/filename=(['"])?([^\'"]+)\1/)) {
                        let filename = RegExp.$2;
                        file.name = upath2_1.basename(filename);
                        //console.log(file.name);
                    }
                }
                catch (e) {
                }
                //console.log(ret.headers, ret.headers.raw()['content-disposition'][0]);
                //.getResponseHeader('Content-Disposition')
                // @ts-ignore
                return ret.buffer();
            })
                .then(buf => {
                if (buf) {
                    is_from_url = true;
                }
                return buf;
            })
                .catch(function (e) {
                is_from_url = false;
                err = e;
                return null;
            });
            timer && clearTimeout(timer);
        }
        if (_file && typeof window === 'undefined') {
            const { imageminDebug = true } = options || {};
            await worker_1.default(_file, {
                imageminDebug,
                ...options,
                is_from_url,
            })
                .then(buf => {
                if (buf === null || buf === void 0 ? void 0 : buf.length) {
                    _file = buf;
                }
            })
                .catch(function (e) {
                imageminDebug && logger_1.default.error('[ERROR] imagemin 發生錯誤，本次將忽略處理此檔案', e.toString().replace(/^\s+|\s+$/, ''), file);
                //console.error(e);
            });
        }
        if (!_file) {
            let e = err || new ReferenceError(`未知錯誤 導致 處理資料為空`);
            // @ts-ignore
            e.data = file;
            throw e;
        }
        if (file.name && file.ext !== '') {
            file.ext = file.ext || upath2_1.extname(file.name);
            if (!file.ext) {
                file.ext = null;
            }
        }
        if (!file.ext || !file.mime) {
            let data = await file_type_1.fromBuffer(_file);
            if (data) {
                if (file.ext !== '') {
                    file.ext = file.ext || '.' + data.ext;
                }
                file.mime = file.mime || data.mime;
            }
            else if (file.ext !== '') {
                file.ext = file.ext || '.unknow';
            }
        }
        if (!file.name) {
            file.name = (file.basename || hash_sum_1.default(file)) + file.ext;
        }
        file.data = _file;
        return file;
    });
}
exports.fetchFileOrUrl = fetchFileOrUrl;
exports.default = fetchFileOrUrl;
//# sourceMappingURL=index.js.map