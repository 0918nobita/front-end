import { BehaviorSubject, Observer, combineLatest, from, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

interface Input {
    audioCtx: AudioContext;
    param: number;
    checked: boolean;
}

const mainObserver: Partial<Observer<Input>> = {
    next({ audioCtx, param, checked }) {
        const source = audioCtx.createBufferSource();
        const { sampleRate, destination } = audioCtx;
        const frameCount = sampleRate * 1.0;
        const buffer = audioCtx.createBuffer(2, frameCount, sampleRate);

        for (let i = 0; i < frameCount; i++) {
            const progress = checked ? i / frameCount : 1.0; // 0.0 ~ 1.0
            const value = Math.sin((i / param) * progress);
            buffer.getChannelData(0)[i] = value;
            buffer.getChannelData(1)[i] = value;
        }

        source.buffer = buffer;
        source.connect(destination);
        source.start();
    },
};

async function setupWebAudio(): Promise<AudioContext> {
    let audioCtx;
    try {
        window.AudioContext =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContext();
    } catch (e) {
        throw new Error('Web Audio API is not supported in this browser!');
    }
    return audioCtx;
}

fromEvent(window, 'DOMContentLoaded').subscribe(() => {
    const audioCtx$ = from(setupWebAudio());

    const range = document.getElementById('range') as HTMLInputElement;
    const span = document.getElementById('param') as HTMLSpanElement;
    const button = document.getElementById('start') as HTMLButtonElement;
    const checkbox = document.getElementById('check') as HTMLInputElement;

    const param$ = new BehaviorSubject(10);
    param$.subscribe((value) => {
        span.textContent = String(value);
    });

    fromEvent(range, 'input').subscribe(() => param$.next(Number(range.value)));

    combineLatest([
        fromEvent(button, 'click'),
        audioCtx$,
    ])
        .pipe(map(([, audioCtx]) => ({ audioCtx, param: param$.getValue(), checked: checkbox.checked })))
        .subscribe(mainObserver);
});
