"use strict";

(() => {
  const isFiniteNumber = (value) => Number.isFinite(value);
  const isPositive = (value) => isFiniteNumber(value) && value > 0;
  const isNonNegative = (value) => isFiniteNumber(value) && value >= 0;

  function parallelImpedance(values) {
    if (!Array.isArray(values) || values.length === 0) return NaN;
    if (values.some((value) => value === 0)) return 0;
    if (
      values.some(
        (value) => value !== Infinity && (!isFiniteNumber(value) || value < 0),
      )
    ) {
      return NaN;
    }

    const conductance = values.reduce(
      (sum, value) => sum + (value === Infinity ? 0 : 1 / value),
      0,
    );
    return conductance === 0 ? Infinity : 1 / conductance;
  }

  function loadedDivider(vin, rTop, rBottom, rLoad = Infinity) {
    const validLoad = rLoad === Infinity || isPositive(rLoad);
    if (!isFiniteNumber(vin) || !isPositive(rTop) || !isPositive(rBottom) || !validLoad) {
      return {
        vout: NaN,
        sourceCurrent: NaN,
        loadPower: NaN,
        externalLoadPower: NaN,
        equivalentBottom: NaN,
      };
    }

    const equivalentBottom = parallelImpedance([rBottom, rLoad]);
    const sourceCurrent = vin / (rTop + equivalentBottom);
    const vout = sourceCurrent * equivalentBottom;
    return {
      vout,
      sourceCurrent,
      loadPower: (vout * vout) / rBottom,
      externalLoadPower: rLoad === Infinity ? 0 : (vout * vout) / rLoad,
      equivalentBottom,
    };
  }

  function rcCharge(finalVoltage, resistance, capacitance, time, initialVoltage = 0) {
    if (
      !isFiniteNumber(finalVoltage) ||
      !isFiniteNumber(initialVoltage) ||
      !isPositive(resistance) ||
      !isPositive(capacitance) ||
      !isNonNegative(time)
    ) {
      return NaN;
    }
    const tau = resistance * capacitance;
    return finalVoltage + (initialVoltage - finalVoltage) * Math.exp(-time / tau);
  }

  function rcDischarge(initialVoltage, resistance, capacitance, time) {
    if (
      !isFiniteNumber(initialVoltage) ||
      !isPositive(resistance) ||
      !isPositive(capacitance) ||
      !isNonNegative(time)
    ) {
      return NaN;
    }
    return initialVoltage * Math.exp(-time / (resistance * capacitance));
  }

  function rlcMagnitude(resistance, inductance, capacitance, frequency) {
    if (
      !isNonNegative(resistance) ||
      !isPositive(inductance) ||
      !isPositive(capacitance) ||
      !isPositive(frequency)
    ) {
      return NaN;
    }
    const omega = 2 * Math.PI * frequency;
    const reactance = omega * inductance - 1 / (omega * capacitance);
    return Math.hypot(resistance, reactance);
  }

  function capacitorImpedance(capacitance, esr, esl, frequency) {
    if (
      !isPositive(capacitance) ||
      !isNonNegative(esr) ||
      !isNonNegative(esl) ||
      !isPositive(frequency)
    ) {
      return NaN;
    }
    const omega = 2 * Math.PI * frequency;
    const reactance = omega * esl - 1 / (omega * capacitance);
    return Math.hypot(esr, reactance);
  }

  function reflectionCoefficient(loadImpedance, characteristicImpedance) {
    if (!isPositive(characteristicImpedance)) return NaN;
    if (loadImpedance === Infinity) return 1;
    if (!isNonNegative(loadImpedance)) return NaN;
    return (loadImpedance - characteristicImpedance) /
      (loadImpedance + characteristicImpedance);
  }

  function reflectedStepLevels(
    sourceVoltage,
    sourceImpedance,
    characteristicImpedance,
    loadImpedance,
  ) {
    if (
      !isFiniteNumber(sourceVoltage) ||
      !isNonNegative(sourceImpedance) ||
      !isPositive(characteristicImpedance) ||
      !(loadImpedance === Infinity || isNonNegative(loadImpedance))
    ) {
      return {
        incident: NaN,
        loadCoefficient: NaN,
        sourceCoefficient: NaN,
        firstLoadStep: NaN,
      };
    }

    const incident =
      sourceVoltage * characteristicImpedance /
      (sourceImpedance + characteristicImpedance);
    const loadCoefficient = reflectionCoefficient(
      loadImpedance,
      characteristicImpedance,
    );
    const sourceCoefficient =
      (sourceImpedance - characteristicImpedance) /
      (sourceImpedance + characteristicImpedance);

    return {
      incident,
      loadCoefficient,
      sourceCoefficient,
      firstLoadStep: incident * (1 + loadCoefficient),
    };
  }

  function targetImpedance(allowedRipple, currentStep) {
    if (!isNonNegative(allowedRipple) || !isPositive(currentStep)) return NaN;
    return allowedRipple / currentStep;
  }

  function coupledNoiseEstimate(couplingCapacitance, aggressorSlewRate, victimImpedance) {
    if (
      !isNonNegative(couplingCapacitance) ||
      !isNonNegative(aggressorSlewRate) ||
      !isNonNegative(victimImpedance)
    ) {
      return NaN;
    }
    return couplingCapacitance * aggressorSlewRate * victimImpedance;
  }

  function aliasFrequency(signalFrequency, sampleRate) {
    if (!isNonNegative(signalFrequency) || !isPositive(sampleRate)) return NaN;
    const folded = ((signalFrequency % sampleRate) + sampleRate) % sampleRate;
    return Math.min(folded, sampleRate - folded);
  }

  function observedRiseTime(signalRiseTime, scopeRiseTime) {
    if (!isNonNegative(signalRiseTime) || !isNonNegative(scopeRiseTime)) return NaN;
    return Math.hypot(signalRiseTime, scopeRiseTime);
  }

  function bandwidthForRiseTime(riseTime, coefficient = 0.35) {
    if (!isPositive(riseTime) || !isPositive(coefficient)) return NaN;
    return coefficient / riseTime;
  }

  function probeGroundInductance(lengthMetres) {
    if (!isNonNegative(lengthMetres)) return NaN;
    return lengthMetres * 1e-6;
  }

  const engineeringPrefixes = [
    { exponent: 12, symbol: "T" },
    { exponent: 9, symbol: "G" },
    { exponent: 6, symbol: "M" },
    { exponent: 3, symbol: "k" },
    { exponent: 0, symbol: "" },
    { exponent: -3, symbol: "m" },
    { exponent: -6, symbol: "µ" },
    { exponent: -9, symbol: "n" },
    { exponent: -12, symbol: "p" },
    { exponent: -15, symbol: "f" },
  ];

  function formatEngineering(value, unit = "") {
    if (!isFiniteNumber(value)) return `— ${unit}`.trim();
    if (value === 0) return `0 ${unit}`.trim();

    const absoluteValue = Math.abs(value);
    const prefix =
      engineeringPrefixes.find(
        ({ exponent }) => absoluteValue >= 10 ** exponent,
      ) ?? engineeringPrefixes[engineeringPrefixes.length - 1];
    const scaled = value / 10 ** prefix.exponent;
    const magnitude = Math.abs(scaled);
    const decimals = magnitude >= 100 ? 0 : magnitude >= 10 ? 1 : 2;
    return `${scaled.toFixed(decimals)} ${prefix.symbol}${unit}`.trim();
  }

  globalThis.HWCalculators = Object.freeze({
    loadedDivider,
    rcCharge,
    rcDischarge,
    rlcMagnitude,
    capacitorImpedance,
    reflectionCoefficient,
    reflectedStepLevels,
    parallelImpedance,
    targetImpedance,
    coupledNoiseEstimate,
    aliasFrequency,
    observedRiseTime,
    bandwidthForRiseTime,
    probeGroundInductance,
    formatEngineering,
  });
})();
