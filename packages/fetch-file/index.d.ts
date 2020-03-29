import Bluebird from 'bluebird';
import { RequestInit as IRequestInitNodeFetch } from 'node-fetch';
import { IOptions as IOptions2 } from '@node-novel/imagemin';
import { ITSResolvable } from 'ts-type';
export interface IFiles {
    url?: string;
    file?: string;
    folder?: string;
    name?: string;
    basename?: string;
    ext?: string;
    mime?: string;
    data?: any;
    is?: string;
    href?: string;
}
export interface IOptions extends IOptions2 {
    fetchOptions?: RequestInit & IRequestInitNodeFetch;
    timeout?: number;
}
/**
 * 處理附加檔案 本地檔案 > url
 */
export declare function fetchFileOrUrl(file: ITSResolvable<IFiles>, options?: IOptions): Bluebird<IFiles>;
export default fetchFileOrUrl;
