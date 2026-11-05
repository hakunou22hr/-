"""Bundle editable sources and assets without duplicating the large movies."""
import pathlib,zipfile
p=pathlib.Path('public/previews/conic-cinema');target=p/'source.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
    for file in pathlib.Path('preview-src/conic-cinema').iterdir():
        if file.is_file():z.write(file,str(file))
    for file in pathlib.Path('materials/conic-cinema').iterdir():
        if file.is_file():z.write(file,str(file))
    for file in p.iterdir():
        if file.is_file() and file.suffix not in ['.mp4','.zip']:z.write(file,str(file))
with zipfile.ZipFile(target) as z:assert z.testzip() is None
print('Editable source bundle:',target,target.stat().st_size,'bytes')
