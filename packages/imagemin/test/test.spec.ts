/**
 * Created by user on 2020/3/28.
 */

import { readFile } from 'fs-extra';
import { join } from 'path';
import imageminBuffer from '../index';

describe('test imagemin', function ()
{

	it('should optimize', async () => {

		let buf = await readFile(join(__dirname, 'res', '0_002.webp'))

		let ret = await imageminBuffer(buf, {
			imageminDebug: true,
		})

		expect(ret.length).toBeLessThan(buf.length)
		expect(ret.length).toBeGreaterThan(0)

	})

});
