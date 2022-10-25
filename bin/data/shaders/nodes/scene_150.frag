#version 150

/*struct vec3;
struct vec4;*/

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect brickHeightTex;
uniform sampler2DRect brickNormalTex;
uniform vec2          brickHeightRes;
uniform vec4 iMouse;

#pragma include <cam_utils.frag>
#pragma include <noise_utils.frag>
#pragma include <pbr_utils.frag>
#pragma include <df_utils.frag>
#pragma include <math_utils.frag>

vec3 udTruncBox( vec3 p, vec3 b, float r, float aSlope/*angle (strength)*/, float rSlope/*roll (circular)*/){
    float d1 = length(max(abs(p.xy)-(b.xy-r),0.0));
    //<Add Slope trunc>
    float ca = cos(aSlope), sa = sin(aSlope);
    vec3 pSlopeRoll = rotate(p,rSlope);
    p.z = ca*pSlopeRoll.z+sa*pSlopeRoll.y;
    float d2 = p.z-(b.z-r);
	//vec2 uv = vec2(p.x/b.x,p.y/b.y);
	vec2 uv = (p.xy+b.xy)/(2.*b.xy);
	//float t = 0.02; if(uv.x<t||uv.y<t||uv.x>(1.-t)||uv.y>(1.-t)) uv = vec2(0); //UV Boundary Test
    return vec3(opSmoothSubtract(d1,-d2)-r,uv);
    //</Add Slope trunc>
}

const int MAT_BRICK = 1;
const int MAT_FLOOR = 2;
struct matData
{
	int iMatID;
	vec2 uv;
};

float brickNo;
vec3 tiledBox(vec3 p, vec3 size)
{
    const float RRDM = 0.05; //Rotation random
    const float ZRDM = 0.02; //Z Random
    const float SXRDM = 0.01; //Size X Random
    const float SYRDM = 0.01; //Size Y Random
    float M = size.y*0.35;   //margin size
    float xRepeat = size.x*2.+M; 
    float yRepeat = size.y*2.+M;
    float ySeed = floor(0.5+p.y/yRepeat);
    
    if(fract(ySeed/2.)>0.1)
        p.x += xRepeat/2.0 + sin(ySeed*4.)*M;
    else
        p.x += sin(ySeed*236.81)*M;
    float xSeed = floor(0.5+p.x/xRepeat);
	brickNo=xSeed+2.*ySeed;
    vec3 originalP = p;
    
    p.x = (fract(p.x/xRepeat+0.5)-0.5)*xRepeat;
    p.y = (fract(p.y/yRepeat+0.5)-0.5)*yRepeat;
    
    //This distance is meant to slow the raymarch down and prevent artifacts occuring with sudden
	//height or size changes across this repeated pattern.
    //(artifacts have disappeared but it is somewhat an "act of faith" because I could 
    // have done a mistake here).
    float dAdjacentHull = max((abs(p.z)-size.z-ZRDM),M-max(abs(p.x)-xRepeat/2.,abs(p.y)-yRepeat/2.));
    
    p.z += ZRDM*rdm(2.81*xSeed+2.31*ySeed);
    
    float rdmA = rdm(xSeed+ySeed*1.126);
    float rdmB = rdm((xSeed+ySeed*1.326)*2.31);
    float rdmC = rdm((xSeed+ySeed*1.226)*0.71);
    float rdmD = rdm((xSeed+ySeed*1.526)*0.51);
    float rdmE = rdm((xSeed+ySeed*1.426)*0.62);
        
   	size -= vec3(SXRDM*rdmA,SYRDM*rdmB,0);
    
	vec3 d_uv = udTruncBox(rotate(p,RRDM*rdmA),size,0.01, rdmD*0.15,rdmE*6.28);
	float dCurrent = d_uv[0];
    
    return vec3(min(dCurrent,dAdjacentHull),d_uv.yz);
}

float distanceToFloor(vec3 p){
    return p.y;
}

float distanceToScene(vec3 p){
    float d1 = tiledBox(p,vec3(0.29,0.12,0.1)).x;
    float d2 = distanceToFloor(p);
    return min(d1,d2);
}

vec3 gradScene(vec3 p)
{
    float eps = 0.001;
    float c = distanceToScene(p);
    float cx = distanceToScene(p + vec3(eps, 0, 0));
    float cy = distanceToScene(p + vec3(0, eps, 0));
    float cz = distanceToScene(p + vec3(0, 0, eps));
    return normalize(vec3(cx - c, cy - c, cz - c));
}

matData sceneMaterial(vec3 p){
    vec3 d_uv = tiledBox(p,vec3(0.29,0.12,0.1));
	float d1 = d_uv[0];
    float d2 = distanceToFloor(p);
	if(d1<d2)
		return matData(MAT_BRICK,d_uv.yz);
	else
		return matData(MAT_FLOOR,vec2(p.xz));
}

vec3 rayMarch(vec3 o, vec3 d){
    vec3 p = o+0.1*d;
    for( int i=0; i < 96; ++i){
        float dist = distanceToScene(p);
        p += dist*d;
        if(dist<0.001)
            break;
    }
    return p;
}

