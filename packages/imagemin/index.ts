import Bluebird from 'bluebird';
import BluebirdCancellation from 'bluebird-cancellation';
import { TimeoutError } from 'bluebird';
import imagemin from 'imagemin';
import * as imageminJpegtran from 'imagemin-jpegtran';
import * as imageminPngquant from 'imagemin-pngquant';
import * as imageminOptipng from 'imagemin-optipng';
import * as imageminWebp from 'imagemin-webp';
import * as imageminMozjpeg from 'imagemin-mozjpeg';
import { ITSResolvable } from 'ts-type';
import console from 'debug-color2/logger';

export interface IOptions
{
	is_from_url?: boolean,
	imageminDebug?: boolean,
	imageminOptions?: {
		'imagemin-pngquant'?: imageminPngquant.Options,
		'imagemin-optipng'?: imageminOptipng.Options,
		'imagemin-webp'?: imageminWebp.Options,
		'imagemin-mozjpeg'?: imageminMozjpeg.Options,
		'imagemin-jpegtran': imageminJpegtran.Options,
	},
	imageminPlugins?: any[],
	imageminIgnore?: (keyof IOptions["imageminOptions"] | string)[],
	imageminTimeout?: number,
}

const skipRequireSet = new Set<string>();

export function tryRequireResolve(name: string | keyof IOptions["imageminOptions"])
{
	if (!skipRequireSet.has(name))
	{
		try
		{
			return require.resolve(name).length > 0
		}
		catch (e)
		{

		}
	}

	return false
}

export function imageminPlugins(options: IOptions)
{
	let plugins: any[] = [...options?.imageminPlugins ?? []];

	([
		'imagemin-optipng',
		'imagemin-jpegtran',
		'imagemin-webp',
		'imagemin-mozjpeg',
		'imagemin-pngquant',
	] as (keyof IOptions["imageminOptions"] | string)[])
		.forEach(name =>
		{

			if (options?.imageminIgnore?.includes?.(name))
			{
				return;
			}

			if (tryRequireResolve(name))
			{
				let opts = options?.imageminOptions?.[name];

				if (name === 'imagemin-pngquant')
				{
					/**
					 * 只壓縮從網路抓取的 PNG 圖片
					 */
					opts = {
						quality: options?.is_from_url ? [0.65, 1] : [0.9, 1],
						...opts,
					}
				}
				else if (name === 'imagemin-mozjpeg')
				{
					opts = {
						quality: options?.is_from_url ? undefined : 100,
						...opts,
					}
				}

				try
				{
					plugins.push(require(`${name}`)(opts))
				}
				catch (e)
				{
					skipRequireSet.add(name);
					options?.imageminDebug && console.error(e.toString())
				}
			}

		})
	;

	return plugins
}

export function imageminBuffer(oldBuffer: ITSResolvable<Buffer>, options?: IOptions)
{
	return Bluebird
		.resolve(oldBuffer)
		.then(function (_file)
		{
			let imageminTimeout = options?.imageminTimeout | 0

			if (imageminTimeout <= 0)
			{
				imageminTimeout = 5000;
			}

			let pc = BluebirdCancellation
				.resolve(imagemin.buffer(_file, {
					plugins: imageminPlugins(options),
				}))
			;

			return Bluebird.resolve(pc)
				.timeout(imageminTimeout)
				.tapCatch(TimeoutError, (e) =>
				{
					options?.imageminDebug && console.error(`imagemin 處理時間過久 ${imageminTimeout}ms 放棄壓縮此圖片`)
					pc.cancel();
				})
		})
		.then(function (newBuffer)
		{
			if (isAllowedBuffer(newBuffer))
			{
				return newBuffer
			}

			return Promise.reject(newError())
		})
		;
}

export function isAllowedBuffer(newBuffer: any): newBuffer is Buffer
{
	return (Buffer.isBuffer(newBuffer) && newBuffer.length > 0)
}

export function newError()
{
	return new Error(`unknown`)
}

export default imageminBuffer

