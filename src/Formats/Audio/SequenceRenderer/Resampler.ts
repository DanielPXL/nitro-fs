import { SWAV } from "../SWAV/SWAV";

export class Resampler {
	private static readonly SINC_WINDOW = 3;

	static singleSample(source: Float32Array, sourceRate: number, targetRate: number, index: number, loopStartIndex?: number, loopLength?: number) {
		const ratio = targetRate / sourceRate;

		if ((loopStartIndex === undefined || loopLength === undefined)) {
			if (index < 0) {
				return 0;
			}

			if (index / ratio >= source.length) {
				return null;
			}
		}


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

		if (sumWeight === 0) {
			return 0;
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