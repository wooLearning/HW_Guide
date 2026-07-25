import * as THREE from "./vendor/three.module.min.js";

export const sceneNames = [
  "pcb-stackup-3d",
  "transmission-reflection-3d",
  "probe-loop-3d",
  "pdn-current-loop-3d",
];

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const activeScenes = new Set();

const palette = {
  blue: 0x0071e3,
  blueLight: 0x64b5ff,
  copper: 0xc77836,
  dielectric: 0xdde8f2,
  graphite: 0x3a3a3c,
  gray: 0x8e8e93,
  magenta: 0xbf5af2,
  green: 0x34c759,
  red: 0xff453a,
};

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.12,
    roughness: options.roughness ?? 0.62,
    transparent: options.opacity != null && options.opacity < 1,
    opacity: options.opacity ?? 1,
    side: THREE.DoubleSide,
  });
}

function box(group, size, position, color, options = {}) {
  const geometry = new THREE.BoxGeometry(...size);
  const mesh = new THREE.Mesh(geometry, material(color, options));
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function cylinder(group, radius, height, position, color, rotation = [0, 0, 0]) {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  const mesh = new THREE.Mesh(
    geometry,
    material(color, { metalness: 0.5, roughness: 0.35 }),
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

function tube(group, points, color, radius = 0.045, opacity = 1) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const geometry = new THREE.TubeGeometry(curve, 72, radius, 12, false);
  const mesh = new THREE.Mesh(geometry, material(color, { opacity, roughness: 0.4 }));
  group.add(mesh);
  return mesh;
}

function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5568, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(4, 6, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x77baff, 1.1);
  fill.position.set(-4, 1, -3);
  scene.add(fill);
}

function buildStackup(group) {
  box(group, [6.3, 0.16, 3.8], [0, -1.1, 0], palette.graphite, { metalness: 0.55 });
  box(group, [6.3, 0.76, 3.8], [0, -0.64, 0], palette.dielectric, { opacity: 0.36 });
  box(group, [6.3, 0.12, 3.8], [0, -0.2, 0], palette.copper, { metalness: 0.62 });
  box(group, [6.3, 0.68, 3.8], [0, 0.2, 0], palette.dielectric, { opacity: 0.3 });
  box(group, [5.4, 0.09, 0.28], [-0.25, 0.6, 0], palette.blue, { metalness: 0.38 });
  cylinder(group, 0.17, 1.75, [1.7, -0.25, 0], palette.copper);
  cylinder(group, 0.13, 1.75, [2.35, -0.25, 0.72], palette.gray);
  cylinder(group, 0.13, 1.75, [2.35, -0.25, -0.72], palette.gray);
  const field = tube(
    group,
    [[-2.2, 0.55, 0], [-1.4, 0.1, 0.55], [-0.5, -0.1, 0.55], [0.4, 0.15, 0], [1.2, 0.55, 0]],
    palette.blueLight,
    0.035,
    0.72,
  );
  field.name = "field-guide";
  group.rotation.x = -0.35;
  group.rotation.y = -0.45;
  return { animated: [field] };
}

function buildTransmission(group) {
  box(group, [7, 0.16, 2.6], [0, -0.95, 0], palette.graphite, { metalness: 0.5 });
  box(group, [7, 0.62, 2.6], [0, -0.55, 0], palette.dielectric, { opacity: 0.38 });
  box(group, [6.2, 0.08, 0.22], [0, -0.18, 0], palette.blue, { metalness: 0.35 });
  box(group, [0.28, 1.18, 0.8], [3.03, 0.28, 0], palette.graphite);
  cylinder(group, 0.2, 0.18, [-3.05, -0.07, 0], palette.green, [Math.PI / 2, 0, 0]);
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 16),
    material(palette.magenta, { roughness: 0.28 }),
  );
  pulse.position.set(-2.8, 0.08, 0);
  group.add(pulse);
  group.rotation.x = -0.24;
  group.rotation.y = -0.35;
  return {
    animated: [pulse],
    tick: (elapsed, mount) => {
      const phase = (elapsed * 0.46) % 2;
      const forward = phase <= 1;
      const progress = forward ? phase : 2 - phase;
      pulse.position.x = THREE.MathUtils.lerp(-2.8, 2.8, progress);
      pulse.material.color.setHex(forward ? palette.magenta : palette.red);
      const load = Number(mount.dataset.loadOhms ?? 100);
      const coefficient = globalThis.HWCalculators?.reflectionCoefficient(50, load);
      const output = mount.closest(".visual-panel")?.querySelector("[data-three-result]");
      if (output && Number.isFinite(coefficient)) {
        output.textContent = `ΓL ${coefficient >= 0 ? "+" : ""}${coefficient.toFixed(2)}`;
      }
    },
  };
}

