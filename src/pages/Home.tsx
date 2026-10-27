import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import SEO from "@/components/SEO";

type TextSet = { title: string; sub: string; badge: string };

type SegNode = { html: string };
type SegLine = SegNode[];
type ParsedTitle = SegLine[];

function parseTitle(html: string): ParsedTitle {
  const lines = html.split(/<br\s*\/?>/i);
  return lines.map((line) => {
    const out: SegLine = [];
    const re = /(<span[^>]*>.*?<\/span>)/gi;
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > lastIndex) {
        const text = line.slice(lastIndex, m.index);
        if (text) out.push({ html: text });
      }
      out.push({ html: m[0] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < line.length) {
      const text = line.slice(lastIndex);
      if (text) out.push({ html: text });
    }
    return out;
  });
}

const TEXT_SETS: TextSet[] = [
  {
    badge: "Full-Service Creative & Digital Agency",
    title: 'Full-Service<br><span style="color:#7B2FBE">Digital&nbsp;</span>Marketing<br>& Creative Agency',
    sub: "We build, scale, and transform ambitious brands globally from Goregaon, Mumbai.",
  },
  {
    badge: "100+ Brands Scaled Across 15+ Industries",
    title: 'Brands That<br><span style="color:#9D4EDD">Command&nbsp;</span>Attention<br><span style="color:#1a1418">& Drive Growth</span>',
    sub: "Data-backed performance marketing, viral creative storytelling, and verified business outcomes.",
  },
  {
    badge: "Technology, Design & Production",
    title: 'Engineered for<br><span style="color:#7B2FBE">Scale,&nbsp;</span>Tech<br>& Cultural Impact',
    sub: "From performance campaigns and SEO to custom web/mobile engineering and 3D visual production.",
  },
];

const heroStyles = `
@keyframes heroSegIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes heroLineIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes heroSubIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 0.95; transform: translateY(0); }
}
.hero-title__line {
  display: block;
  opacity: 0;
  animation: heroLineIn 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.hero-title__seg {
  display: inline-block;
  opacity: 0;
  transform: translateY(14px);
  animation: heroSegIn 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: opacity, transform;
}
.hero-subtitle-anim {
  opacity: 0;
  transform: translateY(10px);
  animation: heroSubIn 700ms cubic-bezier(0.4, 0, 0.2, 1) 120ms forwards;
  will-change: opacity, transform;
}
`;

