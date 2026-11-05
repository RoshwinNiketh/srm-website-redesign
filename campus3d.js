// Live 3D campus built from real footprints. Blocks draw as wire and turn solid when you fly in.
import * as THREE from "./assets/lib/three.module.js";

const GOLD = 0xf2b705;
const WIRE = 0xb4d6ff;
const FLOOR_H = 6;
const GAP = 12;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const centre = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
const shapeOf = (pts) => new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));

export async function createCampus({ canvas, labels, schools, floors, reduced, onArrive, onLeave }) {
  const data = await fetch("assets/data/campus.json").then((r) => r.json());
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a1630, 0.00024);
  const camera = new THREE.PerspectiveCamera(36, 1, 1, 9000);
  scene.add(new THREE.HemisphereLight(0xbdd4ff, 0x10203c, 1.6));
  const sun = new THREE.DirectionalLight(0xffdcb0, 2.6);
  sun.position.set(-500, 500, 300);
  scene.add(sun);

  // Ground grid, roads and water
  const grid = new THREE.GridHelper(3600, 72, 0x1f3a66, 0x142a4e);
  grid.position.set(150, -0.2, -100);
  scene.add(grid);
  const roadPts = [];
  for (const road of data.roads)
    for (let i = 0; i < road.length - 1; i++) roadPts.push(road[i][0], 0.4, road[i][1], road[i + 1][0], 0.4, road[i + 1][1]);
  const roadGeo = new THREE.BufferGeometry();
  roadGeo.setAttribute("position", new THREE.Float32BufferAttribute(roadPts, 3));
  scene.add(new THREE.LineSegments(roadGeo, new THREE.LineBasicMaterial({ color: 0x4a76b5, transparent: true, opacity: 0.75 })));
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x123f70, metalness: 0.75, roughness: 0.22, transparent: true, opacity: 0.92 });
  for (const lake of data.water) {
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shapeOf(lake)), waterMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.2;
    scene.add(mesh);
  }

  // Trees as a soft point cloud
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const treePts = [];
  for (let i = 0; i < 5200; i++) {
    const cx = 150 + (rand() - 0.5) * 2600;
    const cz = -100 + (rand() - 0.5) * 2600;
    for (let j = 0; j < 3; j++) treePts.push(cx + (rand() - 0.5) * 34, 3 + rand() * 9, cz + (rand() - 0.5) * 34);
  }
  const treeGeo = new THREE.BufferGeometry();
  treeGeo.setAttribute("position", new THREE.Float32BufferAttribute(treePts, 3));
  scene.add(new THREE.Points(treeGeo, new THREE.PointsMaterial({ color: 0x2f9e78, size: 4.5, transparent: true, opacity: 0.6, depthWrite: false })));

  // Buildings: one merged wire layer plus a faint glass body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a4f8f, roughness: 0.45, metalness: 0.2, transparent: true, opacity: 0.7, emissive: 0x16305e, emissiveIntensity: 0.9 });
  const wireMat = new THREE.LineBasicMaterial({ color: WIRE, transparent: true, opacity: 1 });
  const city = new THREE.Group();
  scene.add(city);
  const blocks = data.buildings.map((building) => {
    const geo = new THREE.ExtrudeGeometry(shapeOf(building.p), { depth: building.h, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const body = new THREE.Mesh(geo, bodyMat);
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), wireMat);
    city.add(body, wire);
    const [x, z] = centre(building.p);
    return { ...building, x, z, body, wire };
  });

  // Picked blocks are always gold wire on the overview
  const goldWire = new THREE.LineBasicMaterial({ color: GOLD, transparent: true });
  const goldBody = bodyMat.clone();
  goldBody.color.set(0xc99a12);
  goldBody.emissive.set(0x8a6500);
  goldBody.opacity = 0.85;
  const targets = {};
  for (const key of Object.keys(data.schools)) {
    const block = blocks[data.schools[key]];
    block.wire.material = goldWire;
    block.body.material = goldBody;
    targets[key] = block;
  }

  // Framing: the overview centres on the named academic core
  const core = blocks.filter((b) => b.n);
  const mid = new THREE.Vector3(core.reduce((a, b) => a + b.x, 0) / core.length, 0, core.reduce((a, b) => a + b.z, 0) / core.length);
  const view = { az: 0.72, el: 0.62, dist: 1020, target: mid.clone() };
  const home = { az: view.az, el: view.el, dist: view.dist, target: mid.clone() };
  const place = () => {
    const d = view.dist;
    camera.position.set(view.target.x + Math.sin(view.az) * Math.cos(view.el) * d, view.target.y + Math.sin(view.el) * d, view.target.z + Math.cos(view.az) * Math.cos(view.el) * d);
    camera.lookAt(view.target);
    camera.updateMatrixWorld();
  };

  // Labels are real buttons, so they work with a keyboard and screen readers
  const pins = {};
  for (const [key, school] of Object.entries(schools)) {
    const pin = document.createElement("button");
    pin.className = "pin";
    pin.dataset.school = key;
    pin.textContent = school.short;
    labels.append(pin);
    pins[key] = pin;
  }
  const project = (x, y, z) => {
    const v = new THREE.Vector3(x, y, z).project(camera);
    return [((v.x + 1) / 2) * canvas.clientWidth, ((1 - v.y) / 2) * canvas.clientHeight, v.z];
  };
  const floorTags = [];
  let current = null;
  let exploded = null;
  let spread = 0;
  let spreadGoal = 0;
  let activeFloor = 0;
  let flight = null;

  function buildExploded(block) {
    const group = new THREE.Group();
    const fill = new THREE.MeshStandardMaterial({ color: 0x223f70, roughness: 0.35, metalness: 0.35, emissive: 0x13294f, emissiveIntensity: 0.8 });
    const on = new THREE.MeshStandardMaterial({ color: 0xd9a406, roughness: 0.4, metalness: 0.25, emissive: 0x6a4d00, emissiveIntensity: 0.9 });
    const geo = new THREE.ExtrudeGeometry(shapeOf(block.p), { depth: FLOOR_H, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const edges = new THREE.EdgesGeometry(geo, 20);
    const slabs = floors.map(() => {
      const slab = new THREE.Group();
      const mesh = new THREE.Mesh(geo, fill);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcfe2ff }));
      slab.add(mesh, line);
      group.add(slab);
      return { slab, mesh, line };
    });
    scene.add(group);
    floors.forEach((name) => {
      const tag = document.createElement("div");
      tag.className = "floor-tag";
      tag.textContent = name;
      labels.append(tag);
      floorTags.push(tag);
    });
    return { group, slabs, fill, on };
  }

  function clearExploded() {
    if (!exploded) return;
    scene.remove(exploded.group);
    exploded = null;
    floorTags.splice(0).forEach((tag) => tag.remove());
  }

  function fly(to, ms, done) {
    if (reduced) {
      Object.assign(view, to, { target: to.target.clone() });
      done?.();
      return;
    }
    flight = { from: { az: view.az, el: view.el, dist: view.dist, target: view.target.clone() }, to, start: performance.now(), ms, done };
  }

  function visit(key) {
    const block = targets[key];
    if (!block) return;
    clearExploded();
    if (current) {
      current.body.visible = true;
      current.wire.visible = true;
    }
    current = block;
    Object.values(pins).forEach((pin) => pin.classList.add("hidden-pin"));
    wireMat.opacity = 0.28;
    bodyMat.opacity = 0.25;
    spread = 0;
    spreadGoal = 0;
    const wide = canvas.clientWidth > 900;
    const reach = Math.max(70, Math.sqrt(block.p.reduce((a, p) => Math.max(a, (p[0] - block.x) ** 2 + (p[1] - block.z) ** 2), 0)) * 2.7);
    const stack = floors.length * (FLOOR_H + GAP);
    // On wide screens aim right of the block so it sits in the space beside the panel
    const side = wide ? new THREE.Vector3(Math.cos(0.92), 0, -Math.sin(0.92)).multiplyScalar(reach * 0.5) : new THREE.Vector3();
    const target = new THREE.Vector3(block.x, wide ? stack * 0.46 : -stack * 0.75, block.z).add(side);
    goldWire.opacity = 0.18;
    goldBody.opacity = 0.12;
    fly({ az: 0.92, el: 0.3, dist: (reach + stack * 0.95) * (wide ? 1.45 : 2.6), target }, 1800, () => {
      block.body.visible = false;
      block.wire.visible = false;
      exploded = buildExploded(block);
      setFloor(0);
      spreadGoal = 1;
      onArrive?.(key);
    });
  }

  function setFloor(index) {
    activeFloor = index;
    if (!exploded) return;
    exploded.slabs.forEach(({ mesh, line }, i) => {
      mesh.material = i === index ? exploded.on : exploded.fill;
      line.material.color.set(i === index ? 0xfff0b8 : 0xcfe2ff);
    });
    floorTags.forEach((tag, i) => tag.classList.toggle("on", i === index));
  }

  function skip() {
    if (!flight) return;
    flight.start = -1e9;
  }

  function leave() {
    spreadGoal = 0;
    clearExploded();
    if (current) {
      current.body.visible = true;
      current.wire.visible = true;
    }
    current = null;
    wireMat.opacity = 1;
    bodyMat.opacity = 0.7;
    goldWire.opacity = 1;
    goldBody.opacity = 0.85;
    fly({ az: home.az, el: home.el, dist: home.dist, target: home.target.clone() }, 1200, () => {
      Object.values(pins).forEach((pin) => pin.classList.remove("hidden-pin"));
    });
    onLeave?.();
  }

  // Drag to look around, without trapping page scroll on touch screens
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (current || flight) return;
    drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el };
    canvas.classList.add("dragging");
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    view.az = drag.az - (e.clientX - drag.x) * 0.005;
    if (e.pointerType === "mouse") view.el = Math.min(1.25, Math.max(0.3, drag.el + (e.clientY - drag.y) * 0.003));
  });
  const stopDrag = () => {
    drag = null;
    canvas.classList.remove("dragging");
  };
  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);

  const zoom = (factor) => {
    if (!current && !flight) view.dist = Math.min(2000, Math.max(450, view.dist * factor));
  };
  const reset = () => {
    if (!current) fly({ ...home, target: home.target.clone() }, 700);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    home.dist = w < 700 ? 1700 : 1020;
    if (!current && !flight) view.dist = home.dist;
  };
  addEventListener("resize", resize);
  resize();

  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.01 }).observe(canvas);

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    if (flight) {
      const t = Math.min(1, (now - flight.start) / flight.ms);
      const k = ease(t);
      view.az = flight.from.az + (flight.to.az - flight.from.az) * k;
      view.el = flight.from.el + (flight.to.el - flight.from.el) * k;
      view.dist = flight.from.dist + (flight.to.dist - flight.from.dist) * k;
      view.target.lerpVectors(flight.from.target, flight.to.target, k);
      if (t >= 1) {
        const done = flight.done;
        flight = null;
        done?.();
      }
    } else if (!drag && !current && !reduced) {
      view.az += 0.00035; // slow drift so the model reads as 3D at a glance
    }
    place();
    spread += (spreadGoal - spread) * (reduced ? 1 : 0.07);
    if (exploded) {
      exploded.slabs.forEach(({ slab }, i) => (slab.position.y = i * (FLOOR_H + GAP * spread)));
      const wall = current.p.reduce((best, p) => (project(p[0], 0, p[1])[0] < project(best[0], 0, best[1])[0] ? p : best));
      floorTags.forEach((tag, i) => {
        const [sx, sy] = project(wall[0], i * (FLOOR_H + GAP * spread) + FLOOR_H / 2, wall[1]);
        const width = tag.offsetWidth;
        tag.style.transform = `translate(${Math.max(8, sx - width - 16)}px, ${sy - 10}px)`;
      });
    }
    // Keep labels readable: place front-most first and lift any that would overlap
    const placed = Object.entries(pins)
      .map(([key, pin]) => {
        const block = targets[key];
        const [sx, sy] = project(block.x, block.h + 6, block.z);
        const w = pin.offsetWidth;
        return { pin, w, h: pin.offsetHeight, x: Math.min(canvas.clientWidth - w - 8, Math.max(8, sx - w / 2)), y: Math.max(76, sy - 54) };
      })
      .sort((a, b) => b.y - a.y);
    placed.forEach((item, i) => {
      for (let pass = 0; pass < 4; pass++)
        for (const other of placed.slice(0, i))
          if (item.x < other.x + other.w + 6 && other.x < item.x + item.w + 6 && item.y < other.y + other.h + 6 && other.y < item.y + item.h + 6)
            item.y = other.y - item.h - 6;
      item.pin.style.transform = `translate(${item.x}px, ${Math.max(76, item.y)}px)`;
    });
    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);

  return { visit, leave, skip, zoom, reset, setFloor, isFlying: () => Boolean(flight) };
}
