// http://problemkaputt.de/gbatek.htm#ds3dtextureformats

import { readTexture_CMPR_4x4 } from "./Compressed4x4";

export class TextureFormats {
	// Format 1
	static parseA3I5(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number, firstColorTransparent: boolean): Uint8Array {
		// Texture Format: 8 bits per texel
		// IIIIIAAA
		// I: Palette Index
		// A: Alpha
		// Palette Format: RGBA5551, 2 bytes per texel

		const tex = new Uint8Array(width * height * 4);

		for (let i = 0; i < texRaw.length; i++) {
			const texel = texRaw[i];
			const index = texel & 0b00011111;
			const alpha = (texel & 0b11100000) >> 5;

			const color = palRaw[index * 2] | (palRaw[index * 2 + 1] << 8);

			tex[i * 4 + 0] = this.color5to8((color >> 0) & 0x1F);
			tex[i * 4 + 1] = this.color5to8((color >> 5) & 0x1F);
			tex[i * 4 + 2] = this.color5to8((color >> 10) & 0x1F);
			
			// The DS expands the 3-bit alpha value to 5 bits like this: alpha = (alpha * 4) + (alpha / 2)
			// Simplified: alpha = (9/2 * alpha)
			// In order to convert it to 8-bit alpha, we do something similar:
			// alpha = (255/7 * alpha)
			// This isn't 100% accurate due to rounding, but there's no way to get a perfect result
			tex[i * 4 + 3] = Math.floor((255 / 7) * alpha);
		}

		return tex;
	}

	// Format 2
	static parsePalette4(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number, firstColorTransparent: boolean): Uint8Array {
		// Texture Format: 2 bits per texel
		// Palette Format: RGBA5551, 2 bytes per texel
		// Alpha values don't seem to be used

		const tex = new Uint8Array(width * height * 4);

		for (let i = 0; i < texRaw.length; i++) {
			const texel1 = texRaw[i] & 0b00000011;
			const texel2 = (texRaw[i] & 0b00001100) >> 2;
			const texel3 = (texRaw[i] & 0b00110000) >> 4;
			const texel4 = (texRaw[i] & 0b11000000) >> 6;

			const color1 = palRaw[texel1 * 2] | (palRaw[texel1 * 2 + 1] << 8);
			const color2 = palRaw[texel2 * 2] | (palRaw[texel2 * 2 + 1] << 8);
			const color3 = palRaw[texel3 * 2] | (palRaw[texel3 * 2 + 1] << 8);
			const color4 = palRaw[texel4 * 2] | (palRaw[texel4 * 2 + 1] << 8);

			tex[i * 16 + 0] = this.color5to8((color1 >> 0) & 0x1F);
			tex[i * 16 + 1] = this.color5to8((color1 >> 5) & 0x1F);
			tex[i * 16 + 2] = this.color5to8((color1 >> 10) & 0x1F);
			tex[i * 16 + 3] = 255;

			tex[i * 16 + 4] = this.color5to8((color2 >> 0) & 0x1F);
			tex[i * 16 + 5] = this.color5to8((color2 >> 5) & 0x1F);
			tex[i * 16 + 6] = this.color5to8((color2 >> 10) & 0x1F);
			tex[i * 16 + 7] = 255;

			tex[i * 16 + 8] = this.color5to8((color3 >> 0) & 0x1F);
			tex[i * 16 + 9] = this.color5to8((color3 >> 5) & 0x1F);
			tex[i * 16 + 10] = this.color5to8((color3 >> 10) & 0x1F);
			tex[i * 16 + 11] = 255;

			tex[i * 16 + 12] = this.color5to8((color4 >> 0) & 0x1F);
			tex[i * 16 + 13] = this.color5to8((color4 >> 5) & 0x1F);
			tex[i * 16 + 14] = this.color5to8((color4 >> 10) & 0x1F);
			tex[i * 16 + 15] = 255;

			if (firstColorTransparent) {
				if (texel1 === 0) {
					tex[i * 16 + 3] = 0;
				}

				if (texel2 === 0) {
					tex[i * 16 + 7] = 0;
				}

				if (texel3 === 0) {
					tex[i * 16 + 11] = 0;
				}

				if (texel4 === 0) {
					tex[i * 16 + 15] = 0;
				}
			}
		}

		return tex;
	}

