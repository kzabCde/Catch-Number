export function createForestAmbientUrl(durationSec = 10, sampleRate = 22050): string {
  const frameCount = Math.floor(durationSec * sampleRate);
  const bytesPerSample = 2;
  const wavHeaderSize = 44;
  const dataSize = frameCount * bytesPerSample;
  const buffer = new ArrayBuffer(wavHeaderSize + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const hashNoise = (x: number) => {
    const s = Math.sin(x * 127.1) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };

  for (let i = 0; i < frameCount; i += 1) {
    const t = i / sampleRate;
    const wind = hashNoise(i * 0.03) * 0.045 * (0.65 + 0.35 * Math.sin(2 * Math.PI * 0.04 * t));

    let birds = 0;
    const chirpPhase = (t * 0.11) % 1;
    if (chirpPhase < 0.09) {
      const env = Math.sin((chirpPhase / 0.09) * Math.PI);
      const freq = 1200 + 500 * Math.sin(2 * Math.PI * 7 * chirpPhase);
      birds += env * 0.08 * Math.sin(2 * Math.PI * freq * t);
    }

    const sample = Math.max(-1, Math.min(1, wind + birds));
    view.setInt16(wavHeaderSize + i * 2, sample * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}
