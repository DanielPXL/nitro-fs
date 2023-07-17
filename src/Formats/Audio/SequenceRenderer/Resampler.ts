export class Resampler {
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

		let sourceSampleIndex = Math.floor(index / ratio);
		if (loopStartIndex !== undefined && loopLength !== undefined) {
			sourceSampleIndex = loopIndex(sourceSampleIndex);
		}

		if (sourceSampleIndex < 0 || sourceSampleIndex >= source.length) {
			return 0;
		}

		return source[sourceSampleIndex];
	}
}