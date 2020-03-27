/// <reference types="node" />
import Bluebird from 'bluebird';
import * as imageminJpegtran from 'imagemin-jpegtran';
import * as imageminPngquant from 'imagemin-pngquant';
import * as imageminOptipng from 'imagemin-optipng';
import * as imageminWebp from 'imagemin-webp';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import { ITSResolvable } from 'ts-type';
export interface IOptions {
    is_from_url?: boolean;
    imageminDebug?: boolean;
    imageminOptions?: {
        'imagemin-pngquant'?: imageminPngquant.Options;
        'imagemin-optipng'?: imageminOptipng.Options;
        'imagemin-webp'?: imageminWebp.Options;
        'imagemin-mozjpeg'?: imageminMozjpeg.Options;
        'imagemin-jpegtran': imageminJpegtran.Options;
    };
    imageminPlugins?: any[];
    imageminIgnore?: (keyof IOptions["imageminOptions"] | string)[];
    imageminTimeout?: number;
}
export declare function tryRequireResolve(name: string | keyof IOptions["imageminOptions"]): boolean;
export declare function imageminPlugins(options: IOptions): any[];
export declare function imageminBuffer(oldBuffer: ITSResolvable<Buffer>, options?: IOptions): Bluebird<Buffer>;
export default imageminBuffer;
