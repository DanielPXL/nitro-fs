import { PaletteInfoSection } from "../InfoSection/PaletteInfoSection";
import { TextureInfoSection } from "../InfoSection/TextureInfoSection";
import { TEX0Header } from "./TEX0Header";
import { TextureFormats } from "./TextureFormats";

export class TEX0 {
	constructor(raw: Uint8Array) {
		this.raw = raw;

		this.header = new TEX0Header(raw.slice(0, 0x40));

		if (this.header.magic !== "TEX0") {
			throw new Error("Invalid TEX0 magic");
		}

		this.textureInfo = new TextureInfoSection(raw.slice(this.header.textureInfoOffset));
		this.paletteInfo = new PaletteInfoSection(raw.slice(this.header.paletteInfoOffset));
	}

	raw: Uint8Array;

	header: TEX0Header;
	textureInfo: TextureInfoSection;
	paletteInfo: PaletteInfoSection;
	

	parseTexture(texIndex: number, palIndex: number = texIndex): Uint8Array {
		const textureInfo = this.textureInfo.entries[texIndex];

		switch (textureInfo.format) {
			case 1: {
				// A3I5
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset, paletteOffset + 0x40);

				return TextureFormats.parseA3I5(texRaw, palRaw, textureInfo.width, textureInfo.height, textureInfo.firstColorTransparent);
			}

			case 2: {
				// 4-Color Palette
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height / 4;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset, paletteOffset + 0x08);

				return TextureFormats.parsePalette4(texRaw, palRaw, textureInfo.width, textureInfo.height, textureInfo.firstColorTransparent);
			}
			
			case 3: {
				// 16-Color Palette
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height / 2;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset, paletteOffset + 0x20);

				return TextureFormats.parsePalette16(texRaw, palRaw, textureInfo.width, textureInfo.height, textureInfo.firstColorTransparent);
			}
			
			case 4: {
				// 256-Color Palette
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset, paletteOffset + 0x400);

				return TextureFormats.parsePalette256(texRaw, palRaw, textureInfo.width, textureInfo.height, textureInfo.firstColorTransparent);
			}

			case 5: {
				// Compressed 4x4 Texel
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height / 2;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset);

				return TextureFormats.parseCompressed4x4(texRaw, palRaw, textureInfo.width, textureInfo.height);
			}

			case 6: {
				// A5I3
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				const paletteInfo = this.paletteInfo.entries[palIndex];
				const paletteOffset = this.header.paletteDataOffset + paletteInfo.paletteOffset;
				const palRaw = this.raw.slice(paletteOffset, paletteOffset + 0x10);

				return TextureFormats.parseA5I3(texRaw, palRaw, textureInfo.width, textureInfo.height, textureInfo.firstColorTransparent);
			}

			case 7: {
				// Direct Color
				const texOffset = this.header.textureDataOffset + textureInfo.textureOffset;
				const texSize = textureInfo.width * textureInfo.height * 2;
				const texRaw = this.raw.slice(texOffset, texOffset + texSize);

				return TextureFormats.parseDirectColor(texRaw, textureInfo.width, textureInfo.height);
			}

			default:
				throw new Error(`Unsupported texture format: ${textureInfo.format}`);
		}
	} 
}