/**
 * בקר גוף ראשון: Pointer Lock בעכבר, חצים במקלדת, ג'ויסטיק במגע (דרך input),
 * תנועה עם תאוצה/האטה, התנגשויות, מדרגות וכוח כבידה, זיהוי דלתות ונקודות מידע,
 * וטיסות מצלמה (כניסה לסיור + סיור מודרך) לאורך מסלול בטוח.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { world } from '../utils/world.js';
import { PLAYER_RADIUS, STEP_UP, clampToWorld } from '../utils/collisions.js';
import { input, playerState, consumeLook, consumeInteract } from '../utils/input.js';
import { useTourStore, WALK_START, MODES } from '../stores/tourStore.js';
import { DOORS, INFO_POINTS, EYE, FF_Y } from '../house/plan.js';
import { sounds } from '../utils/audio.js';

const WALK_SPEED = 3.1;
const RUN_SPEED = 5.4;
const ACCEL = 26;
const LOOK_SENS = 0.0023;
const KEY_LOOK_SPEED = 1.9;
const AUTOPILOT_SPEED = 3.4;

export default function FirstPersonController({ isTouch }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const vel = useRef(new THREE.Vector2(0, 0));
  const vy = useRef(0);
  const keys = useRef({});
  const autopilotRef = useRef(null); // {curve, len, s, yawTarget}
  const enterRef = useRef(null);
  const stepAcc = useRef(0);
  const publishAcc = useRef(0);
  const scanAcc = useRef(0);

  /* --- אתחול מיקום --- */
  useEffect(() => {
    camera.rotation.order = 'YXZ';
    const s = useTourStore.getState();
    if (s.transition !== 'enter') {
      camera.position.set(playerState.x, playerState.feet + EYE, playerState.z);
      camera.rotation.set(playerState.pitch, playerState.yaw, 0);
    }
  }, [camera]);

  /* --- מקלדת --- */
  useEffect(() => {
    const down = (e) => {
      if (e.repeat) return;
      keys.current[e.code] = true;
      if (e.code === 'KeyE') input.interact = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.run = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    };
    const up = (e) => {
      keys.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.run = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      keys.current = {};
      input.run = false;
    };
  }, []);

  /* --- Pointer Lock (עכבר בלבד, לא במגע) --- */
  useEffect(() => {
    if (isTouch) return undefined;
    const el = gl.domElement;
    const requestLock = () => {
      const s = useTourStore.getState();
      if (s.mode === MODES.WALK && !s.autopilot && !s.transition && !s.infoPoint && !s.guidedOpen && !s.showHelp) {
        el.requestPointerLock?.();
      }
    };
    const onMove = (e) => {
      if (document.pointerLockElement === el) {
        input.lookX -= e.movementX * LOOK_SENS;
        input.lookY -= e.movementY * LOOK_SENS;
      }
    };
    const onLockChange = () => {
      useTourStore.setState({ pointerLocked: document.pointerLockElement === el });
    };
    el.addEventListener('click', requestLock);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      el.removeEventListener('click', requestLock);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('pointerlockchange', onLockChange);
      if (document.pointerLockElement === el) document.exitPointerLock();
    };
  }, [gl, isTouch]);

  /* --- לולאת הפיזיקה --- */
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const store = useTourStore.getState();

    /* מעבר "התחל סיור": טיסה מהמבט החיצוני אל נקודת ההתחלה בשביל */
    if (store.transition === 'enter') {
      if (!enterRef.current) {
        const from = camera.position.clone();
        const to = new THREE.Vector3(WALK_START.x, WALK_START.y, WALK_START.z);
        const mid = from.clone().lerp(to, 0.5);
        mid.y = Math.max(from.y, to.y + 2.5);
        enterRef.current = {
          curve: new THREE.CatmullRomCurve3([from, mid, to]),
          t: 0,
          fromQuat: camera.quaternion.clone(),
        };
      }
      const tr = enterRef.current;
      tr.t = Math.min(1, tr.t + dt / 2.2);
      const ease = tr.t * tr.t * (3 - 2 * tr.t);
      camera.position.copy(tr.curve.getPoint(ease));
      // הפניית מבט הדרגתית אל הבית
      const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, WALK_START.yaw, 0, 'YXZ'));
      camera.quaternion.slerpQuaternions(tr.fromQuat, targetQ, ease);
      if (tr.t >= 1) {
        enterRef.current = null;
        playerState.x = WALK_START.x;
        playerState.z = WALK_START.z;
        playerState.feet = 0;
        playerState.yaw = WALK_START.yaw;
        playerState.pitch = 0;
        vel.current.set(0, 0);
        camera.rotation.set(0, WALK_START.yaw, 0);
        store.finishEnter();
        if (store.pendingGuided) {
          store.startGuidedTo(store.pendingGuided);
        }
      }
      return;
    }

    /* סיור מודרך: טיסה לאורך מסלול הצמתים */
    if (store.autopilot) {
      if (!autopilotRef.current || autopilotRef.current.id !== store.autopilot.id) {
        const pts = store.autopilot.points.map((p) => new THREE.Vector3(...p));
        const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.4);
        autopilotRef.current = {
          id: store.autopilot.id,
          curve,
          len: curve.getLength(),
          s: 0,
          yawTarget: store.autopilot.yaw,
        };
      }
      const ap = autopilotRef.current;
      ap.s = Math.min(ap.len, ap.s + AUTOPILOT_SPEED * dt);
      const u = ap.len > 0 ? ap.s / ap.len : 1;
      const pos = ap.curve.getPointAt(u);
      camera.position.copy(pos);
      // מבט: לאורך כיוון התנועה, ובקטע האחרון — אל זווית היעד
      const tangent = ap.curve.getTangentAt(Math.min(u, 0.999));
      const moveYaw = Math.atan2(-tangent.x, -tangent.z);
      const blend = THREE.MathUtils.smoothstep(u, 0.82, 1);
      let yaw = moveYaw;
      if (blend > 0) {
        // אינטרפולציה זוויתית קצרה
        let d = ap.yawTarget - moveYaw;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        yaw = moveYaw + d * blend;
      }
      const curYaw = camera.rotation.y;
      let dy = yaw - curYaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      camera.rotation.set(
        THREE.MathUtils.damp(camera.rotation.x, 0, 6, dt),
        curYaw + dy * Math.min(1, 7 * dt),
        0
      );
      if (ap.s >= ap.len - 0.001) {
        playerState.x = pos.x;
        playerState.z = pos.z;
        playerState.feet = pos.y - EYE;
        playerState.yaw = camera.rotation.y;
        playerState.pitch = 0;
        vel.current.set(0, 0);
        autopilotRef.current = null;
        useTourStore.setState({ autopilot: null });
      }
      publish(store, dt);
      return;
    }

    if (store.mode !== MODES.WALK) return;

    /* --- מבט --- */
    const [ldx, ldy] = consumeLook();
    let yaw = playerState.yaw + ldx;
    let pitch = playerState.pitch + ldy;
    if (keys.current.ArrowLeft) yaw += KEY_LOOK_SPEED * dt;
    if (keys.current.ArrowRight) yaw -= KEY_LOOK_SPEED * dt;
    if (keys.current.ArrowUp) pitch += KEY_LOOK_SPEED * 0.7 * dt;
    if (keys.current.ArrowDown) pitch -= KEY_LOOK_SPEED * 0.7 * dt;
    pitch = THREE.MathUtils.clamp(pitch, -1.35, 1.35);
    playerState.yaw = yaw;
    playerState.pitch = pitch;

    /* --- תנועה --- */
    const uiBlocked = store.infoPoint || store.guidedOpen || store.showHelp;
    let f = uiBlocked ? 0 : input.forward + (keys.current.KeyW ? 1 : 0) - (keys.current.KeyS ? 1 : 0);
    let s = uiBlocked ? 0 : input.strafe + (keys.current.KeyD ? 1 : 0) - (keys.current.KeyA ? 1 : 0);
    const mag = Math.hypot(f, s);
    if (mag > 1) { f /= mag; s /= mag; }
    const speed = input.run ? RUN_SPEED : WALK_SPEED;
    // כיוון עולם: קדימה = (-sin(yaw), -cos(yaw)), ימינה = (cos(yaw)? ראו חישוב)
    const sin = Math.sin(yaw), cos = Math.cos(yaw);
    const targetVx = (-sin * f + cos * s) * speed;
    const targetVz = (-cos * f - sin * s) * speed;
    vel.current.x = THREE.MathUtils.damp(vel.current.x, targetVx, ACCEL / speed, dt);
    vel.current.y = THREE.MathUtils.damp(vel.current.y, targetVz, ACCEL / speed, dt);

    let nx = playerState.x + vel.current.x * dt;
    let nz = playerState.z + vel.current.y * dt;

    /* --- התנגשויות --- */
    const resolved = world.resolve(nx, nz, playerState.feet);
    ({ x: nx, z: nz } = clampToWorld(resolved.x, resolved.z));

    /* --- קרקע, מדרגות וכבידה --- */
    const ground = world.groundHeight(nx, nz, playerState.feet);
    let feet = playerState.feet;
    if (feet > ground + 0.02) {
      // באוויר (ירידה ממדרגה) — כבידה
      vy.current -= 22 * dt;
      feet = Math.max(ground, feet + vy.current * dt);
      if (feet === ground) vy.current = 0;
    } else {
      // עלייה חלקה (מדרגות/רמפה)
      feet = THREE.MathUtils.damp(feet, ground, 14, dt);
      if (Math.abs(feet - ground) < 0.005) feet = ground;
      vy.current = 0;
    }

    playerState.x = nx;
    playerState.z = nz;
    playerState.feet = feet;

    camera.position.set(nx, feet + EYE, nz);
    camera.rotation.set(pitch, yaw, 0);

    /* --- צעדים --- */
    const hSpeed = Math.hypot(vel.current.x, vel.current.y);
    if (hSpeed > 0.7 && Math.abs(feet - ground) < 0.05) {
      stepAcc.current += hSpeed * dt;
      if (stepAcc.current > 2.1) {
        stepAcc.current = 0;
        sounds.step();
      }
    }

    /* --- אינטראקציה --- */
    scanAcc.current += dt;
    if (scanAcc.current > 0.12) {
      scanAcc.current = 0;
      scanInteractables(store, nx, feet, nz, yaw);
    }
    if (consumeInteract() && !uiBlocked) {
      if (store.nearDoor) store.toggleDoor(store.nearDoor);
      else if (store.nearInfo) store.setInfoPoint(INFO_POINTS.find((p) => p.id === store.nearInfo));
    }

    publish(store, dt);
  });

  const publish = (store, dt) => {
    publishAcc.current += dt;
    if (publishAcc.current > 0.12) {
      publishAcc.current = 0;
      store.setPlayer({
        x: playerState.x,
        z: playerState.z,
        y: playerState.feet,
        yaw: camera.rotation.y,
        floor: playerState.feet > FF_Y / 2 + 0.4 ? 1 : 0,
      });
    }
  };

  return null;
}

function scanInteractables(store, x, feet, z, yaw) {
  // דלת קרובה — במרחק הפעלה ובאותה קומה
  let best = null, bestD = 2.1 * 2.1;
  for (const d of DOORS) {
    if (Math.abs(d.y0 - feet) > 1.5) continue;
    const dx = (d.wallDir === 'x' ? d.c : d.at) - x;
    const dz = (d.wallDir === 'x' ? d.at : d.c) - z;
    const dist = dx * dx + dz * dz;
    if (dist < bestD) { bestD = dist; best = d.id; }
  }
  store.setNearDoor(best);

  let bestI = null, bestID = 2.4 * 2.4;
  for (const p of INFO_POINTS) {
    if (Math.abs(p.pos[1] - (feet + 1.5)) > 2.0) continue;
    const dx = p.pos[0] - x, dz = p.pos[2] - z;
    const dist = dx * dx + dz * dz;
    if (dist < bestID) { bestID = dist; bestI = p.id; }
  }
  store.setNearInfo(bestI);
}
