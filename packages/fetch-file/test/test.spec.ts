/**
 * Created by user on 2020/3/28.
 */

import fetchFileOrUrl from '../index';

describe('test fetch', function ()
{

	it('fetch url', async () => {

		let ret = await fetchFileOrUrl({
			url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
		})
			.tap(fo =>
			{
				console.dir(fo)
			})
		;

		expect(ret).toHaveProperty('url');
		expect(ret).toHaveProperty('mime');
		expect(ret).toHaveProperty('ext');
		expect(ret).toHaveProperty('name');
		expect(ret).toHaveProperty('data');
		expect(ret).toMatchSnapshot({
			data: expect.any(Buffer),
		});

	})

});
