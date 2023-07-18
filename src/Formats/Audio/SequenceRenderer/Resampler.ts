export class Resampler {
	static singleSample(source: Float32Array, sourceRate: number, targetRate: number, index: number, loopStartIndex?: number, loopLength?: number) {
		const ratio = targetRate / sourceRate;

		function loopIndex(i: number): number {
			if (i < loopStartIndex) {
				return i;
			}

			return loopStartIndex + ((i - loopStartIndex) % loopLength);
		}

		let sourceSampleIndex = Math.floor(index / ratio);
		if (loopStartIndex !== undefined && loopLength !== undefined) {
			sourceSampleIndex = loopIndex(sourceSampleIndex);
		} else {
			if (sourceSampleIndex < 0) {
				return 0;
			}

			if (sourceSampleIndex >= source.length) {
				return null;
			}
		}

		if (sourceSampleIndex < 0 || sourceSampleIndex >= source.length) {
			return 0;
		}
		
		return source[sourceSampleIndex];
	}
}