function buildProbe(group) {
  box(group, [5.5, 0.2, 3.2], [0, -0.9, 0], palette.graphite, { metalness: 0.45 });
  box(group, [5.5, 0.62, 3.2], [0, -0.48, 0], palette.dielectric, { opacity: 0.34 });
  cylinder(group, 0.22, 0.2, [-1.7, -0.02, 0], palette.copper);
  const tip = cylinder(group, 0.08, 2.4, [-1.7, 1.25, 0], palette.gray);
  tip.rotation.z = 0.08;
  const longLead = tube(
    group,
    [[-1.55, 1.9, 0], [0, 2.25, 0.4], [1.9, 0.65, 0.35], [1.65, -0.02, 0]],
    palette.red,
    0.055,
  );
  longLead.name = "long-lead";
  const spring = tube(
    group,
    [[-1.55, 1.02, 0], [-1.15, 0.55, 0], [-0.9, -0.02, 0]],
    palette.green,
    0.06,
  );
  spring.name = "ground-spring";
  spring.visible = false;
  group.rotation.x = -0.3;
  group.rotation.y = -0.35;
  return { animated: [], variants: { longLead, spring } };
}

function buildPdn(group) {
  box(group, [6.2, 0.14, 3.6], [0, -1.05, 0], palette.graphite, { metalness: 0.5 });
  box(group, [6.2, 0.68, 3.6], [0, -0.64, 0], palette.dielectric, { opacity: 0.34 });
  box(group, [6.2, 0.1, 3.6], [0, -0.25, 0], palette.copper, { metalness: 0.62 });
  box(group, [1.2, 0.65, 1.2], [1.45, 0.22, 0], palette.graphite);
  box(group, [0.48, 0.72, 0.72], [-1.65, 0.25, 0], palette.blue);
  const loop = tube(
    group,
    [[-1.65, 0.7, 0], [-0.5, 0.86, 0], [1.45, 0.58, 0], [1.45, -0.18, 0], [-0.4, -0.36, 0], [-1.65, 0.7, 0]],
    palette.magenta,
    0.055,
    0.85,
  );
  group.rotation.x = -0.32;
  group.rotation.y = -0.42;
  return { animated: [loop] };
}

const builders = {
  "pcb-stackup-3d": buildStackup,
  "transmission-reflection-3d": buildTransmission,
  "probe-loop-3d": buildProbe,
  "pdn-current-loop-3d": buildPdn,
};

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) {
      child.material.forEach((item) => item.dispose?.());
    } else {
      child.material?.dispose?.();
    }
  });
}

function showFallback(mount, message = "이 환경에서는 3D 보기를 사용할 수 없습니다.") {
  mount.classList.add("webgl-fallback");
  const imagePath = mount.dataset.fallbackImage;
  const image = document.createElement("img");
  image.src = imagePath;
  image.alt = "";
  image.width = 1536;
  image.height = 1024;
  const status = document.createElement("p");
  status.className = "three-status";
  status.textContent = message;
  mount.replaceChildren(image, status);
}

