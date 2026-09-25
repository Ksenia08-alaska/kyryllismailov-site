/**
 * Живой фон финального блока на чистом WebGL (без библиотек).
 * Тёмные «чернильные» разводы с лаймовым свечением, которое тянется к курсору.
 * Рисуется только когда блок на экране. Если WebGL недоступен —
 * остаётся CSS-градиент из стилей секции.
 */

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.05;

  float md = length(p - m);
  float pull = exp(-md * 2.6);

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
  float f = fbm(p * 1.7 + q * 1.8 + vec2(t * 0.8, -t * 0.5) + pull * 0.45);

  vec3 ink = vec3(0.063, 0.078, 0.078);
  vec3 graphite = vec3(0.15, 0.18, 0.18);
  vec3 lime = vec3(0.827, 0.98, 0.416);

  vec3 col = mix(ink, graphite, smoothstep(0.35, 0.78, f));
  float band = smoothstep(0.58, 0.82, f) * (0.25 + 0.75 * pull);
  col = mix(col, lime, band * 0.42);

  // Слева темнее — там текст
  col *= mix(0.62, 1.0, smoothstep(0.05, 0.75, uv.x));
  // Лёгкая виньетка и плёночное зерно
  col *= 1.0 - 0.3 * length(uv - 0.5);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initShader(reduced: boolean) {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-shader]');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  });
  if (!gl) return;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');

  // Рендерим в пониженном разрешении: фон мягкий, а телефонам легче
  const SCALE = 0.55;
  let w = 0;
  let h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
    w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();
  window.addEventListener('resize', resize);

  // Мышь сглаживается; на телефоне точка сама плавает по экрану
  const target = { x: 0.7, y: 0.45 };
  const mouse = { x: 0.7, y: 0.45 };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    canvas.parentElement?.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    });
  }

  const start = performance.now();
  const draw = (now: number) => {
    const time = (now - start) / 1000;
    if (!fine) {
      target.x = 0.62 + Math.sin(time * 0.35) * 0.22;
      target.y = 0.5 + Math.cos(time * 0.27) * 0.2;
    }
    mouse.x += (target.x - mouse.x) * 0.06;
    mouse.y += (target.y - mouse.y) * 0.06;
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, reduced ? 12 : time + 12);
    gl.uniform2f(uMouse, mouse.x * w, mouse.y * h);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let raf = 0;
  let visible = false;
  const loop = (now: number) => {
    draw(now);
    if (visible) raf = requestAnimationFrame(loop);
  };

  if (reduced) {
    draw(performance.now());
  } else {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  canvas.classList.add('is-ready');
}
