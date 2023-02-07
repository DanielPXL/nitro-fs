import { NCL } from "./NCL";

export class NCG {
	constructor(raw: Uint8Array, offset: number = 0) {
		this.raw = raw;
		this.offset = offset;
	}

	raw: Uint8Array;
	offset: number;

	parse(ncl: NCL, paletteIndex: number = 0): Uint8Array {
		const image = new Uint8Array(this.raw.length - this.offset);

		for (let i = 0; i < image.length; i++) {
			const colorIndex = this.raw[i + this.offset];
			const color = ncl.colorAt(paletteIndex * 16 + colorIndex);

			image[i * 4 + 0] = color[0];
			image[i * 4 + 1] = color[1];
			image[i * 4 + 2] = color[2];
			image[i * 4 + 3] = color[3];
		}

		return image;
	}

	get length(): number {
		return this.raw.length - this.offset;
	}
}