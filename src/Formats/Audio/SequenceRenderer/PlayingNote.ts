export abstract class PlayingNote {
	abstract getValue(time: number): number;
	abstract release(time: number): void;
}