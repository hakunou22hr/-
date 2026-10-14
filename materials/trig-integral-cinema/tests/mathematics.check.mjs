import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import katex from "katex";
async function data(file) {
  const source = await readFile(
    new URL("../src/data/" + file, import.meta.url),
    "utf8",
  );
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
  return import(
    "data:text/javascript;base64," + Buffer.from(js).toString("base64")
  );
}
const { formulas } = await data("formulas.ts");
const { timeline, sceneAt, DURATION } = await data("timeline.ts");
const { shortTimeline, sourceTimeAt, SHORT_DURATION } = await data("shortTimeline.ts");
test("30 second edit retains every original scene and both complete calculations", () => {
  assert.equal(SHORT_DURATION, 30);
  assert.equal(shortTimeline.length, 10);
  shortTimeline.forEach((s, i) => {
    assert.equal(s.start, i ? shortTimeline[i - 1].end : 0);
    assert.ok(s.end > s.start);
    assert.equal(s.sourceStart, timeline[i].start);
    assert.equal(s.sourceEnd, timeline[i].end);
    assert.equal(sceneAt(sourceTimeAt(s.start)).id, s.id);
    assert.equal(sceneAt(sourceTimeAt(s.end - 1e-5)).id, s.id);
  });
  assert.equal(sourceTimeAt(30), 90);
  assert.equal(shortTimeline.at(-1).end, 30);
  assert.ok(shortTimeline[5].end - shortTimeline[5].start >= 4);
  assert.ok(shortTimeline[8].end - shortTimeline[8].start >= 4);
});
test("every lesson formula renders with KaTeX without errors", () => {
  for (const [key, value] of Object.entries(formulas)) {
    for (const tex of typeof value === "string" ? [value] : value)
      assert.doesNotThrow(
        () => katex.renderToString(tex, { throwOnError: true }),
        key,
      );
  }
});
test("10 scenes form an uninterrupted 90 second timeline", () => {
  assert.equal(DURATION, 90);
  assert.equal(timeline.length, 10);
  assert.equal(timeline[0].start, 0);
  assert.equal(timeline.at(-1).end, 90);
  timeline.forEach((s, i) => {
    assert.ok(s.end > s.start);
    if (i) assert.equal(s.start, timeline[i - 1].end);
    assert.equal(sceneAt(s.start).id, s.id);
    assert.equal(sceneAt(s.end - 0.0001).id, s.id);
  });
  assert.equal(sceneAt(90).id, 10);
});
test("both identities and both antiderivatives match over a full 4π graph domain", () => {
  const h = 1e-5;
  const F = (x) => x / 2 - Math.sin(2 * x) / 4;
  const G = (x) => -Math.cos(4 * x) / 8 - Math.cos(2 * x) / 4;
  for (let i = 0; i <= 400; i++) {
    const x = (4 * Math.PI * i) / 400;
    const a = Math.sin(x) ** 2,
      b = Math.sin(3 * x) * Math.cos(x);
    assert.ok(Math.abs(a - (1 - Math.cos(2 * x)) / 2) < 1e-12);
    assert.ok(Math.abs(b - (Math.sin(4 * x) + Math.sin(2 * x)) / 2) < 1e-12);
    assert.ok(Math.abs((F(x + h) - F(x - h)) / (2 * h) - a) < 1e-8);
    assert.ok(Math.abs((G(x + h) - G(x - h)) / (2 * h) - b) < 1e-8);
  }
});
test("required constants and integration coefficients are present in displayed answers", () => {
  assert.match(formulas.answer1, /\\frac14\\sin 2x\+C/);
  assert.match(formulas.answer2, /-\\frac18\\cos4x-\\frac14\\cos2x\+C/);
});
