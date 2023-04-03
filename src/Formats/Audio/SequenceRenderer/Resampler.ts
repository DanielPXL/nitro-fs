import { SWAV } from "../SWAV/SWAV";

export class Resampler {
	private static readonly SINC_WINDOW = 5;

	static cache: Map<SWAV, Float32Array> = new Map();

	static resample(source: Float32Array, sourceRate: number, targetRate: number, swavCache?: SWAV): Float32Array {
		if (swavCache) {
			if (this.cache.has(swavCache)) {
				return this.cache.get(swavCache);
			}
		}

		// Resample using sinc interpolation
		const ratio = targetRate / sourceRate;
		const length = Math.ceil(source.length * ratio);
		const result = new Float32Array(length);

		// console.log(`Resampling ${source.length} samples from ${sourceRate} to ${targetRate} (${ratio} ratio), ${length} samples in result`)

		for (let i = 0; i < length; i++) {
			let sum = 0;
				let sumWeight = 0;
				for (let k = -Resampler.SINC_WINDOW; k <= Resampler.SINC_WINDOW; k++) {
					const index = Math.floor(i / ratio) + k;
					if (index >= 0 && index < source.length) {
						const weight = Resampler.sinc(k - (i / ratio - Math.floor(i / ratio)));
						sum += source[index] * weight;
						sumWeight += weight;
					}
				}
			result[i] = sum / sumWeight;
		}

		if (swavCache) {
			this.cache.set(swavCache, result);
		}
		
		return result;
	}

	static singleSample(source: Float32Array, sourceRate: number, targetRate: number, index: number, loopStartIndex?: number, loopLength?: number): number {
		const ratio = targetRate / sourceRate;

		// console.log(`Resampling ${source.length} samples from ${sourceRate} to ${targetRate} (${ratio} ratio), ${length} samples in result`)

		function loopIndex(i: number): number {
			if (i < loopStartIndex) {
				return i;
			}

			return loopStartIndex + ((i - loopStartIndex) % loopLength);
		}

		let sum = 0;
		let sumWeight = 0;
		for (let k = -Resampler.SINC_WINDOW; k <= Resampler.SINC_WINDOW; k++) {
			const sourceIndex = Math.floor(index / ratio) + k;
			let sourceSampleIndex: number;
			if (loopStartIndex !== undefined && loopLength !== undefined) {
				sourceSampleIndex = loopIndex(sourceIndex);
			} else {
				sourceSampleIndex = sourceIndex;
			}
			
			if (sourceSampleIndex >= 0 && sourceSampleIndex < source.length) {
				const weight = Resampler.sinc(k - (index / ratio - Math.floor(index / ratio)));
				sum += source[sourceSampleIndex] * weight;
				sumWeight += weight;
			}
		}
		return sum / sumWeight;
	}

	static sinc(x: number): number {
		if (x === 0) {
			return 1;
		}

		const piX = Math.PI * x;
		return Math.sin(piX) / piX;
	}
}