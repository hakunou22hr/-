import json,os,subprocess,wave
from pathlib import Path
base=Path.cwd();root=base/'work/birth-of-e/tts/root';dest=base/'work/birth-of-e/tts'
env=dict(os.environ,LD_LIBRARY_PATH=str(root/'usr/lib/x86_64-linux-gnu'))
cues=json.load(open(base/'work/birth-of-e/cues.json'))
report=[];parts=[]
for i,c in enumerate(cues):
 text=dest/f'{i}.txt';text.write_text(c['text'])
 raw=dest/f'{i}-raw.wav';out=dest/f'{i}.wav'
 subprocess.run([str(root/'usr/bin/open_jtalk'),'-x',str(root/'var/lib/mecab/dic/open-jtalk/naist-jdic'),'-m',str(root/'usr/share/hts-voice/nitech-jp-atr503-m001/nitech_jp_atr503_m001.htsvoice'),'-r','1.06','-ow',str(raw),str(text)],env=env,check=True)
 with wave.open(str(raw)) as w:duration=w.getnframes()/w.getframerate()
 slot=c['end']-c['start'];speed=max(1,duration/(slot-.55))
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',f'atempo={speed:.8f},apad,atrim=duration={slot}','-ar','48000','-ac','1',str(out)],check=True)
 report.append(dict(c,start=c['start'],end=c['end'],rawSeconds=duration,speed=speed));parts.append(out.read_bytes())
(dest/'concat.txt').write_text('\n'.join(f"file '{dest/f'{i}.wav'}'" for i in range(len(cues))))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(dest/'concat.txt'),'-c:a','pcm_s16le',str(base/'work/birth-of-e/tts/narration.wav')],check=True)
json.dump(report,open(base/'work/birth-of-e/audio-report.json','w'),ensure_ascii=False,indent=2)
print(json.dumps([{'slot':r['end']-r['start'],'rawSeconds':round(r['rawSeconds'],2),'speed':round(r['speed'],2)} for r in report]))