function createToolbar(name) {
  const toolbar = document.createElement("div");
  toolbar.className = "three-toolbar";
  toolbar.setAttribute("aria-label", "3D 보기 조작");
  const actions = [
    ["rotate-left", "왼쪽 회전"],
    ["rotate-right", "오른쪽 회전"],
    ["pause", "애니메이션 멈춤"],
  ];
  if (name === "pcb-stackup-3d" || name === "pdn-current-loop-3d") {
    actions.push(["top", "위에서"], ["section", "단면"]);
  }
  if (name === "probe-loop-3d") {
    actions.push(["lead", "긴 lead"], ["spring", "spring"]);
  }
  actions.forEach(([action, text]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.threeAction = action;
    button.textContent = text;
    toolbar.append(button);
  });
  return toolbar;
}

function initializeScene(mount) {
  const name = mount.dataset.threeScene;
  const build = builders[name];
  if (!build) return;

  const stage = mount.querySelector("[data-three-stage]") ?? mount;
  if (!mount.hasAttribute("tabindex")) mount.tabIndex = 0;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    showFallback(mount);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.replaceChildren(renderer.domElement);
  stage.append(createToolbar(name));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 3.4, 9.4);
  camera.lookAt(0, 0, 0);
  const group = new THREE.Group();
  scene.add(group);
  addLights(scene);
  const model = build(group);

  let visible = false;
  let dragging = false;
  let previousX = 0;
  let elapsed = 0;
  let paused = false;
  let previousTime = performance.now();
  const reduced = () => reducedMotionQuery.matches;

  const render = (time = performance.now()) => {
    if (!visible) return;
    const delta = Math.min(0.05, Math.max(0, (time - previousTime) / 1000));
    previousTime = time;
    if (!reduced() && !paused) {
      elapsed += delta;
      model.tick?.(elapsed, mount);
      model.animated?.forEach((object, index) => {
        object.rotation.y += delta * (0.15 + index * 0.04);
      });
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  const resize = () => {
    const width = Math.max(280, stage.clientWidth);
    const height = Math.max(260, Math.min(460, width * 0.62));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      const nextVisible = entry.isIntersecting;
      if (nextVisible && !visible) {
        visible = true;
        previousTime = performance.now();
        requestAnimationFrame(render);
      } else {
        visible = nextVisible;
      }
    },
    { rootMargin: "160px" },
  );
  visibilityObserver.observe(mount);

  renderer.domElement.addEventListener("pointerdown", (event) => {
    dragging = true;
    previousX = event.clientX;
    renderer.domElement.setPointerCapture(event.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    group.rotation.y += (event.clientX - previousX) * 0.009;
    previousX = event.clientX;
    renderer.render(scene, camera);
  });
  renderer.domElement.addEventListener("pointerup", () => {
    dragging = false;
  });

  mount.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    group.rotation.y += event.key === "ArrowLeft" ? -0.12 : 0.12;
    renderer.render(scene, camera);
  });

  mount.querySelectorAll("[data-three-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.threeAction;
      if (action === "top") group.rotation.set(-Math.PI / 2, 0, 0);
      if (action === "section") group.rotation.set(-0.32, -0.42, 0);
      if (action === "rotate-left") group.rotation.y -= 0.25;
      if (action === "rotate-right") group.rotation.y += 0.25;
      if (action === "pause") {
        paused = !paused;
        button.textContent = paused ? "애니메이션 재생" : "애니메이션 멈춤";
        button.setAttribute("aria-pressed", String(paused));
      }
      if (action === "lead" && model.variants) {
        model.variants.longLead.visible = true;
        model.variants.spring.visible = false;
      }
      if (action === "spring" && model.variants) {
        model.variants.longLead.visible = false;
        model.variants.spring.visible = true;
      }
      renderer.render(scene, camera);
    });
  });

  const themeHandler = () => renderer.render(scene, camera);
  document.addEventListener("hwguide:themechange", themeHandler);
  resize();

  const cleanup = () => {
    visible = false;
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener("hwguide:themechange", themeHandler);
    disposeObject(group);
    renderer.dispose();
    activeScenes.delete(cleanup);
  };
  activeScenes.add(cleanup);
}

function initializeAllScenes() {
  document.querySelectorAll("[data-three-scene]").forEach(initializeScene);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAllScenes, { once: true });
} else {
  initializeAllScenes();
}

window.addEventListener("pagehide", () => {
  activeScenes.forEach((cleanup) => cleanup());
});
