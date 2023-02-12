import { BufferReader } from "../../../BufferReader";

// I don't know how this works
// Thank you, MIT License
// https://github.com/magcius/noclip.website/blob/master/src/SuperMario64DS/nitro_tex.ts

export function readTexture_CMPR_4x4(width: number, height: number, texData: BufferReader, palIdxData: BufferReader, palData: BufferReader): Uint8Array {
    function getPal16(offs: number) {
        //return offs < palView.byteLength ? palView.getUint16(offs, true) : 0;
        return offs < palView.length ? palData.readUint16(offs) : 0;
    }

    function buildColorTable(palBlock: number) {
        const palMode = palBlock >> 14;
        const palOffs = (palBlock & 0x3FFF) << 2;

        const colorTable = new Uint8Array(16);

        const p0 = getPal16(palOffs + 0x00);
        bgr5(colorTable, 0, p0);
        colorTable[3] = 0xFF;

        const p1 = getPal16(palOffs + 0x02);
        bgr5(colorTable, 4, p1);
        colorTable[7] = 0xFF;

        if (palMode === 0) {
            // PTY=0, A=0
            const p2 = getPal16(palOffs + 0x04);
            bgr5(colorTable, 8, p2);
            colorTable[11] = 0xFF;
            // Color4 is transparent black.
        } else if (palMode === 1) {
            // PTY=1, A=0
            // Color3 is a blend of Color1/Color2.
            colorTable[8]  = (colorTable[0] + colorTable[4]) >>> 1;
            colorTable[9]  = (colorTable[1] + colorTable[5]) >>> 1;
            colorTable[10] = (colorTable[2] + colorTable[6]) >>> 1;
            colorTable[11] = 0xFF;
            // Color4 is transparent black.
        } else if (palMode === 2) {
            // PTY=0, A=1
            const p2 = getPal16(palOffs + 0x04);
            bgr5(colorTable, 8, p2);
            colorTable[11] = 0xFF;

            const p3 = getPal16(palOffs + 0x06);
            bgr5(colorTable, 12, p3);
            colorTable[15] = 0xFF;
        } else {
            colorTable[8]  = s3tcblend(colorTable[4], colorTable[0]);
            colorTable[9]  = s3tcblend(colorTable[5], colorTable[1]);
            colorTable[10] = s3tcblend(colorTable[6], colorTable[2]);
            colorTable[11] = 0xFF;

            colorTable[12] = s3tcblend(colorTable[0], colorTable[4]);
            colorTable[13] = s3tcblend(colorTable[1], colorTable[5]);
            colorTable[14] = s3tcblend(colorTable[2], colorTable[6]);
            colorTable[15] = 0xFF;
        }

        return colorTable;
    }

    const pixels = new Uint8Array(width * height * 4);
    const texView = texData;
    const palIdxView = palIdxData;
    const palView = palData;

    let srcOffs = 0;
    for (let yy = 0; yy < height; yy += 4) {
        for (let xx = 0; xx < width; xx += 4) {
            // let texBlock = texView.getUint32((srcOffs * 0x04), true);
            let texBlock = texView.readUint32(srcOffs * 0x04);
            //const palBlock = palIdxView.getUint16((srcOffs * 0x02), true);
            const palBlock = palIdxView.readUint16(srcOffs * 0x02);

            const colorTable = buildColorTable(palBlock);

            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    const colorIdx = texBlock & 0x03;
                    const dstOffs = 4 * (((yy + y) * width) + xx + x);
                    pixels[dstOffs + 0] = colorTable[colorIdx * 4 + 0];
                    pixels[dstOffs + 1] = colorTable[colorIdx * 4 + 1];
                    pixels[dstOffs + 2] = colorTable[colorIdx * 4 + 2];
                    pixels[dstOffs + 3] = colorTable[colorIdx * 4 + 3];
                    texBlock >>= 2;
                }
            }

            srcOffs++;
        }
    }
    return pixels;
}

function bgr5(pixels: Uint8Array, dstOffs: number, p: number) {
    pixels[dstOffs + 0] = expand5to8(p & 0x1F);
    pixels[dstOffs + 1] = expand5to8((p >>> 5) & 0x1F);
    pixels[dstOffs + 2] = expand5to8((p >>> 10) & 0x1F);
}

function expand5to8(n: number): number {
    return (n << (8 - 5)) | (n >>> (10 - 8));
}

function s3tcblend(a: number, b: number): number {
    return (((a << 1) + a) + ((b << 2) + b)) >>> 3;
}