float getBrickHeight(vec2 uv, float idx){
	float iRow = floor(idx/2.);
	float iColumn = idx-iRow*2.;
	bool bOffset = fract(iRow/2.)<0.5;
	float xMin = iColumn*.33+(bOffset?.1886:0.06);
	float yMin = 1.-iRow*.1666-.16666;
	float xMax = xMin+.33;
	float yMax = yMin+.16667;
	
	//Range test
	//float ho = texture2DRect(brickHeightTex, brickHeightRes*uv).x;
	//if(uv.x<xMin || uv.y<yMin || uv.x>xMax || uv.y>yMax) return 1.; else return ho;
	
	vec2 uvMin = vec2(xMin,yMin);
	vec2 uvRng = vec2(xMax-xMin,yMax-yMin);
	uv = uvMin + uv*uvRng;
	float h = texture2DRect(brickHeightTex, brickHeightRes*uv).x;
	
	return h;
}

vec3 getBrickNormal(float h, vec2 uv, float idx) {
    
    float iRow = floor(idx / 2.);
    float iColumn = idx - iRow*2.;
    bool bOffset = fract(iRow / 2.)<0.5;
    float xMin = iColumn*.33 + (bOffset ? .1886 : 0.06);
    float yMin = 1. - iRow*.1666 - .16666;
    float xMax = xMin + .33;
    float yMax = yMin + .16667;

    //Range test
    //float ho = texture2DRect(brickHeightTex, brickHeightRes*uv).x;
    //if(uv.x<xMin || uv.y<yMin || uv.x>xMax || uv.y>yMax) return 1.; else return ho;

    vec2 uvMin = vec2(xMin, yMin);
    vec2 uvRng = vec2(xMax - xMin, yMax - yMin);
    
    vec3 tNormal = texture2DRect(brickNormalTex, brickHeightRes*(uvMin + uv*uvRng)).xyz;
    tNormal = (tNormal-vec3(0.5))*2.;

    //if(uv.y>0.4)
        return normalize(vec3(tNormal.x, tNormal.y, tNormal.z*10.));
    //return normalize(vec3(tNormal.x, tNormal.y, tNormal.z*10.));

    
    
    
    
    float eps = 0.01;
    float hx = getBrickHeight(uv + vec2(eps, 0), idx);
    float hy = getBrickHeight(uv + vec2(0, eps), idx);
    return normalize(vec3(hx - h, hy - h, eps*50.1));
}

vec3 mainImage(in vec2 fragCoord ){
	vec2 uv = (fragCoord.xy-iResolution.xy*0.5) / iResolution.xx;
	
	//------------------------
	//Camera
	float scrollingSpeed = 0.1*fTime;
    vec3 o = vec3(0.0,0.65,0.2)+vec3(scrollingSpeed*0.2,scrollingSpeed*0.05,0.5);
    vec3 d = ray(uv);
	
	//------------------------
	//Raymarch to surface
    vec3 p = rayMarch(o,d);
	 
	//------------------------
	//Material & Shading
    matData mData = sceneMaterial(p);
	if(mData.iMatID==MAT_BRICK)
	{
        float nVARIANTS = 12;
        float idx = fract(brickNo / nVARIANTS)*nVARIANTS;
        float h = getBrickHeight(mData.uv, idx);
        vec3 N = gradScene(p); 

        //FIXME : Normal computation here is shitty (both how it combines and how it is computed)
        if (abs(N.z) > 0.1)
        {
            vec3 brickN = getBrickNormal(h, mData.uv, idx);
            N = normalize(N + brickN*.2);
            N = brickN;
            //return brickN;
        }

        p.z -= (1. - h)*.025;
         
        const float F_DIELECTRIC_PLASTIC = 1.49;
        vec3 V = -d;
        vec3 L1 = normalize(vec3(0.1, 0.15, 5.3));
        vec3 L2 = normalize(vec3(-0.18, 0.25, 5.3));
        vec3 L3 = normalize(vec3(0.3, 0.03, 5.3));
        vec3 L4 = normalize(vec3(5.3, 0.03, 5.3));
        //vec3 N = vec3(0,0,-1);//TODO
        float pixSize = 1.00;
        // normalize(sobelImageNormal(mData.uv, pixSize*1., 110., idx));
        //return N;
        float roughness = 0.3;
        const vec3 ior_n = vec3(F_DIELECTRIC_PLASTIC);
        const vec3 ior_k = vec3(0);
        const bool metallic = false;
        const bool bIBL = false;
        vec3 cL1 = PBR_Equation(V, L1, N, roughness, ior_n, ior_k, metallic, bIBL);
        vec3 cL2 = PBR_Equation(V, L2, N, roughness, ior_n, ior_k, metallic, bIBL);
        vec3 cL3 = PBR_Equation(V, L3, N, roughness, ior_n, ior_k, metallic, bIBL);
        vec3 cL4 = PBR_Equation(V, L4, N, roughness, ior_n, ior_k, metallic, bIBL);

        vec3 cTestHeight = mix(vec3(0.5, 1, .5), vec3(1, .5, .5), smoothstep(0.06, 0.110, p.z));
        
        return (cL1 + cL2 + cL3)*cTestHeight;
	}
    
	//------------------------
	//Camera
    vec3 c = mix(vec3(1), vec3(0),smoothstep(0.150,0.06,p.z));
	//c.rg = mData.uv;
	
	return c;
}

void main(){
	outputColor.rgb = mainImage(gl_FragCoord.xy);
	outputColor.a   = 1.;
}