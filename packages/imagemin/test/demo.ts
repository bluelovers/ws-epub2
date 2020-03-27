import { readFile } from 'fs-extra';
import { join } from "path";
import imageminBuffer from '../index';


(async () => {

	let buf = await readFile(join(__dirname, 'res', '0_002.webp'))

	let ret = await imageminBuffer(buf, {
		imageminDebug: true,
	})

	console.log(ret.length, buf.length)

})();

