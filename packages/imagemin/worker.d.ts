/// <reference types="node" />
import { ITSResolvable } from 'ts-type';
import { IOptions } from './index';
import Bluebird from 'bluebird';
export declare const imageminBufferWorker: (oldBuffer: ITSResolvable<Buffer>, options?: IOptions) => Bluebird<Buffer>;
export default imageminBufferWorker;
