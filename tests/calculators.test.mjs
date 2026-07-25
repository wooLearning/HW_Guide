import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const code = await readFile(new URL("../assets/calculators.js", import.meta.url), "utf8");
const context = { globalThis: {} };
vm.runInNewContext(code, context);
const calculators = context.globalThis.HWCalculators;

const approximately = (actual, expected, tolerance = 1e-12) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
};

test("loaded voltage divider includes load resistance", () => {
  assert.equal(calculators.loadedDivider(5, 1000, 1000, Infinity).vout, 2.5);
  approximately(calculators.loadedDivider(5, 1000, 1000, 1000).vout, 5 / 3);
});

test("loaded voltage divider reports source current and power", () => {
  const result = calculators.loadedDivider(12, 1000, 2000, Infinity);
  approximately(result.vout, 8);
  approximately(result.sourceCurrent, 0.004);
  approximately(result.loadPower, 0.032);
});

test("RC charge reaches 63.2 percent at one time constant", () => {
  approximately(calculators.rcCharge(1, 1, 1, 1), 1 - Math.exp(-1));
  approximately(calculators.rcDischarge(1, 1, 1, 1), Math.exp(-1));
});

test("series RLC magnitude is minimum at resonance", () => {
  const resistance = 10;
  const inductance = 10e-3;
  const capacitance = 1e-6;
  const resonance = 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
  approximately(
    calculators.rlcMagnitude(resistance, inductance, capacitance, resonance),
    resistance,
    1e-9,
  );
});

test("real capacitor model reaches ESR at self resonance", () => {
  const capacitance = 100e-9;
  const esr = 0.05;
  const esl = 1e-9;
  const resonance = 1 / (2 * Math.PI * Math.sqrt(esl * capacitance));
  approximately(
    calculators.capacitorImpedance(capacitance, esr, esl, resonance),
    esr,
    1e-9,
  );
});

test("reflection coefficient handles matched open and short loads", () => {
  assert.equal(calculators.reflectionCoefficient(50, 50), 0);
  assert.equal(calculators.reflectionCoefficient(Infinity, 50), 1);
  assert.equal(calculators.reflectionCoefficient(0, 50), -1);
});

test("reflected step levels include source and load coefficients", () => {
  const result = calculators.reflectedStepLevels(1, 25, 50, 100);
  approximately(result.incident, 2 / 3);
  approximately(result.loadCoefficient, 1 / 3);
  approximately(result.firstLoadStep, 8 / 9);
  approximately(result.sourceCoefficient, -1 / 3);
});

test("parallel impedance combines finite branches", () => {
  approximately(calculators.parallelImpedance([10, 20]), 20 / 3);
  assert.equal(calculators.parallelImpedance([Infinity, 5]), 5);
});

test("target impedance is allowed ripple divided by current step", () => {
  assert.equal(calculators.targetImpedance(0.05, 2), 0.025);
});

test("alias frequency folds into the first Nyquist zone", () => {
  assert.equal(calculators.aliasFrequency(90e6, 100e6), 10e6);
  assert.equal(calculators.aliasFrequency(130e6, 100e6), 30e6);
  assert.equal(calculators.aliasFrequency(150e6, 100e6), 50e6);
});

test("scope and signal rise times combine by root sum square", () => {
  approximately(
    calculators.observedRiseTime(1e-9, 2e-9),
    Math.sqrt(5) * 1e-9,
    1e-18,
  );
  approximately(calculators.bandwidthForRiseTime(1e-9), 350e6, 1e-6);
});

test("probe ground lead inductance scales with length", () => {
  approximately(calculators.probeGroundInductance(0.1), 100e-9);
});

test("engineering formatter uses stable SI prefixes", () => {
  assert.equal(calculators.formatEngineering(0.000001, "F"), "1.00 µF");
  assert.equal(calculators.formatEngineering(25000000, "Hz"), "25.0 MHz");
  assert.equal(calculators.formatEngineering(0, "V"), "0 V");
});

test("physically invalid values produce NaN instead of plausible numbers", () => {
  assert.ok(Number.isNaN(calculators.rcCharge(1, -1, 1, 1)));
  assert.ok(Number.isNaN(calculators.targetImpedance(0.05, 0)));
  assert.ok(Number.isNaN(calculators.aliasFrequency(10, 0)));
});
