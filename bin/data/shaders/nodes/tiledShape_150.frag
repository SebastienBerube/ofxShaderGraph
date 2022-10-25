#version 150
/*
 tiledShape_150
 Date Modified : 2019-06-11
 Date Tested : 2019-06-11
 UsageExample:
 {
   //Arbitrary generated input..
   declareShader("nodes/warpedShape_150", new RenderPass(resX, resY, "shaders/nodes/warpedShape_150", GL_RGBA8));

   declareShader("nodes/tiledShape_150", new RenderPass(resX, resY, "shaders/nodes/tiledShape_150", GL_RGBA8),
     [&](ofShader& s)
   {
     ofTexture& t = outputTex("nodes/warpedShape_150");
     s.setUniformTexture("inputTex", t, 0);
     s.setUniform2f("inputRes", t.getWidth(), t.getHeight());
   });
 }
*/
//Possible Improvemments :
// *Add aspect ratio variation
// *Optimize tiling from 4x4 to 3x3

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

vec2 uvScale = vec2(5.5);
vec2 cellScale = vec2(1.205,1.2); //This pretty much controls the number of tiles
vec2 shapeScale = vec2(1.1,1.3);
float luminanceScale = 0.7;
vec2 rdmOffset = vec2(0.2); //[0.0,0.4] ->seems like the max can be 
                            //multiplied by cellScale (the more room, the more offset possible)
float rdmLuminance = 0.25; //Subtractive?
float rdmScale = 0.2;

vec4 getTilePixel(vec2 uv){
  //This snippet allows to show a circle in the tile center
  //(good for debugging simple small shapes)
  //float len = length(uv-vec2(0.5));return vec4(len<0.4?len:0.);
  return texture2DRect(inputTex, inputRes*uv);
}
#define HASHSCALE3 vec3(.1031, .1030, .0973)
vec2 hash22(vec2 p){
  //https://www.shadertoy.com/view/4djSRW  Dave_Hoskins
  vec3 p3 = fract(vec3(p.xyx) * HASHSCALE3);
  p3 += dot(p3, p3.yzx+19.19);
  return fract((p3.xx+p3.yz)*p3.zy);
}

struct Cell{
  vec2 pLocal;   //The local centered, unscaled coordinates. Similar to uv, but keeps world aspect ratio and scale.
  vec2 uv;       //The tile uv, will always range [0-1] within the tile
  vec2 size;     //The tile size. Constant within tile.
  vec2 c;        //The tile center, in world coordinates. Constant within tile.
  vec2 idx;      //The tile row / column ([0,0], [0,1], [1,0], [1,1], etc.). Constant within tile.
};
Cell createCell(vec2 pWorld, vec2 cellSize){
  vec2 pScaledWorld = pWorld/cellSize+0.5;/*0.5001*/;
  vec2 pLocalUnit = fract(pScaledWorld);
  vec2 idx = pScaledWorld-pLocalUnit;       //Validated
  vec2 pLocalUnitCentered = pLocalUnit-0.5; //Validated
  vec2 pWorldCellCenter = pWorld-(pLocalUnitCentered*cellSize); //Validated
  vec2 pLocal = pWorld-pWorldCellCenter;    //Validated
  vec2 uvLocal = pLocal/cellSize+vec2(0.5); //Validated
  return Cell(pLocal,uvLocal,cellSize,pWorldCellCenter,idx);
}

vec4 tileLayer(vec2 uv, vec2 cellSize, float seed){
  Cell c = createCell(uv, cellSize);
  vec2 rdm = hash22(c.idx*1.11+seed).xy;
  float h = luminanceScale*mix(1.,rdm.y,rdmLuminance);
  float ct = cos(rdm.x*6.28), st = sin(rdm.x*6.28);
  mat2 m = mat2(ct,st,-st,ct);
  //<TESTED>
  //vec2 scl = shapeScale*mix(vec2(1.),rdm.xy+vec2(0.5),vec2(rdmScale)); //AR unlocked version
  vec2 scl = shapeScale*mix(1.,.5*(rdm.x+rdm.y)+0.5,rdmScale); //AR locked version
  //<TESTED>
  vec2 offset = (fract(rdm.xy)-0.5)*rdmOffset;
  return h*getTilePixel(m*(c.pLocal)/scl+vec2(0.5)+offset);
}

vec4 tileGenerator(vec2 uv, float seed){
  vec4 v1 = tileLayer(uv+vec2(.00,.00)*cellScale, cellScale, 1.+seed);
  vec4 v2 = tileLayer(uv+vec2(.25,.00)*cellScale, cellScale, 11.8+seed);
  vec4 v3 = tileLayer(uv+vec2(.25,.25)*cellScale, cellScale, 22.6+seed);
  vec4 v4 = tileLayer(uv+vec2(.00,.25)*cellScale, cellScale, 31.7+seed);
  return max(max(max(v1,v2),v3),v4);
}

vec4 macroTileGenerator(vec2 uv){
  vec4 v1 = tileGenerator(uv+vec2(.0,.0)*cellScale, 51.);
  vec4 v2 = tileGenerator(uv+vec2(.5,.0)*cellScale, 411.8);
  vec4 v3 = tileGenerator(uv+vec2(.5,.5)*cellScale, 322.6);
  vec4 v4 = tileGenerator(uv+vec2(.0,.5)*cellScale, 231.7);
  return max(max(max(v1,v2),v3),v4);
}

void main(){
  //vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord.xy/iResolution;
  uv=(uv-vec2(0.5));
  outputColor.rgb = macroTileGenerator(uv*uvScale).rgb;
  //<Debug 4x tile>
  //outputColor.rgb = tileGenerator(uv*uvScale, 0.2).rgb;
  //<Debug single tile>
  //outputColor.rgb = tileLayer(uv*uvScale, cellScale, 1.).rgb;
  outputColor.a   = 1.0;
}