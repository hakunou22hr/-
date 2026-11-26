"""Generate a reviewable, timed Japanese voice track. Preserve configured TLS CA/proxy settings."""
import asyncio, json, os, pathlib, subprocess, ssl, urllib.request, wave, array, math, hashlib
import edge_tts
import edge_tts.communicate as edge_module
root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(os.environ.get('OUTPUT','/workspace/work/mvt-v8/narration'));out.mkdir(parents=True,exist_ok=True)
script=json.loads((root/'narration/script.json').read_text())
if os.environ.get('SSL_CERT_FILE'):edge_module._SSL_CTX=ssl.create_default_context(cafile=os.environ['SSL_CERT_FILE'])
def run(args):return subprocess.check_output(args,stderr=subprocess.STDOUT)
def duration(path):return float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(path)]))
async def generate():
    sem=asyncio.Semaphore(3)
    async def cue(i,item):
        path=out/f'cue-{i:02}.mp3'
        signature=out/f'cue-{i:02}.sha256'; digest=hashlib.sha256((item['text']+script['voice']+script['rate']).encode()).hexdigest()
        if not path.exists() or path.stat().st_size<100 or not signature.exists() or signature.read_text()!=digest:
            async with sem:
                await edge_tts.Communicate(item['text'],script['voice'],rate=script['rate'],proxy=urllib.request.getproxies().get('https'),connect_timeout=20,receive_timeout=60).save(str(path))
                signature.write_text(digest)
        print('VOICE',i,'seconds',round(duration(path),3),flush=True)
    await asyncio.gather(*(cue(i,c) for i,c in enumerate(script['cues'])))
asyncio.run(generate())
rate=48000;track=array.array('h',[0])*(90*rate);report=[]
for i,cue in enumerate(script['cues']):
    source=out/f'cue-{i:02}.mp3';seconds=duration(source);window=cue['end']-cue['start']-.08
    # Speed up only when needed; avoid stretching normal speech to fill silent pauses.
    tempo=max(1,seconds/window)
    if tempo>1.45:raise RuntimeError(f'Cue {i} needs excessive acceleration {tempo:.2f}; shorten its text')
    wav=out/f'cue-{i:02}.wav';run(['ffmpeg','-y','-v','error','-i',str(source),'-af',f'atempo={tempo:.8f},afade=t=in:st=0:d=0.018','-ar',str(rate),'-ac','1','-c:a','pcm_s16le',str(wav)])
    with wave.open(str(wav),'rb') as f:samples=array.array('h',f.readframes(f.getnframes()))
    start=round(cue['start']*rate);assert start+len(samples)<=round(cue['end']*rate)
    track[start:start+len(samples)]=samples
    report.append({**cue,'sourceDuration':seconds,'tempo':tempo,'speechEnd':(start+len(samples))/rate})
path=out/'narration-90s.wav'
with wave.open(str(path),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(track.tobytes())
# Speech energy drives the guide's pulse; the movement remains based on the same absolute timeline.
step=rate//20;energy=[math.sqrt(sum(v*v for v in track[i:i+step])/step)/32768 for i in range(0,len(track),step)];peak=max(energy)
normalized=[round(min(1,(x/max(.00001,peak))**.55),3) for x in energy]
(root/'narration/envelope.mjs').write_text('export const sampleRate=20;\nexport const envelope='+json.dumps(normalized,separators=(',',':'))+';\n')
(out/'timing-report.json').write_text(json.dumps({'voice':script['voice'],'duration':90,'rate':rate,'rmsPeak':peak,'peakSample':max(abs(v) for v in track),'cues':report,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()},ensure_ascii=False,indent=2)+'\n')
print('NARRATION READY',path,flush=True)
