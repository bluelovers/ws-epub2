import {
	Worker, isMainThread, parentPort, workerData,
} from 'worker_threads';
import { ITSResolvable } from 'ts-type';
import imageminBuffer, { IOptions, isAllowedBuffer, newError } from './index';
import Bluebird from 'bluebird';
import { parse, join } from "path";
import { rejects } from 'assert';

export const imageminBufferWorker = function imageminBufferWorker(oldBuffer: ITSResolvable<Buffer>,
	options?: IOptions,
): Bluebird<Buffer>
{
	return null;
};

export default imageminBufferWorker

if (isMainThread)
{
	const __worker = (() =>
	{
		let p = parse(__filename);
		return join(p.dir, p.name + '.js')
	})();

	function imageminBufferWorker(oldBuffer: ITSResolvable<Buffer>, options?: IOptions): Bluebird<Buffer>
	{
		return new Bluebird(async (resolve, reject) => {

			oldBuffer = await oldBuffer;

			const worker = new Worker(__worker, {
				workerData: {
					oldBuffer,
					options,
				},
			});

			worker.on('message', (v: {
				newBuffer?: Buffer,
				error?: Error
			}) =>
			{
				let newBuffer = v.newBuffer;

				if (newBuffer?.length > 0 && isAllowedBuffer(newBuffer = Buffer.from(newBuffer)))
				{
					resolve(newBuffer);
				}
				else
				{
					reject(v.error ?? newError())
				}

				worker.terminate()
			});

			worker.on('error', (e) =>
			{
				reject(e)
				worker.terminate()
			});

			worker.on('exit', (code) =>
			{
				if (code !== 0)
				{
					//console.error(`Worker stopped with exit code ${code}`)
				}
				reject(newError())
				worker.terminate()
			});

		})
	}

	exports.imageminBufferWorker = exports.default = imageminBufferWorker
}
else
{
	let {
		oldBuffer,
		options,
	} = workerData as {
		oldBuffer: Buffer,
		options: IOptions
	};

	oldBuffer = Buffer.from(oldBuffer);

	imageminBuffer(oldBuffer, options)
		.then(newBuffer => {
			parentPort.postMessage({
				newBuffer,
			});
		})
		.catch(error => {
			parentPort.postMessage({
				error,
			});
		})
	;
}




