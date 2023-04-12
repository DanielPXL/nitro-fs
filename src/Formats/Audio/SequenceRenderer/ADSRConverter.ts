export class ADSRConverter {
	public static readonly TICK_INTERVAL = ((64 * 2728) / 33000000);

	private static readonly ATTACKRATE_TO_TIME_TABLE = [
		15.2209, 7.5955, 5.0537, 3.7828, 3.0203, 2.5119, 2.1488, 1.8764, 1.6646, 1.4951, 1.3564, 1.2409, 1.1431, 1.0593, 0.9866, 0.9231, 
		0.867, 0.8171, 0.7725, 0.7323, 0.696, 0.663, 0.6328, 0.6052, 0.5797, 0.5562, 0.5345, 0.5143, 0.4955, 0.478, 0.4615, 0.4461, 
		0.4317, 0.4181, 0.4052, 0.3931, 0.3816, 0.3708, 0.3604, 0.3506, 0.3413, 0.3324, 0.324, 0.3159, 0.3082, 0.3008, 0.2937, 0.2869, 
		0.2804, 0.2742, 0.2681, 0.2624, 0.2568, 0.2515, 0.2463, 0.2413, 0.2365, 0.2319, 0.2274, 0.2231, 0.2189, 0.2148, 0.2109, 0.2071, 
		0.2034, 0.1998, 0.1963, 0.193, 0.1897, 0.1865, 0.1834, 0.1804, 0.1775, 0.1746, 0.1718, 0.1691, 0.1665, 0.1639, 0.1614, 0.159, 
		0.1566, 0.1543, 0.152, 0.1498, 0.1476, 0.1455, 0.1435, 0.1414, 0.1395, 0.1375, 0.1356, 0.1338, 0.132, 0.1302, 0.1285, 0.1268, 
		0.1251, 0.1234, 0.1218, 0.1203, 0.1187, 0.1172, 0.1157, 0.1143, 0.1128, 0.1114, 0.1101, 0.1087, 0.1074, 0.1023, 0.0953, 0.0899, 
		0.085, 0.0813, 0.0753, 0.0698, 0.0634, 0.0582, 0.0535, 0.0475, 0.0425, 0.0369, 0.0312, 0.026, 0.0205, 0.0151, 0.0107, 0.0052, 
	]

	public static convertAttack(attackRate: number): number {
		return ADSRConverter.ATTACKRATE_TO_TIME_TABLE[attackRate];
	}

	// private static readonly FALLRATE_TO_REAL_FALLRATE_TABLE = [
	// 	1, 3, 5, 7, 9, 11, 13, 15,
	// 	17, 19, 21, 23, 25, 27, 29, 31,
	// 	33, 35, 37, 39, 41, 43, 45, 47,
	// 	49, 51, 53, 55, 57, 59, 61, 63,
	// 	65, 67, 69, 71, 73, 75, 77, 79,
	// 	81, 83, 85, 87, 89, 91, 93, 95,
	// 	97, 99, 101, 102, 104, 105, 107, 108,
	// 	110, 111, 113, 115, 116, 118, 120, 122,
	// 	124, 126, 128, 130, 132, 135, 137, 140,
	// 	142, 145, 148, 151, 154, 157, 160, 163,
	// 	167, 171, 175, 179, 183, 187, 192, 197,
	// 	202, 208, 213, 219, 226, 233, 240, 248,
	// 	256, 265, 274, 284, 295, 307, 320, 334,
	// 	349, 366, 384, 404, 427, 452, 480, 512,
	// 	549, 591, 640, 698, 768, 853, 960, 1097,
	// 	1280, 1536, 1920, 2560, 3840, 7680, 15360, 65535
	// ]

	// The convertDecay, convertRelease and getFallingRate functions come pretty much directly from VGMTrans' implementation
	// https://github.com/vgmtrans/vgmtrans/blob/aeea0825547963f2af847695829fc4e894b3a88e/src/main/formats/NDSInstrSet.cpp#L193
	// convertDecay and convertRelease are modified versions of NDSInstr::GetArticData to make the implementation more friendly to this project
	// getFallingRate is a direct copy of NDSInstr::GetFallingRate

	/* VGMTrans is licensed under the zlib/libpng license:

			The zlib/libpng License

		VGMTrans Copyright (c) 2002-2023 The VGMTrans Team

		This software is provided 'as-is', without any express or implied
		warranty. In no event will the authors be held liable for any damages
		arising from the use of this software.

		Permission is granted to anyone to use this software for any purpose,
		including commercial applications, and to alter it and redistribute it
		freely, subject to the following restrictions:

			1. The origin of this software must not be misrepresented; you must not
			claim that you wrote the original software. If you use this software
			in a product, an acknowledgment in the product documentation would be
			appreciated but is not required.

			2. Altered source versions must be plainly marked as such, and must not be
			misrepresented as being the original software.

			3. This notice may not be removed or altered from any source
			distribution.
			
	*/

	public static convertDecay(fallRate: number, sustainAmplitude: number): number {
		// return ADSRConverter.TICK_INTERVAL * (sustainAmplitude / -ADSRConverter.FALLRATE_TO_REAL_FALLRATE_TABLE[fallRate]);
		let realDecay = this.getFallingRate(fallRate);
		if (fallRate === 0x7F) {
			return ADSRConverter.TICK_INTERVAL * 1;
		} else {
			const count = -sustainAmplitude / realDecay;
			return ADSRConverter.TICK_INTERVAL * count;
		}
	}

	public static convertRelease(fallRate: number, amplitudeAtStop: number): number {
		// return ADSRConverter.TICK_INTERVAL * ((92544 + amplitudeAtStop) / ADSRConverter.FALLRATE_TO_REAL_FALLRATE_TABLE[fallRate]);
		const count = (92544 + amplitudeAtStop) / this.getFallingRate(fallRate);
		return ADSRConverter.TICK_INTERVAL * count;
	}

	private static getFallingRate(time: number) {
		let realDecay;
		if (time == 0x7F)
			realDecay = 0xFFFF;
		else if (time == 0x7E)
			realDecay = 0x3C00;
		else if (time < 0x32) {
			realDecay = time * 2;
			realDecay++;
			realDecay &= 0xFFFF;
		} else {
			realDecay = 0x1E00;
			time = 0x7E - time;
			realDecay /= time;
	
			realDecay &= 0xFFFF;
		}

		return realDecay;
	}

	private static readonly SUSTAIN_TABLE = [
		-92544, -92416, -92288, -83328, -76928, -71936, -67840, -64384,
		-61440, -58880, -56576, -54400, -52480, -50688, -49024, -47488,
		-46080, -44672, -43392, -42240, -41088, -40064, -39040, -38016,
		-36992, -36096, -35328, -34432, -33664, -32896, -32128, -31360,
		-30592, -29952, -29312, -28672, -28032, -27392, -26880, -26240,
		-25728, -25088, -24576, -24064, -23552, -23040, -22528, -22144,
		-21632, -21120, -20736, -20224, -19840, -19456, -19072, -18560,
		-18176, -17792, -17408, -17024, -16640, -16256, -16000, -15616,
		-15232, -14848, -14592, -14208, -13952, -13568, -13184, -12928,
		-12672, -12288, -12032, -11648, -11392, -11136, -10880, -10496,
		-10240, -9984, -9728, -9472, -9216, -8960, -8704, -8448,
		-8192, -7936, -7680, -7424, -7168, -6912, -6656, -6400,
		-6272, -6016, -5760, -5504, -5376, -5120, -4864, -4608,
		-4480, -4224, -3968, -3840, -3584, -3456, -3200, -2944,
		-2816, -2560, -2432, -2176, -2048, -1792, -1664, -1408,
		-1280, -1024, -896, -768, -512, -384, -128, 0
	]

	public static convertSustain(sustain: number): number {
		return ADSRConverter.SUSTAIN_TABLE[sustain];
	}
}