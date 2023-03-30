export class Resampler {
	private static readonly SINC_WINDOW = 10;

	static resample(source: Float32Array, sourceRate: number, targetRate: number): Float32Array {
		// Resample using sinc interpolation
		const ratio = targetRate / sourceRate;
		const length = Math.ceil(source.length * ratio);
		const result = new Float32Array(length);

		// console.log(`Resampling ${source.length} samples from ${sourceRate} to ${targetRate} (${ratio} ratio), ${length} samples in result`)

		const sinc = (x: number) => {
			if (x === 0) {
				return 1;
			}

			const piX = Math.PI * x;
			return Math.sin(piX) / piX;
		}

		for (let i = 0; i < length; i++) {
			let sum = 0;
				let sumWeight = 0;
				for (let k = -Resampler.SINC_WINDOW; k <= Resampler.SINC_WINDOW; k++) {
					const index = Math.floor(i / ratio) + k;
					if (index >= 0 && index < source.length) {
						const weight = sinc(k - (i / ratio - Math.floor(i / ratio)));
						sum += source[index] * weight;
						sumWeight += weight;
					}
				}
				result[i] = sum / sumWeight;
		}

		return result;
	}
}