import { CommandType, commandTypeToString } from "../SSEQ/CommandType";
import { SDAT } from "../SDAT/SDAT";
import { SSEQ } from "../SSEQ/SSEQ";
import { Commands, ModType } from "../SSEQ/Command";
import { SequenceInfo } from "../SDAT/FileInfo";
import { SBNK } from "../SBNK/SBNK";
import { SWAR } from "../SWAR/SWAR";
import { Synthesizer } from "./Synthesizer";
import { SequenceVariables } from "./SequenceVariables";
import { Random } from "./Random";

export class Track {	
	constructor(track: number, offset: number, sseq: SSEQ, sdat: SDAT, synth: Synthesizer, sampleRate: number, variables: SequenceVariables, random: Random, stopTrack: () => void, changeTempo: (tempo: number) => void, openTrack: (track: number, offset: number) => void) {
		this.track = track;
		this.offset = offset;
		this.sseq = sseq;
		this.sdat = sdat;
		this.sampleRate = sampleRate;
		this.synth = synth;
		this.variables = variables;
		this.random = random;
		this.stopTrackCallback = stopTrack;
		this.changeTempoCallback = changeTempo;
		this.openTrackCallback = openTrack;
		
		this.pointer = offset;
	}

	readonly handlers = {
		[CommandType.Note]: this.Note,
		[CommandType.Wait]: this.Wait,
		[CommandType.ProgramChange]: this.ProgramChange,
		[CommandType.OpenTrack]: this.OpenTrack,
		[CommandType.Jump]: this.Jump,
		[CommandType.Call]: this.Call,
		[CommandType.Random]: this.Random,
		[CommandType.Variable]: this.Variable,
		[CommandType.If]: this.If,
		[CommandType.SetVariable]: this.SetVariable,
		[CommandType.AddVariable]: this.AddVariable,
		[CommandType.SubtractVariable]: this.SubtractVariable,
		[CommandType.MultiplyVariable]: this.MultiplyVariable,
		[CommandType.DivideVariable]: this.DivideVariable,
		[CommandType.ShiftVariable]: this.ShiftVariable,
		[CommandType.RandomVariable]: this.RandomVariable,
		[CommandType.CompareEqual]: this.CompareEqual,
		[CommandType.CompareGreaterOrEqual]: this.CompareGreaterOrEqual,
		[CommandType.CompareGreater]: this.CompareGreater,
		[CommandType.CompareLessOrEqual]: this.CompareLessOrEqual,
		[CommandType.CompareLess]: this.CompareLess,
		[CommandType.CompareNotEqual]: this.CompareNotEqual,
		[CommandType.Pan]: this.Pan,
		[CommandType.Volume]: this.Volume,
		[CommandType.MainVolume]: this.MainVolume,
		[CommandType.Transpose]: this.Transpose,
		[CommandType.PitchBend]: this.PitchBend,
		[CommandType.PitchBendRange]: this.PitchBendRange,
		[CommandType.Priority]: this.Priority,
		[CommandType.NoteWaitMode]: this.NoteWaitMode,
		[CommandType.Tie]: this.Tie,
		[CommandType.Portamento]: this.PortamentoControl,
		[CommandType.ModulationDepth]: this.ModulationDepth,
		[CommandType.ModulationSpeed]: this.ModulationSpeed,
		[CommandType.ModulationType]: this.ModulationType,
		[CommandType.ModulationRange]: this.ModulationRange,
		[CommandType.PortamentoSwitch]: this.PortamentoSwitch,
		[CommandType.PortamentoTime]: this.PortamentoTime,
		[CommandType.Attack]: this.Attack,
		[CommandType.Decay]: this.Decay,
		[CommandType.Sustain]: this.Sustain,
		[CommandType.Release]: this.Release,
		[CommandType.LoopStart]: this.LoopStart,
		[CommandType.Volume2]: this.Volume2,
		[CommandType.PrintVariable]: this.PrintVariable,
		[CommandType.ModulationDelay]: this.ModulationDelay,
		[CommandType.Tempo]: this.Tempo,
		[CommandType.SweepPitch]: this.SweepPitch,
		[CommandType.LoopEnd]: this.LoopEnd,
		[CommandType.Return]: this.Return,
		[CommandType.AllocateTracks]: this.AllocateTracks,
		[CommandType.Fin]: this.Fin
	}

	active: boolean = true;
	
	track: number;
	offset: number;
	sseq: SSEQ;
	sdat: SDAT;
	sampleRate: number;
	synth: Synthesizer;
	
	stopTrackCallback: (track: number) => void;
	changeTempoCallback: (tempo: number) => void;
	openTrackCallback: (track: number, offset: number) => void;
	
