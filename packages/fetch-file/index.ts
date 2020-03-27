import hashSum from 'hash-sum';
import Bluebird from 'bluebird';
import { fromBuffer as fileType } from 'file-type';
import { readFile } from 'fs-extra';
import fetch from 'cross-fetch';
import { basename, extname } from 'upath2';
import { RequestInit as IRequestInitNodeFetch } from 'node-fetch';
import imageminBuffer, { IOptions as IOptions2 } from '@node-novel/imagemin';
import { ITSResolvable } from 'ts-type';

export interface IFiles
{
	url?: string,
	file?: string,

	folder?: string,
	name?: string,

	basename?: string,
	ext?: string,
	mime?: string,
	data?;

	is?: string,
	href?: string,
}

export interface IOptions extends IOptions2
{
	fetchOptions?: RequestInit & IRequestInitNodeFetch,
}

/**
 * 處理附加檔案 本地檔案 > url
 */
export function fetchFileOrUrl(file: ITSResolvable<IFiles>, options?: IOptions)
{
	return Bluebird.resolve(file)
		.then(async (file) =>
		{

			let _file: Buffer;
			let err: Error;

			if (file.data)
			{
				_file = file.data;
			}

			let is_from_url: boolean;

			if (!_file && file.file)
			{
				_file = await readFile(file.file);
			}

			if (!_file && file.url)
			{
				_file = await fetch(file.url, options?.fetchOptions)
					.then(function (ret)
					{
						//console.log(file.name, ret.type, ret.headers);

						if (!file.mime)
						{
							let c = ret.headers.get('content-type');

							if (Array.isArray(c))
							{
								file.mime = c[0];
							}
							else if (typeof c === 'string')
							{
								file.mime = c;
							}
						}

						try
						{
							// @ts-ignore
							if (!file.name && !file.basename && ret.headers.raw()['content-disposition'][0].match(/filename=(['"])?([^\'"]+)\1/))
							{
								let filename = RegExp.$2;

								file.name = basename(filename);

								//console.log(file.name);
							}
						}
						catch (e)
						{

						}

						//console.log(ret.headers, ret.headers.raw()['content-disposition'][0]);
						//.getResponseHeader('Content-Disposition')

						// @ts-ignore
						return ret.buffer()
					})
					.then(buf =>
					{

						if (buf)
						{
							is_from_url = true;
						}

						return buf;
					})
					.catch(function (e)
					{
						is_from_url = false;

						err = e;

						return null;
					})
				;
			}

			if (_file && typeof window === 'undefined')
			{
				await imageminBuffer(_file, {
					imageminDebug: true,
					...options,
					is_from_url,
				})
					.then(buf =>
					{
						if (buf?.length)
						{
							_file = buf
						}
					})
					.catch(function (e)
					{
						console.error('[ERROR] imagemin 發生錯誤，本次將忽略處理此檔案', e.toString().replace(/^\s+|\s+$/, ''), file);
						//console.error(e);
					})
				;
			}

			if (!_file)
			{
				let e = err || new ReferenceError();
				// @ts-ignore
				e.data = file;

				throw e;
			}

			if (file.name && file.ext !== '')
			{
				file.ext = file.ext || extname(file.name);

				if (!file.ext)
				{
					file.ext = null;
				}
			}

			if (!file.ext || !file.mime)
			{
				let data = await fileType(_file);

				if (data)
				{
					if (file.ext !== '')
					{
						file.ext = file.ext || '.' + data.ext;
					}

					file.mime = file.mime || data.mime;
				}
				else if (file.ext !== '')
				{
					file.ext = file.ext || '.unknow';
				}
			}

			if (!file.name)
			{
				file.name = (file.basename || hashSum(file)) + file.ext;
			}

			file.data = _file;

			return file;
		})
}

export default fetchFileOrUrl