export default function Home() {
  const [, navigate] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(0);
  const targetRef = useRef(0);
  const lastSnapRef = useRef(-1);
  const [index, setIndex] = useState(0);

  const goToSlide = useCallback((targetIndex: number) => {
    targetRef.current = targetIndex;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    function resize() {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width * dpr;
      const h = rect.height * dpr;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      gl!.viewport(0, 0, w, h);
    }

    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(() => resize());
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const vsSource = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;

    const fsSource = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_state;
vec3 purplePalette(float t){vec3 a=vec3(0.922,0.871,0.961);vec3 b=vec3(0.820,0.722,0.882);vec3 c=vec3(0.690,0.569,0.780);vec3 d=vec3(0.871,0.780,0.922);float p=mod(t,1.0)*3.0;if(p<1.0)return mix(a,b,p);if(p<2.0)return mix(b,c,p-1.0);return mix(c,d,p-2.0);}
vec3 pinkPalette(float t){vec3 a=vec3(0.980,0.788,0.835);vec3 b=vec3(0.902,0.447,0.553);vec3 c=vec3(0.929,0.675,0.663);vec3 d=vec3(0.961,0.820,0.780);float p=mod(t,1.0)*3.0;if(p<1.0)return mix(a,b,p);if(p<2.0)return mix(b,c,p-1.0);return mix(c,d,p-2.0);}
vec3 bluePalette(float t){vec3 a=vec3(0.808,0.878,0.969);vec3 b=vec3(0.620,0.729,0.902);vec3 c=vec3(0.455,0.592,0.831);vec3 d=vec3(0.749,0.827,0.941);float p=mod(t,1.0)*3.0;if(p<1.0)return mix(a,b,p);if(p<2.0)return mix(b,c,p-1.0);return mix(c,d,p-2.0);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float smoothNoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*f*(f*(f*6.0-15.0)+10.0);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float v=0.0;float amp=0.6;float freq=0.8;for(int i=0;i<5;i++){v+=amp*smoothNoise(p*freq);amp*=0.5;freq*=1.7;}return v*0.8+0.1;}
float dither(vec2 uv,float t){return fract(sin(dot(uv*512.0,vec2(12.9898,78.233))+t)*43758.5453);}
void main(){
vec2 uv=gl_FragCoord.xy/u_resolution;
vec2 p=uv*2.0-1.0;
float aspect=u_resolution.x/u_resolution.y;
p.x*=aspect;
float t=u_time*0.2;
vec2 flow1=vec2(fbm(p*0.6+vec2(t*0.18,0.0)),fbm(p*0.6+vec2(0.0,t*0.15)))*2.0-1.0;
vec2 warp1=p+flow1*1.0;
vec2 flow2=vec2(fbm(warp1*1.3+vec2(t*0.10,t*0.08)),fbm(warp1*1.3+vec2(t*0.08,t*0.12)+3.7))*2.0-1.0;
vec2 warped=warp1+flow2*0.8;
vec2 flow3=vec2(fbm(warped*2.0+vec2(t*0.12,-t*0.10)+1.2),fbm(warped*2.0+vec2(-t*0.10,t*0.15)+8.4))*2.0-1.0;
vec2 finalUV=warped+flow3*0.5;
float mixVal=0.0;
float n1=fbm(finalUV*0.5+t*0.02);
float n2=fbm(finalUV*0.8-t*0.035+2.0);
float n3=fbm(finalUV*1.3+t*0.04+4.5);
float n4=fbm(finalUV*2.0-t*0.03+7.1);
float n5=fbm(finalUV*3.0+t*0.035+10.2);
mixVal=n1*0.25+n2*0.25+n3*0.20+n4*0.16+n5*0.14;
mixVal=clamp(mixVal*1.3-0.15,0.0,1.0);
float wave=sin(t*0.10+finalUV.x*0.5+finalUV.y*0.25)*0.18;
float colorPos=mixVal*4.0+wave+finalUV.x*0.03;
colorPos=mod(colorPos,4.0)/4.0;
vec3 purple=purplePalette(colorPos*4.0+t*0.015);
vec3 pink=pinkPalette(colorPos*4.0+t*0.015);
vec3 blue=bluePalette(colorPos*4.0+t*0.015);
vec3 color;
float sm=mod(u_state,3.0);
if(sm<1.0)color=mix(purple,pink,sm);
else if(sm<2.0)color=mix(pink,blue,sm-1.0);
else color=mix(blue,purple,sm-2.0);
color+=(dither(gl_FragCoord.xy,t)*2.0-1.0)/255.0;
float vignette=1.0-length(p*0.55)*0.3;
color*=mix(vignette,1.0,0.3);
vec3 auraP1=vec3(0.85,0.72,0.92);vec3 auraP2=vec3(0.75,0.60,0.85);vec3 auraP3=vec3(0.65,0.50,0.78);
vec3 auraK1=vec3(0.98,0.65,0.78);vec3 auraK2=vec3(0.90,0.45,0.60);vec3 auraK3=vec3(0.80,0.35,0.55);
vec3 auraB1=vec3(0.65,0.78,0.95);vec3 auraB2=vec3(0.50,0.65,0.88);vec3 auraB3=vec3(0.38,0.52,0.78);
vec3 a1=sm<1.0?mix(auraP1,auraK1,sm):sm<2.0?mix(auraK1,auraB1,sm-1.0):mix(auraB1,auraP1,sm-2.0);
vec3 a2=sm<1.0?mix(auraP2,auraK2,sm):sm<2.0?mix(auraK2,auraB2,sm-1.0):mix(auraB2,auraP2,sm-2.0);
vec3 a3=sm<1.0?mix(auraP3,auraK3,sm):sm<2.0?mix(auraK3,auraB3,sm-1.0):mix(auraB3,auraP3,sm-2.0);
float aura1=exp(-length(p*0.65-vec2(0.08,0.04))*1.8)*0.40;
color+=a1*aura1;
float aura2=exp(-length(p*0.45+vec2(0.18,-0.08))*1.6)*0.28;
color+=a2*aura2;
float aura3=exp(-length(p*0.85-vec2(-0.12,0.12))*2.0)*0.18;
color+=a3*aura3;
float edgeFade=1.0-abs(p.x*p.y)*0.10;
color=mix(color,color*0.92,1.0-edgeFade);
gl_FragColor=vec4(color,1.0);
}`;

    function compileShader(source: string, type: number) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      u_resolution: gl.getUniformLocation(program, "u_resolution"),
      u_time: gl.getUniformLocation(program, "u_time"),
      u_state: gl.getUniformLocation(program, "u_state"),
    };

    let startTime = performance.now();
    let animId: number;

    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      stateRef.current += (targetRef.current - stateRef.current) * 0.04;

      const snap = ((Math.round(stateRef.current) % 3) + 3) % 3;
      if (snap !== lastSnapRef.current) {
        lastSnapRef.current = snap;
        setIndex(snap);
      }

      gl!.useProgram(program);
      gl!.uniform2f(uniforms.u_resolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uniforms.u_time, elapsed);
      gl!.uniform1f(uniforms.u_state, stateRef.current);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(render);
    }

    resize();
    render();

    // Auto-advance slides smoothly every 7 seconds
    const interval = setInterval(() => {
      targetRef.current = targetRef.current + 1;
    }, 7000);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <SEO
        title="Belvo — Full-Service Digital Marketing & Creative Agency | Mumbai"
        description="Belvo is a premium digital marketing and creative agency in Goregaon, Mumbai. We build, scale, and transform brands through performance marketing, SEO, web development, and 3D visual production."
        path="/"
      />
      <style>{heroStyles}</style>

      {/* ── 1. HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          background: "#0a0810",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            pointerEvents: "none",
            zIndex: 1,
            background: "#0a0810",
          }}
        />

        {/* Texture & Radial overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,8,16,0.6) 100%)",
          }}
        />

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 4rem) 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {/* Animated Headline */}
          <h1
            key={`title-${index}`}
            className="hero-title"
            style={{
              fontSize: "clamp(2.75rem, 7.5vw, 6.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              fontFamily: "'Inter', sans-serif",
              color: "#161014",
              marginBottom: "1.5rem",
              maxWidth: "1000px",
            }}
          >
            {parseTitle(TEXT_SETS[index].title).map((line, lineIdx) => (
              <div
                key={lineIdx}
                className="hero-title__line"
                style={{ animationDelay: `${lineIdx * 90}ms` }}
              >
                {line.map((seg, segIdx) => (
                  <span
                    key={segIdx}
                    className="hero-title__seg"
                    style={{ animationDelay: `${lineIdx * 90 + segIdx * 70}ms` }}
                    dangerouslySetInnerHTML={{ __html: seg.html }}
                  />
                ))}
              </div>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            key={`sub-${index}`}
            className="hero-subtitle-anim"
            style={{
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              fontWeight: 400,
              color: "#2a2228",
              lineHeight: 1.6,
              maxWidth: "680px",
              marginBottom: "2.5rem",
            }}
          >
            {TEXT_SETS[index].sub}
          </p>

        </div>

        {/* Bottom Hero Bar: Slide Indicators */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "1.5rem clamp(1.25rem, 5vw, 4rem)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Slide navigation pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {TEXT_SETS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                style={{
                  width: index === i ? "32px" : "10px",
                  height: "8px",
                  borderRadius: "4px",
                  background: index === i ? "#7B2FBE" : "rgba(0,0,0,0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
