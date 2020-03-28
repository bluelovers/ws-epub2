"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageminBuffer = exports.imageminPlugins = exports.tryRequireResolve = void 0;
const bluebird_1 = __importDefault(require("bluebird"));
const bluebird_cancellation_1 = __importDefault(require("bluebird-cancellation"));
const bluebird_2 = require("bluebird");
const imagemin_1 = __importDefault(require("imagemin"));
const logger_1 = __importDefault(require("debug-color2/logger"));
function tryRequireResolve(name) {
    try {
        return require.resolve(name).length > 0;
    }
    catch (e) {
    }
    return false;
}
exports.tryRequireResolve = tryRequireResolve;
function imageminPlugins(options) {
    var _a;
    let plugins = [...(_a = options === null || options === void 0 ? void 0 : options.imageminPlugins) !== null && _a !== void 0 ? _a : []];
    [
        'imagemin-optipng',
        'imagemin-jpegtran',
        'imagemin-webp',
        'imagemin-mozjpeg',
        'imagemin-pngquant',
    ]
        .forEach(name => {
        var _a, _b, _c;
        if ((_b = (_a = options === null || options === void 0 ? void 0 : options.imageminIgnore) === null || _a === void 0 ? void 0 : _a.includes) === null || _b === void 0 ? void 0 : _b.call(_a, name)) {
            return;
        }
        if (tryRequireResolve(name)) {
            let opts = (_c = options === null || options === void 0 ? void 0 : options.imageminOptions) === null || _c === void 0 ? void 0 : _c[name];
            if (name === 'imagemin-pngquant') {
                /**
                 * 只壓縮從網路抓取的 PNG 圖片
                 */
                opts = {
                    quality: (options === null || options === void 0 ? void 0 : options.is_from_url) ? [0.65, 1] : [0.9, 1],
                    ...opts,
                };
            }
            else if (name === 'imagemin-mozjpeg') {
                opts = {
                    quality: (options === null || options === void 0 ? void 0 : options.is_from_url) ? undefined : 100,
                    ...opts,
                };
            }
            plugins.push(require(`${name}`)(opts));
        }
    });
    return plugins;
}
exports.imageminPlugins = imageminPlugins;
function imageminBuffer(oldBuffer, options) {
    return bluebird_1.default
        .resolve(oldBuffer)
        .then(function (_file) {
        let imageminTimeout = (options === null || options === void 0 ? void 0 : options.imageminTimeout) | 0;
        if (imageminTimeout <= 0) {
            imageminTimeout = 5000;
        }
        let pc = bluebird_cancellation_1.default
            .resolve(imagemin_1.default.buffer(_file, {
            plugins: imageminPlugins(options),
        }));
        return bluebird_1.default.resolve(pc)
            .timeout(imageminTimeout)
            .tapCatch(bluebird_2.TimeoutError, (e) => {
            (options === null || options === void 0 ? void 0 : options.imageminDebug) && logger_1.default.error(`imagemin 處理時間過久 ${imageminTimeout}ms 放棄壓縮此圖片`);
            pc.cancel();
        });
    })
        .then(function (newBuffer) {
        if (Buffer.isBuffer(newBuffer) && newBuffer.length > 0) {
            return newBuffer;
        }
        return Promise.reject(new Error(`unknown`));
    });
}
exports.imageminBuffer = imageminBuffer;
exports.default = imageminBuffer;
//# sourceMappingURL=index.js.map