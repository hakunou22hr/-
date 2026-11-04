"""Run after render/background.check.cjs. Requires Pillow; samples only background margins."""
import json
from pathlib import Path
from PIL import Image
report = Path('materials/birth-of-radian/verification/background.json')
data = json.loads(report.read_text())
pairs = []
for before, after in [(6, 7), (20, 21), (42, 43), (62, 63), (82, 83)]:
    first = Image.open(f'work/temporal/{before}.png').convert('RGB')
    second = Image.open(f'work/temporal/{after}.png').convert('RGB')
    width, height = first.size
    a, b = first.load(), second.load()
    changed = total = 0
    for y in range(height):
        for x in range(width):
            if x < width * .2 or x > width * .8 or y > height * .85:
                total += 1
                if sum(abs(a[x, y][k] - b[x, y][k]) for k in range(3)) > 45:
                    changed += 1
    fraction = changed / total
    assert fraction > .025, f'Insufficient visible background motion: {before}s, {fraction}'
    pairs.append(dict(fromTime=before, toTime=after, backgroundChangedFraction=round(fraction, 4)))
data['pixelComparisons'] = pairs
data['pixelComparisonMethod'] = dict(rgbDifferenceSumThreshold=45, region='left 20%, right 20%, bottom 15%')
report.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
print('PASS: visible background motion in all five scenes')
