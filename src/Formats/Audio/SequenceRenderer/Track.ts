import { CommandType, commandTypeToString } from "../SSEQ/CommandType";
import { SDAT } from "../SDAT/SDAT";
import { SSEQ } from "../SSEQ/SSEQ";
import { Commands } from "../SSEQ/Command";
import { SequenceInfo } from "../SDAT/FileInfo";
import { SBNK } from "../SBNK/SBNK";
import { SWAR } from "../SWAR/SWAR";
import { Synthesizer } from "./Synthesizer";

export class Track {	
	constructor(track: number, offset: number, sseq: SSEQ, sdat: SDAT, synth: Synthesizer, sampleRate: number, changeTempo: (tempo: number) => void, openTrack: (track: number, offset: number) => void) {
		this.track = track;
		this.offset = offset;
		this.sseq = sseq;
		this.sdat = sdat;
		this.sampleRate = sampleRate;
		this.synth = synth;
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

	track: number;
	offset: number;
	sseq: SSEQ;
	sdat: SDAT;
	sampleRate: number;
	synth: Synthesizer;
	changeTempoCallback: (tempo: number) => void;
	openTrackCallback: (track: number, offset: number) => void;

	pointer: number;

	wait: number = 0;
	callReturnStack: number[] = [];

	tick() {
		if (this.wait > 0) {
			this.wait--;
			return;
		}

		while (this.wait === 0) {
			const command = this.sseq.data.commands[this.pointer];
			
			if (this.track === 0) {
				console.log("[" + this.pointer + "] " + commandTypeToString(command.type) + " : " + JSON.stringify(command));
			}
			
			this.handlers[command.type].bind(this)(command as any);

			this.pointer++;
		}
	}

	private Note(cmd: Commands.Note) {}

	private Wait(cmd: Commands.Wait) {
		this.wait = cmd.duration;
	}

	private ProgramChange(cmd: Commands.ProgramChange) {}
	private OpenTrack(cmd: Commands.OpenTrack) {}
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
	private If(cmd: Commands.If) {}
	private SetVariable(cmd: Commands.SetVariable) {}
	private AddVariable(cmd: Commands.AddVariable) {}
	private SubtractVariable(cmd: Commands.SubtractVariable) {}
	private MultiplyVariable(cmd: Commands.MultiplyVariable) {}
	private DivideVariable(cmd: Commands.DivideVariable) {}
	private ShiftVariable(cmd: Commands.ShiftVariable) {}
	private RandomVariable(cmd: Commands.RandomVariable) {}
	private CompareEqual(cmd: Commands.CompareEqual) {}
	private CompareGreaterOrEqual(cmd: Commands.CompareGreaterOrEqual) {}
	private CompareGreater(cmd: Commands.CompareGreater) {}
	private CompareLessOrEqual(cmd: Commands.CompareLessOrEqual) {}
	private CompareLess(cmd: Commands.CompareLess) {}
	private CompareNotEqual(cmd: Commands.CompareNotEqual) {}
	private Pan(cmd: Commands.Pan) {}
	private Volume(cmd: Commands.Volume) {}
	private MainVolume(cmd: Commands.MainVolume) {}
	private Transpose(cmd: Commands.Transpose) {}
	private PitchBend(cmd: Commands.PitchBend) {}
	private PitchBendRange(cmd: Commands.PitchBendRange) {}
	private Priority(cmd: Commands.Priority) {}
	private NoteWaitMode(cmd: Commands.NoteWaitMode) {}
	private Tie(cmd: Commands.Tie) {}
	private PortamentoControl(cmd: Commands.Portamento) {}
	private ModulationDepth(cmd: Commands.ModulationDepth) {}
	private ModulationSpeed(cmd: Commands.ModulationSpeed) {}
	private ModulationType(cmd: Commands.ModulationType) {}
	private ModulationRange(cmd: Commands.ModulationRange) {}
	private PortamentoSwitch(cmd: Commands.PortamentoSwitch) {}
	private PortamentoTime(cmd: Commands.PortamentoTime) {}
	private Attack(cmd: Commands.Attack) {}
	private Decay(cmd: Commands.Decay) {}
	private Sustain(cmd: Commands.Sustain) {}
	private Release(cmd: Commands.Release) {}
	private LoopStart(cmd: Commands.LoopStart) {}
	private Volume2(cmd: Commands.Volume2) {}
	private PrintVariable(cmd: Commands.PrintVariable) {}
	private ModulationDelay(cmd: Commands.ModulationDelay) {}

	private Tempo(cmd: Commands.Tempo) {
		this.changeTempoCallback(cmd.tempo);
	}

	private SweepPitch(cmd: Commands.SweepPitch) {}
	private LoopEnd(cmd: Commands.LoopEnd) {}

	private Return(cmd: Commands.Return) {
		this.pointer = this.callReturnStack.pop();
	}

	private AllocateTracks(cmd: Commands.AllocateTracks) {}
	private Fin(cmd: Commands.Fin) {}
}