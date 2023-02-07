export class NCL {
	constructor(raw: Uint8Array, offset: number = 0) {
		this.raw = raw;
		this.offset = offset;
	}

	raw: Uint8Array;
	offset: number;

	colorAt(index: number): Uint8Array {
		const color = this.raw.slice(index * 2 + this.offset, index * 2 + 2 + this.offset);
		
		const r = this.color5to8(color[0] & 0x1F);
		const g = this.color5to8((color[0] >> 5) | ((color[1] & 0x3) << 3));
		const b = this.color5to8(color[1] >> 2);

		return new Uint8Array([r, g, b, 255]);
	}

	colors(): Uint8Array {
		const colors = new Uint8Array((this.raw.length - this.offset) / 2 * 4);

		for (let i = 0; i < this.raw.length / 2; i++) {
			const color = this.colorAt(i);

			colors[i * 4 + 0] = color[0];
			colors[i * 4 + 1] = color[1];
			colors[i * 4 + 2] = color[2];
			colors[i * 4 + 3] = color[3];
		}

		return colors;
	}

	get length(): number {
		return (this.raw.length - this.offset) / 2;
	}

	private color5to8(value: number): number {
		return Math.floor(255/31 * value);
	}
}