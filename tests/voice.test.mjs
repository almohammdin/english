import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {VoiceConversation} from '../voice-live.mjs';
// Exercise the actual tools with the application loaded in the DOM harness separately.
// Here check transport batching, interrupted output, cancellation and resource cleanup.
const sent=[],calls=[],events=[],stopped=[];
const bridge={locked:()=>false,execute:async(name)=>{calls.push(name);return {ok:true}},context:()=>({}),declarations:[]};
const c=new VoiceConversation(bridge,{status:s=>events.push(s)});
c.active=true;c.sequence=1;c.audio={currentTime:0,state:'running',close:async()=>stopped.push('audio')};
c.stream={getTracks:()=>[{stop:()=>stopped.push('mic')}]};
c.sources.add({stop:()=>stopped.push('playback')});
const session={async *receive(){yield {type:'serverContent',interrupted:true};yield {type:'toolCallCancellation',ids:['cancelled']};yield {type:'toolCall',functionCalls:[{id:'a',name:'open_today'},{id:'b',name:'show_section'},{id:'cancelled',name:'navigate'}]};},sendFunctionResponses:async r=>sent.push(r),close:async()=>stopped.push('socket')};c.session=session;
await c.receive(session,1);
assert.deepEqual(calls,['open_today','show_section']);assert.deepEqual(sent[0].map(r=>r.id),['a','b']);assert.ok(sent[0].every(r=>r.response.ok));assert.equal(c.active,false);
for(const resource of ['audio','mic','playback','socket'])assert.ok(stopped.includes(resource));
await c.stop(); // idempotent cleanup
// Captured audio is PCM16 at 16 kHz, independent of device sample rate.
for(const rate of [48000,44100,16000]){let Processor;const frames=[];const scope={sampleRate:rate,AudioWorkletProcessor:class{constructor(){this.port={postMessage:m=>frames.push(m)}}},registerProcessor:(_,p)=>Processor=p,Int16Array,Math};vm.runInNewContext(fs.readFileSync(new URL('../voice-capture.js',import.meta.url),'utf8'),scope);const processor=new Processor();for(let offset=0;offset<rate;offset+=128)processor.process([[new Float32Array(Math.min(128,rate-offset)).fill(.5)]]);assert.equal(frames.length,10);assert.equal(new Int16Array(frames[0].pcm).length,1600);assert.ok(frames[0].level>.49&&frames[0].level<.51);}
console.log('PASS: live tool IDs and batching, canceled calls, interruption, cleanup and 16 kHz PCM capture.');