	// Format 3
	static parsePalette16(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number, firstColorTransparent: boolean): Uint8Array {
		// Texture Format: 4 bits per texel
		// Palette Format: RGBA5551, 2 bytes per texel
		// Alpha values don't seem to be used

		const tex = new Uint8Array(width * height * 4);
		
		for (let i = 0; i < texRaw.length; i++) {
			const texel1 = texRaw[i] & 0x0F;
			const texel2 = (texRaw[i] & 0xF0) >> 4;

			const color1 = palRaw[texel1 * 2] | (palRaw[texel1 * 2 + 1] << 8);
			const color2 = palRaw[texel2 * 2] | (palRaw[texel2 * 2 + 1] << 8);

			tex[i * 8 + 0] = this.color5to8((color1 >> 0) & 0x1F);
			tex[i * 8 + 1] = this.color5to8((color1 >> 5) & 0x1F);
			tex[i * 8 + 2] = this.color5to8((color1 >> 10) & 0x1F);
			tex[i * 8 + 3] = 255;

			if (firstColorTransparent && texel1 === 0) {
				tex[i * 8 + 3] = 0;
			}

			tex[i * 8 + 4] = this.color5to8((color2 >> 0) & 0x1F);
			tex[i * 8 + 5] = this.color5to8((color2 >> 5) & 0x1F);
			tex[i * 8 + 6] = this.color5to8((color2 >> 10) & 0x1F);
			tex[i * 8 + 7] = 255;

			if (firstColorTransparent && texel2 === 0) {
				tex[i * 8 + 7] = 0;
			}
		}

		return tex;
	}

	// Format 4
	static parsePalette256(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number, firstColorTransparent: boolean): Uint8Array {
		// Texture Format: 8 bits per texel
		// Palette Format: RGBA5551, 2 bytes per texel
		// Alpha values don't seem to be used

		const tex = new Uint8Array(width * height * 4);

		for (let i = 0; i < texRaw.length; i++) {
			const texel = texRaw[i];

			const color = palRaw[texel * 2] | (palRaw[texel * 2 + 1] << 8);

			tex[i * 4 + 0] = this.color5to8((color >> 0) & 0x1F);
			tex[i * 4 + 1] = this.color5to8((color >> 5) & 0x1F);
			tex[i * 4 + 2] = this.color5to8((color >> 10) & 0x1F);
			tex[i * 4 + 3] = 255;

			if (firstColorTransparent && texel === 0) {
				tex[i * 4 + 3] = 0;
			}
		}

		return tex;
	}

	// Format 5
	static parseCompressed4x4(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number): Uint8Array {
		const palIdxData = texRaw.slice((width * height) / 4);
		return readTexture_CMPR_4x4(width, height, texRaw, palIdxData, palRaw);
	}

	// Format 6
	static parseA5I3(texRaw: Uint8Array, palRaw: Uint8Array, width: number, height: number, firstColorTransparent: boolean): Uint8Array {
		// Texture Format: 8 bits per texel
		// IIIAAAAA
		// I: Palette Index
		// A: Alpha
		// Palette Format: RGBA5551, 2 bytes per texel

		const tex = new Uint8Array(width * height * 4);

		for (let i = 0; i < texRaw.length; i++) {
			const texel = texRaw[i];
			const index = texel & 0b00000111;
			const alpha = (texel & 0b11111000) >> 3;

			const color = palRaw[index * 2] | (palRaw[index * 2 + 1] << 8);

			tex[i * 4 + 0] = this.color5to8((color >> 0) & 0x1F);
			tex[i * 4 + 1] = this.color5to8((color >> 5) & 0x1F);
			tex[i * 4 + 2] = this.color5to8((color >> 10) & 0x1F);
			
			// Expand 5-bit alpha to 8-bit
			tex[i * 4 + 3] = Math.floor(255/31 * alpha);
		}

		return tex;
	}

	// Format 7
	static parseDirectColor(texRaw: Uint8Array, width: number, height: number) {
		// Texture Format: RGBA5551, 2 bytes per texel

		const tex = new Uint8Array(width * height * 4);

		for (let i = 0; i < texRaw.length; i += 2) {
			const color = texRaw[i] | (texRaw[i + 1] << 8);

			tex[i * 2 + 0] = this.color5to8((color >> 0) & 0x1F);
			tex[i * 2 + 1] = this.color5to8((color >> 5) & 0x1F);
			tex[i * 2 + 2] = this.color5to8((color >> 10) & 0x1F);
			tex[i * 2 + 3] = ((color >> 15) & 0x01) << 7;
		}

		return texRaw;
	}

	private static color5to8(value: number): number {
		return Math.floor(255/31 * value);
	}
}