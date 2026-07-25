"use strict";

(() => {
  const rendererNames = [
    "bringup-flow",
    "crosstalk",
    "emc-modes",
    "energy-flow",
    "field-energy",
    "model-ladder",
    "pcb-stackup",
    "pdn-impedance",
    "phasor",
    "probe-ringing",
    "rc-transient",
    "real-capacitor",
    "return-path",
    "rlc-response",
    "sampling-alias",
    "scope-bandwidth",
    "transmission-reflection",
    "voltage-divider",
  ];

  globalThis.HWVisualizationNames = Object.freeze(rendererNames);
  if (typeof document === "undefined") return;

  const calc = globalThis.HWCalculators;
  const TAU = Math.PI * 2;

  const number = (panel, name) =>
    Number(panel.querySelector(`[data-input="${name}"]`)?.value ?? 0);

  const output = (panel, name, value) => {
    const target = panel.querySelector(`[data-out="${name}"]`);
    if (target) target.textContent = value;
  };

  const result = (panel, name, value) => {
    const target = panel.querySelector(`[data-result="${name}"]`);
    if (target) target.textContent = value;
  };

  const cssColor = (name, fallback) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback;

  const palette = () => ({
    paper: cssColor("--paper-raised", "#fffdf8"),
    background: cssColor("--paper", "#f6f3ec"),
    ink: cssColor("--ink", "#142231"),
    muted: cssColor("--ink-muted", "#60707d"),
    line: cssColor("--line", "#d8d3c9"),
    copper: cssColor("--copper", "#bb5b2a"),
    signal: cssColor("--signal", "#047d79"),
    danger: cssColor("--danger", "#b43c34"),
  });

  const setupCanvas = (canvas) => {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineJoin = "round";
    return { context, width, height, colors: palette() };
  };

  const drawGrid = (context, width, height, colors, options = {}) => {
    const left = options.left ?? 64;
    const right = options.right ?? 24;
    const top = options.top ?? 24;
    const bottom = options.bottom ?? 46;
    context.save();
    context.strokeStyle = colors.line;
    context.globalAlpha = 0.65;
    context.lineWidth = 1;
    for (let index = 0; index <= 10; index += 1) {
      const x = left + ((width - left - right) * index) / 10;
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, height - bottom);
      context.stroke();
    }
    for (let index = 0; index <= 6; index += 1) {
      const y = top + ((height - top - bottom) * index) / 6;
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(width - right, y);
      context.stroke();
    }
    context.restore();
    return { left, right, top, bottom };
  };

  const label = (context, text, x, y, colors, align = "left") => {
    context.save();
    context.fillStyle = colors.muted;
    context.font = '600 15px ui-monospace, "D2Coding", monospace';
    context.textAlign = align;
    context.fillText(text, x, y);
    context.restore();
  };

  const bind = (panel, render) => {
    const update = () => render(panel);
    panel.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });
    update();
  };

  function staticRenderer() {
    // The model ladder and energy-flow figures are complete semantic HTML.
  }

  function voltageDivider(panel) {
    const vin = number(panel, "vin");
    const r1 = number(panel, "r1");
    const r2 = number(panel, "r2");
    const rl = number(panel, "rl");
    const unloaded = calc.loadedDivider(vin, r1, r2, Infinity);
    const loaded = calc.loadedDivider(vin, r1, r2, rl);
    const error = ((loaded.vout - unloaded.vout) / unloaded.vout) * 100;

    output(panel, "vin", calc.formatEngineering(vin, "V"));
    output(panel, "r1", calc.formatEngineering(r1, "Ω"));
    output(panel, "r2", calc.formatEngineering(r2, "Ω"));
    output(panel, "rl", calc.formatEngineering(rl, "Ω"));
    result(panel, "unloaded", calc.formatEngineering(unloaded.vout, "V"));
    result(panel, "loaded", calc.formatEngineering(loaded.vout, "V"));
    result(panel, "error", `${error.toFixed(2)}%`);

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, colors } = setupCanvas(canvas);
    const railTop = 72;
    const nodeY = 210;
    const railBottom = 350;
    const dividerX = 410;
    const loadX = 690;

    const line = (x1, y1, x2, y2, color = colors.ink, lineWidth = 4) => {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    };
    const resistor = (x, y1, y2, color) => {
      const step = (y2 - y1) / 8;
      context.strokeStyle = color;
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(x, y1);
      for (let index = 1; index < 8; index += 1) {
        context.lineTo(x + (index % 2 ? 18 : -18), y1 + step * index);
      }
      context.lineTo(x, y2);
      context.stroke();
    };

    line(120, railTop, dividerX, railTop);
    line(dividerX, railTop, dividerX, 92);
    resistor(dividerX, 92, 180, colors.ink);
    line(dividerX, 180, dividerX, nodeY);
    line(dividerX, nodeY, dividerX, 240);
    resistor(dividerX, 240, 328, colors.ink);
    line(dividerX, 328, dividerX, railBottom);
    line(120, railBottom, loadX, railBottom);
    line(dividerX, nodeY, loadX, nodeY, colors.signal);
    line(loadX, nodeY, loadX, 240, colors.signal);
    resistor(loadX, 240, 328, colors.signal);
    line(loadX, 328, loadX, railBottom, colors.signal);

    context.fillStyle = colors.copper;
    context.beginPath();
    context.arc(dividerX, nodeY, 8, 0, TAU);
    context.fill();
    line(100, railTop, 100, railBottom, colors.copper, 5);
    context.beginPath();
    context.moveTo(100, railBottom);
    context.lineTo(90, railBottom - 18);
    context.lineTo(110, railBottom - 18);
    context.closePath();
    context.fill();

    const markerY = 102 + (1 - loaded.vout / Math.max(vin, 0.001)) * 196;
    context.setLineDash([8, 8]);
    line(dividerX + 32, markerY, width - 70, markerY, colors.copper, 2);
    context.setLineDash([]);
    label(context, `VIN ${vin.toFixed(1)} V`, 120, 46, colors);
    label(context, "R1", dividerX + 34, 138, colors);
    label(context, "R2", dividerX + 34, 288, colors);
    label(context, "RL", loadX + 34, 288, colors);
    label(context, `VOUT ${loaded.vout.toFixed(2)} V`, width - 74, markerY - 12, colors, "right");
  }

  function rcTransient(panel) {
    const resistance = number(panel, "r");
    const capacitance = number(panel, "c") * 1e-9;
    const time = number(panel, "t") * 1e-3;
    const tau = resistance * capacitance;
    const ratio = calc.rcCharge(1, resistance, capacitance, time);

    output(panel, "r", calc.formatEngineering(resistance, "Ω"));
    output(panel, "c", calc.formatEngineering(capacitance, "F"));
    output(panel, "t", calc.formatEngineering(time, "s"));
    result(panel, "tau", calc.formatEngineering(tau, "s"));
    result(panel, "ratio", `${(ratio * 100).toFixed(1)}%`);
    result(panel, "five-tau", calc.formatEngineering(tau * 5, "s"));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors);
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    context.strokeStyle = colors.signal;
    context.lineWidth = 5;
    context.beginPath();
    for (let index = 0; index <= 240; index += 1) {
      const normalizedTime = (index / 240) * 5;
      const value = 1 - Math.exp(-normalizedTime);
      const x = area.left + (index / 240) * plotWidth;
      const y = area.top + (1 - value) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    const markerT = Math.min(5, time / tau);
    const markerValue = 1 - Math.exp(-markerT);
    const markerX = area.left + (markerT / 5) * plotWidth;
    const markerY = area.top + (1 - markerValue) * plotHeight;
    context.fillStyle = colors.copper;
    context.beginPath();
    context.arc(markerX, markerY, 8, 0, TAU);
    context.fill();
    label(context, "0", area.left, height - 17, colors, "center");
    label(context, "1τ", area.left + plotWidth / 5, height - 17, colors, "center");
    label(context, "5τ", width - area.right, height - 17, colors, "center");
    label(context, "100%", area.left - 10, area.top + 6, colors, "right");
    label(context, "63.2%", area.left - 10, area.top + plotHeight * 0.368, colors, "right");
  }

  function phasor(panel) {
    const phase = number(panel, "phase");
    const amplitude = number(panel, "amplitude");
    output(panel, "phase", `${phase}°`);
    output(panel, "amplitude", amplitude.toFixed(2));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const centerX = 175;
    const centerY = height / 2;
    const radius = 105;
    context.strokeStyle = colors.line;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, TAU);
    context.moveTo(centerX - radius - 20, centerY);
    context.lineTo(centerX + radius + 20, centerY);
    context.moveTo(centerX, centerY - radius - 20);
    context.lineTo(centerX, centerY + radius + 20);
    context.stroke();

    const angle = (-phase * Math.PI) / 180;
    const tipX = centerX + Math.cos(angle) * radius * amplitude;
    const tipY = centerY + Math.sin(angle) * radius * amplitude;
    context.strokeStyle = colors.copper;
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(tipX, tipY);
    context.stroke();
    context.fillStyle = colors.copper;
    context.beginPath();
    context.arc(tipX, tipY, 8, 0, TAU);
    context.fill();

    const startX = 350;
    const endX = width - 28;
    context.strokeStyle = colors.line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(startX, centerY);
    context.lineTo(endX, centerY);
    context.stroke();
    context.strokeStyle = colors.signal;
    context.lineWidth = 5;
    context.beginPath();
    for (let index = 0; index <= 300; index += 1) {
      const x = startX + ((endX - startX) * index) / 300;
      const y =
        centerY -
        Math.sin((index / 300) * TAU + (phase * Math.PI) / 180) *
          radius *
          amplitude;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    label(context, `${phase}°`, centerX, 28, colors, "center");
    label(context, "phasor", centerX, height - 18, colors, "center");
    label(context, "time →", endX, height - 18, colors, "right");
  }

  function rlcResponse(panel) {
    const resistance = number(panel, "r");
    const inductance = number(panel, "l") * 1e-3;
    const capacitance = number(panel, "c") * 1e-6;
    const resonance = 1 / (TAU * Math.sqrt(inductance * capacitance));
    const quality = Math.sqrt(inductance / capacitance) / resistance;
    output(panel, "r", calc.formatEngineering(resistance, "Ω"));
    output(panel, "l", calc.formatEngineering(inductance, "H"));
    output(panel, "c", calc.formatEngineering(capacitance, "F"));
    result(panel, "f0", calc.formatEngineering(resonance, "Hz"));
    result(panel, "q", quality.toFixed(2));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors);
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    const minFrequency = resonance / 100;
    const maxFrequency = resonance * 100;
    context.strokeStyle = colors.signal;
    context.lineWidth = 5;
    context.beginPath();
    for (let index = 0; index <= 360; index += 1) {
      const frequency =
        minFrequency * (maxFrequency / minFrequency) ** (index / 360);
      const impedance = calc.rlcMagnitude(
        resistance,
        inductance,
        capacitance,
        frequency,
      );
      const normalizedCurrent = Math.min(1, resistance / impedance);
      const x = area.left + (index / 360) * plotWidth;
      const y = area.top + (1 - normalizedCurrent) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.strokeStyle = colors.copper;
    context.setLineDash([8, 8]);
    context.beginPath();
    context.moveTo(area.left + plotWidth / 2, area.top);
    context.lineTo(area.left + plotWidth / 2, height - area.bottom);
    context.stroke();
    context.setLineDash([]);
    label(context, "f0/100", area.left, height - 17, colors, "center");
    label(context, "f0", area.left + plotWidth / 2, height - 17, colors, "center");
    label(context, "100f0", width - area.right, height - 17, colors, "center");
  }

  function realCapacitor(panel) {
    const capacitance = number(panel, "c") * 1e-9;
    const esr = number(panel, "esr") * 1e-3;
    const esl = number(panel, "esl") * 1e-9;
    const resonance = 1 / (TAU * Math.sqrt(esl * capacitance));
    output(panel, "c", calc.formatEngineering(capacitance, "F"));
    output(panel, "esr", calc.formatEngineering(esr, "Ω"));
    output(panel, "esl", calc.formatEngineering(esl, "H"));
    result(panel, "fsr", calc.formatEngineering(resonance, "Hz"));
    result(panel, "zmin", calc.formatEngineering(esr, "Ω"));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors);
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    const minimum = 1e3;
    const maximum = 1e10;
    const values = [];
    for (let index = 0; index <= 420; index += 1) {
      const frequency = minimum * (maximum / minimum) ** (index / 420);
      values.push(calc.capacitorImpedance(capacitance, esr, esl, frequency));
    }
    const minLog = -3;
    const maxLog = 5;
    context.strokeStyle = colors.copper;
    context.lineWidth = 5;
    context.beginPath();
    values.forEach((impedance, index) => {
      const log = Math.log10(Math.max(1e-3, impedance));
      const x = area.left + (index / (values.length - 1)) * plotWidth;
      const y = area.top + (1 - (log - minLog) / (maxLog - minLog)) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
    const resonancePosition =
      Math.log(resonance / minimum) / Math.log(maximum / minimum);
    context.fillStyle = colors.signal;
    context.beginPath();
    context.arc(
      area.left + resonancePosition * plotWidth,
      area.top + (1 - (Math.log10(esr) - minLog) / (maxLog - minLog)) * plotHeight,
      8,
      0,
      TAU,
    );
    context.fill();
    label(context, "1 kHz", area.left, height - 17, colors, "center");
    label(context, "10 GHz", width - area.right, height - 17, colors, "center");
    label(context, "capacitive", area.left + 90, area.top + 30, colors);
    label(context, "inductive", width - area.right - 130, area.top + 30, colors);
  }

  function fieldEnergy(panel) {
    const heightControl = number(panel, "height");
    const slew = number(panel, "slew");
    const physicalHeight = heightControl / 400;
    output(panel, "height", `${physicalHeight.toFixed(2)} mm`);
    output(panel, "slew", String(slew));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const traceY = 90;
    const planeY = 180 + heightControl;
    context.fillStyle = colors.copper;
    context.fillRect(180, traceY, width - 360, 18);
    context.fillStyle = colors.ink;
    context.fillRect(80, planeY, width - 160, 18);
    label(context, "SIGNAL TRACE", width / 2, traceY - 18, colors, "center");
    label(context, "REFERENCE PLANE", width / 2, planeY + 48, colors, "center");

    const lineCount = Math.round(5 + slew);
    for (let index = 0; index < lineCount; index += 1) {
      const ratio = (index + 1) / (lineCount + 1);
      const x = 185 + ratio * (width - 370);
      context.strokeStyle = colors.signal;
      context.globalAlpha = 0.34 + 0.04 * slew;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, traceY + 18);
      context.bezierCurveTo(
        x + (ratio - 0.5) * 120,
        traceY + (planeY - traceY) * 0.35,
        x + (0.5 - ratio) * 120,
        traceY + (planeY - traceY) * 0.7,
        x,
        planeY,
      );
      context.stroke();
    }
    context.globalAlpha = 1;

    context.strokeStyle = colors.copper;
    context.setLineDash([8, 7]);
    context.lineWidth = 3;
    for (let index = 0; index < 5; index += 1) {
      const x = 260 + index * 95;
      context.beginPath();
      context.ellipse(
        x,
        (traceY + planeY) / 2,
        38,
        Math.max(24, (planeY - traceY) * 0.28),
        0,
        0,
        TAU,
      );
      context.stroke();
    }
    context.setLineDash([]);
    label(context, "E field", 96, (traceY + planeY) / 2, colors);
    label(context, "H field loops", width - 95, (traceY + planeY) / 2, colors, "right");
  }

  function transmissionReflection(panel) {
    const source = 1;
    const sourceImpedance = number(panel, "zs");
    const characteristic = number(panel, "z0");
    const load = number(panel, "zl");
    const time = number(panel, "time");
    const levels = calc.reflectedStepLevels(
      source,
      sourceImpedance,
      characteristic,
      load,
    );
    output(panel, "zs", calc.formatEngineering(sourceImpedance, "Ω"));
    output(panel, "z0", calc.formatEngineering(characteristic, "Ω"));
    output(panel, "zl", calc.formatEngineering(load, "Ω"));
    output(panel, "time", `${time.toFixed(1)} td`);
    result(panel, "gamma-l", `${levels.loadCoefficient >= 0 ? "+" : ""}${levels.loadCoefficient.toFixed(3)}`);
    result(panel, "incident", calc.formatEngineering(levels.incident, "V"));
    result(panel, "load-step", calc.formatEngineering(levels.firstLoadStep, "V"));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const startX = 150;
    const endX = width - 150;
    const centerY = height / 2;
    context.strokeStyle = colors.ink;
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(startX, centerY);
    context.lineTo(endX, centerY);
    context.stroke();
    context.fillStyle = colors.paper;
    context.strokeStyle = colors.copper;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(startX - 55, centerY, 38, 0, TAU);
    context.fill();
    context.stroke();
    context.strokeStyle = colors.signal;
    context.beginPath();
    context.moveTo(endX + 35, centerY - 55);
    context.lineTo(endX + 35, centerY + 55);
    context.stroke();
    label(context, `ZS ${sourceImpedance}Ω`, startX - 55, centerY + 75, colors, "center");
    label(context, `Z0 ${characteristic}Ω`, width / 2, centerY + 38, colors, "center");
    label(context, `ZL ${load}Ω`, endX + 35, centerY + 85, colors, "center");

    const phase = time % 2;
    const incidentPosition =
      phase <= 1
        ? startX + (endX - startX) * phase
        : endX - (endX - startX) * (phase - 1);
    context.fillStyle = phase <= 1 ? colors.copper : colors.signal;
    context.beginPath();
    context.arc(incidentPosition, centerY, 16, 0, TAU);
    context.fill();
    context.strokeStyle = colors.copper;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(startX, 90);
    context.lineTo(incidentPosition, 90);
    context.stroke();
    label(
      context,
      phase <= 1 ? `incident ${levels.incident.toFixed(3)} V →` : `← reflected ${(levels.incident * levels.loadCoefficient).toFixed(3)} V`,
      width / 2,
      70,
      colors,
      "center",
    );
  }

  function pcbStackup(panel) {
    const height = number(panel, "height");
    const width = number(panel, "width");
    const dielectric = number(panel, "dk");
    output(panel, "height", `${(height / 1000).toFixed(2)} mm`);
    output(panel, "width", `${(width / 1000).toFixed(2)} mm`);
    output(panel, "dk", dielectric.toFixed(1));
    const relative = (height / 120) / (width / 180) / Math.sqrt(dielectric / 4.1);
    result(panel, "ztrend", relative > 1.12 ? "상승" : relative < 0.88 ? "하강" : "기준");
    result(panel, "field", height < 160 ? "높음" : height < 280 ? "중간" : "낮음");

  }

  function returnPath(panel) {
    const gap = number(panel, "gap");
    const stitch = number(panel, "stitch");
    output(panel, "gap", gap === 0 ? "없음" : `${(gap / 10).toFixed(1)} mm`);
    output(panel, "stitch", `${(stitch / 10).toFixed(1)} mm`);
    const loopRatio = 1 + gap / 45 + stitch / 240;
    result(panel, "loop", `${loopRatio.toFixed(1)}×`);
    result(panel, "coupling", loopRatio < 1.8 ? "낮음" : loopRatio < 3.2 ? "중간" : "높음");

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    context.fillStyle = colors.paper;
    context.fillRect(40, 42, width - 80, height - 84);
    context.strokeStyle = colors.line;
    context.strokeRect(40, 42, width - 80, height - 84);
    const centerY = 130;
    context.strokeStyle = colors.copper;
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(90, centerY);
    context.lineTo(width - 90, centerY);
    context.stroke();

    const planeY = 270;
    context.fillStyle = colors.ink;
    if (gap === 0) {
      context.fillRect(65, planeY, width - 130, 46);
    } else {
      const gapWidth = 30 + gap;
      context.fillRect(65, planeY, width / 2 - gapWidth / 2 - 65, 46);
      context.fillRect(
        width / 2 + gapWidth / 2,
        planeY,
        width / 2 - gapWidth / 2 - 65,
        46,
      );
    }
    context.strokeStyle = colors.signal;
    context.lineWidth = 6;
    context.setLineDash([12, 10]);
    context.beginPath();
    context.moveTo(width - 100, planeY + 23);
    if (gap === 0) {
      context.lineTo(100, planeY + 23);
    } else {
      const detour = 40 + stitch / 2;
      context.lineTo(width / 2 + gap / 2 + 30, planeY + 23);
      context.quadraticCurveTo(width / 2, planeY + 23 + detour, width / 2 - gap / 2 - 30, planeY + 23);
      context.lineTo(100, planeY + 23);
    }
    context.stroke();
    context.setLineDash([]);
    label(context, "SIGNAL →", 90, centerY - 24, colors);
    label(context, "← RETURN", width - 90, planeY + 80, colors, "right");
    if (gap > 0) label(context, "PLANE GAP", width / 2, planeY - 18, colors, "center");
  }

  function crosstalk(panel) {
    const spacing = number(panel, "spacing");
    const length = number(panel, "length");
    const rise = number(panel, "rise");
    output(panel, "spacing", `${spacing} W`);
    output(panel, "length", `${length} mm`);
    output(panel, "rise", `${rise.toFixed(1)} ns`);
    const coupling = (length / 40) * (1 / spacing ** 1.35) * (1 / rise);
    result(panel, "coupling", coupling < 0.08 ? "낮음" : coupling < 0.25 ? "중간" : "높음");
    result(
      panel,
      "action",
      spacing < 3 ? "spacing 우선" : length > 60 ? "평행 길이 축소" : rise < 0.8 ? "slew 검토" : "현재 구조 검토",
    );

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const left = 65;
    const right = width - 35;
    const aggressorY = 115;
    const victimY = 285;
    context.strokeStyle = colors.line;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, aggressorY);
    context.lineTo(right, aggressorY);
    context.moveTo(left, victimY);
    context.lineTo(right, victimY);
    context.stroke();

    context.strokeStyle = colors.copper;
    context.lineWidth = 5;
    context.beginPath();
    for (let index = 0; index <= 300; index += 1) {
      const x = left + ((right - left) * index) / 300;
      const value = 1 / (1 + Math.exp(-(index - 90) / (5 + rise * 3)));
      const y = aggressorY + 55 - value * 95;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    context.strokeStyle = colors.signal;
    context.beginPath();
    for (let index = 0; index <= 300; index += 1) {
      const x = left + ((right - left) * index) / 300;
      const pulse = Math.exp(-(((index - 90) / (12 + rise * 2)) ** 2));
      const y = victimY - pulse * Math.min(82, coupling * 330);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    label(context, "AGGRESSOR", left, 34, colors);
    label(context, "VICTIM", left, victimY + 45, colors);
    label(context, `${(coupling * 100).toFixed(1)}% relative`, right, victimY + 45, colors, "right");
  }

  const complexParallelMagnitude = (frequency, branches) => {
    const omega = TAU * frequency;
    let conductance = 0;
    let susceptance = 0;
    branches.forEach(({ resistance, inductance, capacitance }) => {
      const reactance =
        omega * inductance -
        (capacitance > 0 ? 1 / (omega * capacitance) : 0);
      const denominator = resistance ** 2 + reactance ** 2;
      conductance += resistance / denominator;
      susceptance += -reactance / denominator;
    });
    return 1 / Math.hypot(conductance, susceptance);
  };

  function pdnImpedance(panel) {
    const ripple = number(panel, "ripple") * 1e-3;
    const step = number(panel, "step");
    const esl = number(panel, "esl") * 1e-9;
    const target = calc.targetImpedance(ripple, step);
    output(panel, "ripple", calc.formatEngineering(ripple, "V"));
    output(panel, "step", calc.formatEngineering(step, "A"));
    output(panel, "esl", calc.formatEngineering(esl, "H"));
    result(panel, "ztarget", calc.formatEngineering(target, "Ω"));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors);
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    const branches = [
      { resistance: 0.012, inductance: 80e-9, capacitance: 0 },
      { resistance: 0.025, inductance: 2e-9, capacitance: 47e-6 },
      { resistance: 0.012, inductance: 1.2e-9, capacitance: 4.7e-6 },
      { resistance: 0.018, inductance: esl, capacitance: 100e-9 },
    ];
    const minimum = 10;
    const maximum = 1e9;
    let largestOverTarget = 0;
    context.strokeStyle = colors.signal;
    context.lineWidth = 5;
    context.beginPath();
    for (let index = 0; index <= 500; index += 1) {
      const frequency = minimum * (maximum / minimum) ** (index / 500);
      const impedance = complexParallelMagnitude(frequency, branches);
      largestOverTarget = Math.max(largestOverTarget, impedance / target);
      const log = Math.log10(Math.max(1e-4, impedance));
      const normalized = (log + 4) / 5;
      const x = area.left + (index / 500) * plotWidth;
      const y = area.top + (1 - normalized) * plotHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    const targetY =
      area.top + (1 - (Math.log10(Math.max(1e-4, target)) + 4) / 5) * plotHeight;
    context.strokeStyle = colors.copper;
    context.setLineDash([10, 8]);
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(area.left, targetY);
    context.lineTo(width - area.right, targetY);
    context.stroke();
    context.setLineDash([]);
    label(context, "TARGET", width - area.right, targetY - 10, colors, "right");
    label(context, "10 Hz", area.left, height - 17, colors, "center");
    label(context, "1 GHz", width - area.right, height - 17, colors, "center");
    result(panel, "peak", largestOverTarget > 2 ? `${largestOverTarget.toFixed(1)}× 초과` : largestOverTarget > 1 ? "경계" : "목표 이내");
  }

  function emcModes(panel) {
    const imbalance = number(panel, "imbalance");
    const edge = number(panel, "edge");
    output(panel, "imbalance", `${imbalance}%`);
    output(panel, "edge", String(edge));
    const risk = (imbalance / 100) * edge;
    result(panel, "net-current", risk < 0.4 ? "작음" : risk < 1.5 ? "중간" : "큼");
    result(panel, "risk", risk < 0.4 ? "낮음" : risk < 1.5 ? "중간" : "높음");

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const halo = Math.min(150, 25 + risk * 55);
    const arrow = (x1, y1, x2, y2, color) => {
      const direction = Math.sign(x2 - x1) || 1;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = 8;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
      context.beginPath();
      context.moveTo(x2, y2);
      context.lineTo(x2 - direction * 20, y2 - 12);
      context.lineTo(x2 - direction * 20, y2 + 12);
      context.closePath();
      context.fill();
    };
    const leftCenter = width * 0.25;
    const rightCenter = width * 0.75;
    label(context, "DIFFERENTIAL", leftCenter, 48, colors, "center");
    label(context, "COMMON MODE", rightCenter, 48, colors, "center");
    arrow(80, 145, width * 0.44, 145, colors.copper);
    arrow(width * 0.44, 225, 80, 225, colors.signal);
    context.strokeStyle = colors.line;
    context.lineWidth = 3;
    context.beginPath();
    context.ellipse(leftCenter, 185, 145, 94, 0, 0, TAU);
    context.stroke();
    arrow(width * 0.56, 145, width - 80, 145, colors.copper);
    arrow(width * 0.56, 225, width - 80, 225, colors.signal);
    context.save();
    context.globalAlpha = Math.min(0.9, 0.25 + risk * 0.18);
    context.strokeStyle = colors.danger;
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(rightCenter, 185, halo, Math.max(55, halo * 0.55), 0, 0, TAU);
    context.stroke();
    context.globalAlpha = 0.45;
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(
      rightCenter,
      185,
      Math.max(45, halo * 0.68),
      Math.max(32, halo * 0.38),
      0,
      0,
      TAU,
    );
    context.stroke();
    context.restore();
    label(
      context,
      `NET CURRENT ${(risk * 20).toFixed(1)} mA · RELATIVE`,
      rightCenter,
      height - 42,
      colors,
      "center",
    );
  }

  function samplingAlias(panel) {
    const signal = number(panel, "signal") * 1e6;
    const sample = number(panel, "sample") * 1e6;
    const alias = calc.aliasFrequency(signal, sample);
    output(panel, "signal", calc.formatEngineering(signal, "Hz"));
    output(panel, "sample", `${calc.formatEngineering(sample, "S")}/s`);
    result(panel, "nyquist", calc.formatEngineering(sample / 2, "Hz"));
    result(panel, "alias", calc.formatEngineering(alias, "Hz"));

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors, { left: 38, right: 25, top: 30, bottom: 42 });
    const plotWidth = width - area.left - area.right;
    const centerY = (area.top + height - area.bottom) / 2;
    const amplitude = (height - area.top - area.bottom) * 0.38;
    const duration = 100e-9;

    const drawWave = (frequency, color, alpha, lineWidth) => {
      context.strokeStyle = color;
      context.globalAlpha = alpha;
      context.lineWidth = lineWidth;
      context.beginPath();
      for (let index = 0; index <= 600; index += 1) {
        const t = (index / 600) * duration;
        const x = area.left + (index / 600) * plotWidth;
        const y = centerY - Math.sin(TAU * frequency * t) * amplitude;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.globalAlpha = 1;
    };
    drawWave(signal, colors.copper, 0.45, 3);
    drawWave(alias, colors.signal, 0.85, 4);
    const sampleCount = Math.floor(duration * sample);
    context.fillStyle = colors.ink;
    for (let index = 0; index <= sampleCount; index += 1) {
      const t = index / sample;
      const x = area.left + (t / duration) * plotWidth;
      const y = centerY - Math.sin(TAU * signal * t) * amplitude;
      context.beginPath();
      context.arc(x, y, 6, 0, TAU);
      context.fill();
    }
    label(context, "true signal", area.left + 8, area.top + 18, colors);
    label(context, "alias through samples", width - area.right, area.top + 18, colors, "right");
  }

  function scopeBandwidth(panel) {
    const signalRise = number(panel, "signal-rise") * 1e-9;
    const bandwidth = number(panel, "bandwidth") * 1e6;
    const correctedScopeRise = 0.35 / bandwidth;
    const observed = calc.observedRiseTime(signalRise, correctedScopeRise);
    const error = ((observed - signalRise) / signalRise) * 100;
    output(panel, "signal-rise", calc.formatEngineering(signalRise, "s"));
    output(panel, "bandwidth", calc.formatEngineering(bandwidth, "Hz"));
    result(panel, "scope-rise", calc.formatEngineering(correctedScopeRise, "s"));
    result(panel, "observed-rise", calc.formatEngineering(observed, "s"));
    result(panel, "rise-error", `${error.toFixed(0)}%`);

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const left = 70;
    const right = width - 60;
    const top = 88;
    const bottom = height - 62;
    context.strokeStyle = colors.line;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(left, bottom);
    context.lineTo(right, bottom);
    context.stroke();
    context.setLineDash([6, 8]);
    context.beginPath();
    context.moveTo(left, top);
    context.lineTo(right, top);
    context.stroke();
    context.setLineDash([]);

    const drawEdge = (rise, color) => {
      context.strokeStyle = color;
      context.lineWidth = 5;
      context.beginPath();
      for (let index = 0; index <= 160; index += 1) {
        const x = left + ((right - left) * index) / 160;
        const t = (index - 40) / 22;
        const steepness = Math.max(0.18, rise / 1e-9);
        const value = 1 / (1 + Math.exp(-t / steepness));
        const y = bottom - value * (bottom - top);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    };
    drawEdge(signalRise, colors.copper);
    drawEdge(observed, colors.signal);
    label(context, `SIGNAL ${calc.formatEngineering(signalRise, "s")}`, left + 16, 46, colors);
    label(
      context,
      `OBSERVED ${calc.formatEngineering(observed, "s")}`,
      left + 330,
      46,
      colors,
    );
    label(context, "time →", right, height - 24, colors, "right");
  }

  function probeRinging(panel) {
    const length = number(panel, "length") / 1000;
    const capacitance = number(panel, "capacitance") * 1e-12;
    const edge = number(panel, "edge") * 1e-9;
    const inductance = calc.probeGroundInductance(length);
    const resonance = 1 / (TAU * Math.sqrt(inductance * capacitance));
    output(panel, "length", calc.formatEngineering(length, "m"));
    output(panel, "capacitance", calc.formatEngineering(capacitance, "F"));
    output(panel, "edge", calc.formatEngineering(edge, "s"));
    result(panel, "inductance", calc.formatEngineering(inductance, "H"));
    result(panel, "resonance", calc.formatEngineering(resonance, "Hz"));
    const confidence = length <= 0.01 ? "높음" : length <= 0.04 ? "중간" : "낮음";
    result(panel, "confidence", confidence);

    const canvas = panel.querySelector("canvas");
    if (!canvas) return;
    const { context, width, height, colors } = setupCanvas(canvas);
    const area = drawGrid(context, width, height, colors, { left: 42, right: 25, top: 30, bottom: 42 });
    const plotWidth = width - area.left - area.right;
    const plotHeight = height - area.top - area.bottom;
    const ringingAmount = Math.min(0.55, length / 0.16);
    const cycles = Math.max(2, Math.min(12, resonance * 25e-9));

    const drawEdge = (color, ringing) => {
      context.strokeStyle = color;
      context.lineWidth = 5;
      context.beginPath();
      for (let index = 0; index <= 500; index += 1) {
        const normalized = index / 500;
        const stepTime = 0.18;
        const base = 1 / (1 + Math.exp(-(normalized - stepTime) / (0.006 + edge / 1e-7)));
        const after = Math.max(0, normalized - stepTime);
        const ring =
          ringing *
          Math.exp(-after * 10) *
          Math.sin(after * cycles * TAU);
        const value = base + (normalized > stepTime ? ring : 0);
        const x = area.left + normalized * plotWidth;
        const y = area.top + (1.15 - value) * plotHeight * 0.75;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    };
    drawEdge(colors.signal, 0.03);
    drawEdge(colors.copper, ringingAmount);
    label(context, "spring ground", area.left + 10, area.top + 20, colors);
    label(context, `${Math.round(length * 1000)} mm clip`, width - area.right, area.top + 20, colors, "right");
  }

  const bringupContent = {
    prepower: [
      "Power-off resistance map",
      "각 rail–ground 저항을 방향과 settling까지 기록하고 golden board/BOM 예상과 비교한다.",
    ],
    overcurrent: [
      "Reduce energy, then localize heat",
      "전원을 끄고 short를 확인한 뒤 낮은 전압·제한 전류에서 hotspot을 찾는다. limit부터 올리지 않는다.",
    ],
    rail: [
      "Measure source, regulator pins, and load together",
      "입력 drop, enable, feedback, switching node, output ripple을 dependency 순서로 비교한다.",
    ],
    clock: [
      "Check power, enable, reset, then probe loading",
      "oscillator rail과 enable, crystal 부품값, start-up 시간을 확인하고 낮은 Cin probe로 재측정한다.",
    ],
    reset: [
      "Trace every reset cause",
      "supervisor output, RC node, watchdog, brownout, firmware GPIO와 pull 상태를 각각 분리해 본다.",
    ],
    interface: [
      "Start at the physical layer",
      "pinout, level, reference, termination, idle state, clock/data timing을 확인하고 loopback 또는 known pattern을 쓴다.",
    ],
  };

  function bringupFlow(panel) {
    const buttons = [...panel.querySelectorAll("[data-flow]")];
    const title = panel.querySelector('[data-result="title"]');
    const body = panel.querySelector('[data-result="body"]');
    const select = (key) => {
      const content = bringupContent[key] ?? bringupContent.prepower;
      if (title) title.textContent = content[0];
      if (body) body.textContent = content[1];
      buttons.forEach((button) => {
        button.toggleAttribute("aria-pressed", button.dataset.flow === key);
      });
    };
    buttons.forEach((button) => {
      button.addEventListener("click", () => select(button.dataset.flow));
    });
    select("prepower");
  }

  const renderers = {
    "bringup-flow": bringupFlow,
    crosstalk,
    "emc-modes": emcModes,
    "energy-flow": staticRenderer,
    "field-energy": fieldEnergy,
    "model-ladder": staticRenderer,
    "pcb-stackup": pcbStackup,
    "pdn-impedance": pdnImpedance,
    phasor,
    "probe-ringing": probeRinging,
    "rc-transient": rcTransient,
    "real-capacitor": realCapacitor,
    "return-path": returnPath,
    "rlc-response": rlcResponse,
    "sampling-alias": samplingAlias,
    "scope-bandwidth": scopeBandwidth,
    "transmission-reflection": transmissionReflection,
    "voltage-divider": voltageDivider,
  };

  const renderAll = () => {
    document.querySelectorAll("[data-visualization]").forEach((panel) => {
      const renderer = renderers[panel.dataset.visualization];
      if (!renderer || panel.dataset.rendered === "true") return;
      panel.dataset.rendered = "true";
      if (panel.classList.contains("interactive")) bind(panel, renderer);
      else renderer(panel);
    });
  };

  renderAll();
  globalThis.HWVisualizations = Object.freeze({ renderAll });

  document.addEventListener("hwguide:themechange", () => {
    document.querySelectorAll("[data-visualization]").forEach((panel) => {
      const renderer = renderers[panel.dataset.visualization];
      if (renderer && panel.dataset.visualization !== "bringup-flow") renderer(panel);
    });
  });
})();
