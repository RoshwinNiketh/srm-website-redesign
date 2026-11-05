// Photo-with-depth renderer: shifts each pixel by a depth map so a still image gets real parallax.
const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}`;
const FS = `precision highp float;varying vec2 v;uniform sampler2D img,dep;uniform vec2 off,fit;uniform float zoom;
void main(){vec2 uv=(v-.5)*fit/zoom+.5;float d=texture2D(dep,uv).r;
 vec2 s=uv;for(int i=0;i<4;i++){d=texture2D(dep,s).r;s=uv+off*(d-.45);}
 gl_FragColor=texture2D(img,s);}`;

const load = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

export async function initDepthStage(stage, pointer) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return false;
  const [image, depth] = await Promise.all([load(stage.dataset.image), load(stage.dataset.depth)]);
  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const texture = (unit, source) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  texture(0, image);
  texture(1, depth);
  gl.uniform1i(gl.getUniformLocation(program, "img"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "dep"), 1);
  const uOff = gl.getUniformLocation(program, "off");
  const uFit = gl.getUniformLocation(program, "fit");
  const uZoom = gl.getUniformLocation(program, "zoom");
  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = stage.clientWidth * ratio;
    canvas.height = stage.clientHeight * ratio;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const ca = canvas.width / canvas.height;
    const ia = image.width / image.height;
    gl.uniform2f(uFit, ca > ia ? 1 : ca / ia, ca > ia ? ia / ca : 1);
  };
  stage.append(canvas);
  resize();
  addEventListener("resize", resize);
  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(stage);
  let x = 0;
  let y = 0;
  const frame = (time) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const box = stage.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, -box.top / box.height));
    // Slow sway keeps the depth visible on phones, which have no pointer.
    x += (pointer.x * 0.03 + Math.sin(time * 0.00035) * 0.008 - x) * 0.06;
    y += (pointer.y * 0.018 + Math.cos(time * 0.00028) * 0.004 + progress * 0.03 - y) * 0.06;
    gl.uniform2f(uOff, x, y);
    gl.uniform1f(uZoom, 1.07 + Math.max(0, progress) * 0.1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(frame);
  stage.classList.add("live");
  return true;
}
