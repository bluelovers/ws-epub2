/// <reference types="node" />

import _parseDataURL from 'data-urls';
import Bluebird from 'bluebird';
import MIMEType from 'whatwg-mimetype';
import validDataUrl from 'valid-data-url';

export interface IParseDataURL
{
	mime: string;
	charset: string;
	base64: boolean;
	/**
	 * The mimeType property is an instance of whatwg-mimetype's MIMEType class.
	 */
	mimeType: MIMEType;
	/**
	 * The body property is a Node.js Buffer instance.
	 */
	body: Buffer;
}

export function parseDataURL(url: string)
{
	return Bluebird.resolve(url)
		.then<IParseDataURL>((url) =>
		{

			const data = _parseDataURL(url) as {
				mimeType: MIMEType,
				body: Buffer,
			};

			const type = data.mimeType.type;
			const mime = data.mimeType.essence;
			const charset = data.mimeType.parameters?.get?.("charset");

			const parts = url.trim().match(validDataUrl.regex);

			let base64: boolean = parts?.[3]?.toLowerCase() === ';base64';

			return {
				...data,
				type,
				mime,
				charset,
				base64,
			}
		})
		;
}

export default parseDataURL;
