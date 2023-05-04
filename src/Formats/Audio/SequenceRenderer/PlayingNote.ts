import { Envelope } from "./Envelope";

export abstract class PlayingNote {
	abstract envelope: Envelope;
	abstract getValue(time: number): number;
	abstract release(time: number): void;
	abstract pitchBend(semitones: number): void;
	abstract setVolume(volume1: number, volume2: number): void;
}