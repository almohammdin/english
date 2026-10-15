export function encodeInput(input,sourceRate){
 if(!input.length||!Number.isFinite(sourceRate)||sourceRate<=0)return null;
 const ratio=sourceRate/16000,count=Math.max(1,Math.round(input.length/ratio));
 const buffer=new ArrayBuffer(count*2),view=new DataView(buffer);let energy=0;
 for(let i=0;i<count;i++){const pos=i*ratio,left=Math.min(Math.floor(pos),input.length-1),right=Math.min(left+1,input.length-1),mix=pos-left;const value=Math.max(-1,Math.min(1,input[left]*(1-mix)+input[right]*mix));view.setInt16(i*2,Math.round(value*(value<0?32768:32767)),true);energy+=value*value;}
 const bytes=new Uint8Array(buffer);let raw='';for(const byte of bytes)raw+=String.fromCharCode(byte);
 return {data:btoa(raw),mimeType:'audio/pcm;rate=16000',level:Math.sqrt(energy/count),samples:count};
}