	pointer: number;
	
	wait: number = 0;
	callReturnStack: number[] = [];
	pitchBendRange: number = 2;
	pitchBend: number = 0;
	volume1: number = 127;
	volume2: number = 127;
	modulationDepth: number = 0;
	modulationRange: number = 1;
	modulationSpeed: number = 16;
	modulationDelay: number = 0;
	modulationType: ModType = ModType.Pitch;

	variables: SequenceVariables;
	conditionalFlag: boolean = false;

	random: Random;

	tick() {
		while (this.wait === 0) {
			const command = this.sseq.data.commands[this.pointer];

			if (command === undefined) {
				this.stopTrackCallback(this.track);
				return;
			}
			
			// if (this.track === 1) {
			// 	console.log("[" + this.pointer.toString(16).toUpperCase() + "] " + commandTypeToString(command.type) + " : " + JSON.stringify(command));
			// }
			
			this.handlers[command.type].bind(this)(command as any);

			this.pointer++;
		}

		if (this.wait > 0) {
			this.wait--;
		}
	}

	private Note(cmd: Commands.Note) {
		if (!this.active) return;

		const trackInfo: TrackInfo = {
			pitchBendSemitones: this.pitchBendRange * this.pitchBend,
			volume1: this.volume1,
			volume2: this.volume2,
			modDepth: this.modulationDepth,
			modRange: this.modulationRange,
			modSpeed: this.modulationSpeed,
			modDelay: this.modulationDelay,
			modType: this.modulationType
		}

		this.synth.playNote(this.track, cmd.note, cmd.velocity, cmd.duration, trackInfo);
	}

	private Wait(cmd: Commands.Wait) {
		this.wait = cmd.duration;
	}

	private ProgramChange(cmd: Commands.ProgramChange) {
		this.synth.channels[this.track].programNumber = cmd.program;
	}

	private OpenTrack(cmd: Commands.OpenTrack) {
		this.openTrackCallback(cmd.track, cmd.offset);
	}

	private Jump(cmd: Commands.Jump) {
		// -1 because the pointer will be incremented at the end of the tick
		this.pointer = cmd.offset - 1;
	}

	private Call(cmd: Commands.Call) {
		this.callReturnStack.push(this.pointer);
		// -1 because the pointer will be incremented at the end of the tick
		this.pointer = cmd.offset - 1;
	}

	private Random(cmd: Commands.Random) {}
	private Variable(cmd: Commands.Variable) {}

	private If(cmd: Commands.If) {
		if (this.conditionalFlag) {
			const subCmd = cmd.subCommand;
			this.handlers[subCmd.type].bind(this)(subCmd as any);
		}
	}

	private SetVariable(cmd: Commands.SetVariable) {
		this.variables.set(cmd.variable, cmd.value);
	}

	private AddVariable(cmd: Commands.AddVariable) {
		this.variables.set(cmd.variable, this.variables.get(cmd.variable) + cmd.value);
	}

	private SubtractVariable(cmd: Commands.SubtractVariable) {
		this.variables.set(cmd.variable, this.variables.get(cmd.variable) - cmd.value);
	}

	private MultiplyVariable(cmd: Commands.MultiplyVariable) {
		this.variables.set(cmd.variable, this.variables.get(cmd.variable) * cmd.value);
	}
	
	private DivideVariable(cmd: Commands.DivideVariable) {
		this.variables.set(cmd.variable, this.variables.get(cmd.variable) / cmd.value);
	}

	private ShiftVariable(cmd: Commands.ShiftVariable) {
		this.variables.set(cmd.variable, this.variables.get(cmd.variable) << cmd.value);
	}
	
	private RandomVariable(cmd: Commands.RandomVariable) {
		const value = this.random.next() % (cmd.max - 1);
		this.variables.set(cmd.variable, value);
	}

	private CompareEqual(cmd: Commands.CompareEqual) {
		this.conditionalFlag = this.variables.get(cmd.variable) === cmd.value;
	}

	private CompareGreaterOrEqual(cmd: Commands.CompareGreaterOrEqual) {
		this.conditionalFlag = this.variables.get(cmd.variable) >= cmd.value;
	}

	private CompareGreater(cmd: Commands.CompareGreater) {
		this.conditionalFlag = this.variables.get(cmd.variable) > cmd.value;
	}

	private CompareLessOrEqual(cmd: Commands.CompareLessOrEqual) {
		this.conditionalFlag = this.variables.get(cmd.variable) <= cmd.value;
	}

	private CompareLess(cmd: Commands.CompareLess) {
		this.conditionalFlag = this.variables.get(cmd.variable) < cmd.value;
	}

