"use strict";
/// <reference types="node" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDataURL = void 0;
const data_urls_1 = __importDefault(require("data-urls"));
const bluebird_1 = __importDefault(require("bluebird"));
const valid_data_url_1 = __importDefault(require("valid-data-url"));
function parseDataURL(url) {
    return bluebird_1.default.resolve(url)
        .then((url) => {
        var _a, _b, _c;
        const data = data_urls_1.default(url);
        const type = data.mimeType.type;
        const mime = data.mimeType.essence;
        const charset = (_b = (_a = data.mimeType.parameters) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, "charset");
        const parts = url.trim().match(valid_data_url_1.default.regex);
        let base64 = ((_c = parts === null || parts === void 0 ? void 0 : parts[3]) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === ';base64';
        return {
            ...data,
            type,
            mime,
            charset,
            base64,
        };
    });
}
exports.parseDataURL = parseDataURL;
exports.default = parseDataURL;
//# sourceMappingURL=index.js.map