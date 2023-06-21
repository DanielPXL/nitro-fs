import { ModType } from "../SSEQ/Command";
import { Envelope } from "./Envelope";

export abstract class PlayingNote {
	abstract envelope: Envelope;
	abstract getValue(time: number): number;
	abstract release(time: number): void;
	abstract pitchBend(semitones: number): void;
	abstract setVolume(volume1: number, volume2: number): void;
	abstract setModulation(modDepth: number, modRange: number, modSpeed: number, modDelay: number, modType: ModType): void;
	abstract modulationTick(time: number): void;
}