// Resample the browser's native input rate to mono PCM16 at 16 kHz.
class HarjahCapture extends AudioWorkletProcessor {
 constructor(){super();this.sum=0;this.count=0;this.phase=0;this.samples=[];}
 process(inputs){const data=inputs[0]?.[0];if(!data)return true;for(const value of data){this.sum+=value;this.count++;this.phase+=16000;if(this.phase>=sampleRate){this.phase-=sampleRate;this.samples.push(Math.max(-1,Math.min(1,this.sum/this.count)));this.sum=0;this.count=0;if(this.samples.length===1600){const out=new Int16Array(1600);let energy=0;for(let i=0;i<1600;i++){out[i]=Math.round(this.samples[i]*32767);energy+=this.samples[i]**2}this.port.postMessage({pcm:out.buffer,level:Math.sqrt(energy/1600)},[out.buffer]);this.samples=[]}}}return true;}
}
registerProcessor('harjah-capture',HarjahCapture);
