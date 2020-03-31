/// <reference types="node" />
import { IOptions } from './index';
import Bluebird from 'bluebird';
export declare const imageminBufferWorker: (oldBuffer: Buffer | PromiseLike<Buffer>, options?: IOptions) => Bluebird<Buffer>;
export default imageminBufferWorker;
