export abstract class PlayingNote {
	abstract release(time: number): void;
	abstract getValue(time: number): number;
}

// export class PSGPlayingNote implements PlayingNote {
// 	constructor(note: Note, envelope: Envelope, dutyCycleType: DutyCycleType) {
// 		this.note = note;
// 		this.envelope = envelope;
// 	}

// 	note: Note;
// 	envelope: Envelope;

// 	release(time: number) {
// 		throw new Error("Method not implemented.");
// 	}
// 	getValue(time: number): number {
// 		throw new Error("Method not implemented.");
// 	}
// }