	private CompareNotEqual(cmd: Commands.CompareNotEqual) {
		this.conditionalFlag = this.variables.get(cmd.variable) !== cmd.value;
	}

	private Pan(cmd: Commands.Pan) {
		if (cmd.pan < 64) {
			this.synth.channels[this.track].pan = (cmd.pan - 64) / 64;
		} else {
			this.synth.channels[this.track].pan = (cmd.pan - 64) / 63;
		}
	}

	private Volume(cmd: Commands.Volume) {
		this.volume1 = cmd.volume;
		this.synth.channels[this.track].setVolume(this.volume1, this.volume2);
	}

	private MainVolume(cmd: Commands.MainVolume) {}
	private Transpose(cmd: Commands.Transpose) {}

	private PitchBend(cmd: Commands.PitchBend) {
		// Pitch bend is between -128 and 127
		let bendNormalized = 0;
		if (cmd.bend > 0) {
			bendNormalized = cmd.bend / 127;
		} else {
			bendNormalized = cmd.bend / 128;
		}

		this.pitchBend = bendNormalized;

		const semitones = this.pitchBend * this.pitchBendRange;
		this.synth.channels[this.track].pitchBend(semitones);
	}

	private PitchBendRange(cmd: Commands.PitchBendRange) {
		this.pitchBendRange = cmd.range;

		const semitones = this.pitchBend * this.pitchBendRange;
		this.synth.channels[this.track].pitchBend(semitones);
	}

	private Priority(cmd: Commands.Priority) {}
	private NoteWaitMode(cmd: Commands.NoteWaitMode) {}
	private Tie(cmd: Commands.Tie) {}
	private PortamentoControl(cmd: Commands.Portamento) {}

	private ModulationDepth(cmd: Commands.ModulationDepth) {
		this.modulationDepth = cmd.depth;
		this.synth.channels[this.track].setModulation(this.modulationDepth, this.modulationRange, this.modulationSpeed, this.modulationDelay, this.modulationType);
	}

	private ModulationSpeed(cmd: Commands.ModulationSpeed) {
		this.modulationSpeed = cmd.speed;
		this.synth.channels[this.track].setModulation(this.modulationDepth, this.modulationRange, this.modulationSpeed, this.modulationDelay, this.modulationType);
	}

	private ModulationType(cmd: Commands.ModulationType) {
		this.modulationType = cmd.modType;
		this.synth.channels[this.track].setModulation(this.modulationDepth, this.modulationRange, this.modulationSpeed, this.modulationDelay, this.modulationType);
	}

	private ModulationRange(cmd: Commands.ModulationRange) {
		this.modulationRange = cmd.range;
		this.synth.channels[this.track].setModulation(this.modulationDepth, this.modulationRange, this.modulationSpeed, this.modulationDelay, this.modulationType);
	}

	private PortamentoSwitch(cmd: Commands.PortamentoSwitch) {}
	private PortamentoTime(cmd: Commands.PortamentoTime) {}
	private Attack(cmd: Commands.Attack) {}
	private Decay(cmd: Commands.Decay) {}
	private Sustain(cmd: Commands.Sustain) {}
	private Release(cmd: Commands.Release) {}
	private LoopStart(cmd: Commands.LoopStart) {}

	private Volume2(cmd: Commands.Volume2) {
		this.volume2 = cmd.volume;
		this.synth.channels[this.track].setVolume(this.volume1, this.volume2);
	}

	private PrintVariable(cmd: Commands.PrintVariable) {}

	private ModulationDelay(cmd: Commands.ModulationDelay) {
		this.modulationDelay = cmd.delay;
		this.synth.channels[this.track].setModulation(this.modulationDepth, this.modulationRange, this.modulationSpeed, this.modulationDelay, this.modulationType);
	}

	private Tempo(cmd: Commands.Tempo) {
		this.changeTempoCallback(cmd.tempo);
	}

	private SweepPitch(cmd: Commands.SweepPitch) {}
	private LoopEnd(cmd: Commands.LoopEnd) {}

	private Return(cmd: Commands.Return) {
		this.pointer = this.callReturnStack.pop();
	}

	private AllocateTracks(cmd: Commands.AllocateTracks) {}

	private Fin(cmd: Commands.Fin) {
		this.stopTrackCallback(this.track);

		// Hacky way to stop the tick while loop
		this.wait = -1;
	}
}

export interface TrackInfo {
	pitchBendSemitones: number;
	volume1: number;
	volume2: number;
	modDepth: number;
	modRange: number;
	modSpeed: number;
	modDelay: number;
	modType: ModType;
}