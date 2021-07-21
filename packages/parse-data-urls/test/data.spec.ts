/**
 * Created by user on 2020/3/31.
 */

import parseDataURL from '../index';
import { readFile, outputFile } from 'fs-extra';
import { join } from 'path';

describe('base64', function ()
{

	it('should decode', async () => {

		const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

		const data = await parseDataURL(url);

		expect(data).toMatchObject({
			type: 'image',
			mime: 'image/png',
			base64: true,
		});

		expect(Buffer.isBuffer(data.body) || data.body instanceof Uint8Array).toBeTruthy();

		expect(data).toMatchSnapshot();

		await outputFile(join(__dirname, 'temp', 't001.png'), data.body);

	});

	it('utf-8', async () => {

		const url = "data:image/svg+xml;charset=UTF-8,some-data";

		const data = await parseDataURL(url);

		expect(data).toMatchObject({
			type: 'image',
			mime: 'image/svg+xml',
			base64: false,
			charset: 'UTF-8',
		});

		expect(data).toMatchSnapshot();

	});

});
