#version 150

out vec4 outputColor;
uniform vec2 iResolution;
uniform float fTime;

uniform sampler2DRect heightMapTex;
uniform vec2          heightMapRes;
uniform sampler2DRect normalMapTex;
uniform vec2          normalMapRes;


//----------------------
// Constants 
const float GEO_MAX_DIST   = 50.0;
const int MATERIALID_SKY    = 2;
const int MATERIALID_SPHERE = 3;
const vec3  F_ALU_N  = vec3(1.600,0.912,0.695); //(Red ~ 670 nm; Green ~ 540 nm; Blue ~ 475 nm)
const vec3  F_ALU_K  = vec3(8.010,6.500,5.800); //(Red ~ 670 nm; Green ~ 540 nm; Blue ~ 475 nm)
vec4 cDebug = vec4(0);

//----------------------
// Slider bound globals. Use the slider, don't change the value here.
float ROUGHNESS_AMOUNT       = 0.85;//Valid range : [0-1] 0=shiny, 1=rough map
float SKY_COLOR              = 0.0; //[0.0=Red, 1.0=Blue)
float ABL_LIGHT_CONTRIBUTION = 0.0; //[0-1] Additional ABL Light Contribution

#define saturate(x) clamp(x,0.0,1.0)

//PBR Equation for both (IBL) or (ABL), plastic or metal.
vec3 PBR_Equation(vec3 V, vec3 L, vec3 N, float roughness, const vec3 ior_n, const vec3 ior_k, const bool metallic, const bool bIBL)
{
    float cosT = saturate( dot(L, N) );
    float sinT = sqrt( 1.0 - cosT * cosT);
	vec3 H = normalize(L+V);
	float NdotH = dot(N,H);//Nn.H;
	float NdotL = dot(N,L);//Nn.Ln;
	float VdotH = dot(V,H);//Vn.H;
    float NdotV = dot(N,V);//Nn.Vn;
    
    //Distribution Term
    float PI = 3.14159;
    float alpha2 = roughness * roughness;
    float NoH2 = NdotH * NdotH;
    float den = NoH2*(alpha2-1.0)+1.0;
    float D = 1.0; //Distribution term is externalized from IBL version
    if(!bIBL)
        D = (NdotH>0.)?alpha2/(PI*den*den):0.0; //GGX Distribution.
	
    //Fresnel Term
	vec3 F;
    if(metallic)
    {
        float cos_theta = 1.0-NdotV;
        F =  ((ior_n-1.)*(ior_n-1.)+ior_k*ior_k+4.*ior_n*pow(1.-cos_theta,5.))
		    /((ior_n+1.)*(ior_n+1.)+ior_k*ior_k);
    }
    else //Dielectric (Note: R/G/B do not really differ for dielectric materials)
    {
        float F0 = pow((1.0 - ior_n.x) / (1.0 + ior_n.x),2.0);
  		F = vec3(F0 + (1.-F0) * pow( 1. - VdotH, 5.));
    }
    
    //Geometric term (Source: Real Shading in Unreal Engine 4 2013 Siggraph Presentation p.3/59)
    //k = Schlick model (IBL) : Disney's modification to reduce hotness (point light)
    float k = bIBL?(roughness*roughness/2.0):(roughness+1.)*(roughness+1.)/8.; 
    float Gl = max(NdotL,0.)/(NdotL*(1.0-k)+k);
    float Gv = max(NdotV,0.)/(NdotV*(1.0-k)+k);
    float G = Gl*Gv;
    
    float softTr = 0.1; // Valid range : [0.001-0.25]. Transition softness factor, close from dot(L,N) ~= 0
    float angleLim = 0.15; // Valid range : [0-0.75]. Compensates for IBL integration suface size.
    if(bIBL)
        return (F*G*(angleLim+sinT)/(angleLim+1.0) / (4.*NdotV*saturate(NdotH)*(1.0-softTr)+softTr));
    else
        return D*F*G / (4.*NdotV*NdotL*(1.0-softTr)+softTr);
}

vec3 PBR_HDRremap(vec3 c)
{
    float fHDR = smoothstep(2.900,3.0,c.x+c.y+c.z);
    vec3 cRedSky   = mix(c,1.3*vec3(4.5,2.5,2.0),fHDR);
    vec3 cBlueSky  = mix(c,1.8*vec3(2.0,2.5,3.0),fHDR);
    return mix(cRedSky,cBlueSky,SKY_COLOR);
}

vec3 PBR_HDRCubemap(vec3 sampleDir, float LOD_01)
{
	//TODO
    vec3 linearGammaColor_sharp = vec3(.8)*sampleDir.y+vec3(0.2);
	//PBR_HDRremap(pow(texture( iChannel2, sampleDir ).rgb,vec3(2.2)));
    vec3 linearGammaColor_blur  = vec3(.3)*sampleDir.y+vec3(0.7);
	//PBR_HDRremap(pow(texture( iChannel3, sampleDir ).rgb,vec3(1)));
    vec3 linearGammaColor = mix(linearGammaColor_sharp,linearGammaColor_blur,saturate(LOD_01));
    return linearGammaColor;
}

//Arbitrary axis rotation (around u, normalized)
mat3 PBR_axisRotationMatrix( vec3 u, float ct, float st ) //u=axis, co=cos(t), st=sin(t)
{
    return mat3(  ct+u.x*u.x*(1.-ct),     u.x*u.y*(1.-ct)-u.z*st, u.x*u.z*(1.-ct)+u.y*st,
	              u.y*u.x*(1.-ct)+u.z*st, ct+u.y*u.y*(1.-ct),     u.y*u.z*(1.-ct)-u.x*st,
	              u.z*u.x*(1.-ct)-u.y*st, u.z*u.y*(1.-ct)+u.x*st, ct+u.z*u.z*(1.-ct) );
}

vec3 PBR_importanceSampling(vec3 sampleDir, float roughness, float e1, float e2, out float range)
{
    const float PI = 3.14159;
    range = atan( roughness*sqrt(e1)/sqrt(1.0-e1) );
    float phi = 2.0*PI*e2;
    vec3 notColinear   = (abs(sampleDir.y)<0.8)?vec3(0,1,0):vec3(1,0,0);
    vec3 othogonalAxis = normalize(cross(notColinear,sampleDir));
	mat3 m1 = PBR_axisRotationMatrix(normalize(othogonalAxis), cos(range), sin(range));
	mat3 m2 = PBR_axisRotationMatrix(normalize(sampleDir),     cos(phi),   sin(phi));
	return sampleDir*m1*m2;
}

vec3 PBR_visitSamples(vec3 V, vec3 N, float roughness, bool metallic, vec3 ior_n, vec3 ior_k )
{
    const float MIPMAP_SWITCH  = 0.29; //sampling angle delta (rad) equivalent to the lowest LOD.
    const ivec2 SAMPLE_COUNT = ivec2(05,15); //(5 random, 15 fixed) samples
    const vec2 weight = vec2(1./float(SAMPLE_COUNT.x),1./float(SAMPLE_COUNT.y));
    float angularRange = 0.;    
    vec3 vCenter = reflect(-V,N);
    
    //Randomized Samples : more realistic, but jittery
    float randomness_range = 0.75; //Cover only the closest 75% of the distribution. Reduces range, but improves stability.
    float fIdx = 0.0;              //valid range = [0.5-1.0]. Note : it is physically correct at 1.0.
    vec3 totalRandom = vec3(0.0);
    for(int i=0; i < SAMPLE_COUNT[0]; ++i)
    {
        //Random noise from DaveHoskin's hash without sine : https://www.shadertoy.com/view/4djSRW
        vec3 p3 = fract(vec3(fIdx*10.0+vCenter.xyx*100.0) * vec3(.1031,.11369,.13787)); 
    	p3 += dot(p3.zxy, p3.yzx+19.19);
    	vec2 jitter = fract(vec2((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y));
        vec3 sampleDir    = PBR_importanceSampling(vCenter, roughness, jitter.x*randomness_range, jitter.y, angularRange);
        vec3 sampleColor  = PBR_HDRCubemap( sampleDir, angularRange/MIPMAP_SWITCH);
        vec3 contribution = PBR_Equation(V, sampleDir, N, roughness, ior_n, ior_k, metallic, true)*weight[0];
    	totalRandom += contribution*sampleColor;
		++fIdx;
    }
    
    //Fixed Samples : More stable, but can create sampling pattern artifacts (revealing the sampling pattern)
    fIdx = 0.0;
    vec3 totalFixed = vec3(0.0);
    for(int i=0; i < SAMPLE_COUNT[1]; ++i)
    {
        vec2 jitter = vec2( clamp(weight[1]*fIdx,0.0,0.50), fract(weight[1]*fIdx*1.25)+3.14*fIdx); //Fixed sampling pattern.
        vec3 sampleDir    = PBR_importanceSampling(vCenter, roughness, jitter.x, jitter.y, angularRange);
        vec3 sampleColor  = PBR_HDRCubemap( sampleDir, angularRange/MIPMAP_SWITCH);
        vec3 contribution = PBR_Equation(V, sampleDir, N, roughness, ior_n, ior_k, metallic, true)*weight[1];
        totalFixed += contribution*sampleColor;
		++fIdx;
    }
    
    return (totalRandom*weight[1]+totalFixed*weight[0])/(weight[0]+weight[1]);
}

struct TraceData
{
    float rayLen; //Run Distance
    vec3  rayDir; //Run Direction
    vec3  normal; //Hit normal
    int   matID;  //Hit material ID
};

//The main material function.
vec3 MAT_apply(vec3 pos, TraceData traceData)
{
    //Roughness texture
    vec4 roughnessBuffer = vec4(0.02);
    float roughness = (roughnessBuffer.x+roughnessBuffer.y+roughnessBuffer.z)/3.0;
    roughness = roughnessBuffer.w+saturate(roughness-1.00+ROUGHNESS_AMOUNT)*0.25;
    
    //IBL and ABL PBR Lighting
    vec3 rd  = traceData.rayDir;
    vec3 V = normalize(-traceData.rayDir);
    vec3 N = traceData.normal;
    vec3 L = normalize(vec3(1,1,0));
    
    //Hack : Make sure NV angle never exceeds 90 deg (impossible geometry - back face)
    float dotNV = dot(N,V);
    if(dotNV<0. && traceData.matID!=MATERIALID_SKY ){
        N = normalize(N-dotNV*V*1.05);
    }
    
    vec3 col = PBR_visitSamples(V,N,roughness, true, F_ALU_N, F_ALU_K);
    vec3 L0  = PBR_Equation(V,L,N,roughness+0.01, F_ALU_N, F_ALU_K, true, false);
    col     += PBR_HDRremap(vec3(1))*L0*ABL_LIGHT_CONTRIBUTION;
    
	//TODO
    vec3 backgroundColor = vec3(0);//pow(texture( iChannel2, traceData.rayDir ).xyz,vec3(2.2));
    
    return traceData.matID==MATERIALID_SKY?backgroundColor:col;
}
vec2 planeUV(vec3 p, vec2 size){
    return vec2(vec2(-.5,.5)*p.xz/size+vec2(.5));
}
vec3 aPlaneXZ(vec3 ro, vec3 rd, vec2 size){
    
    float d = -ro.y/rd.y;
    vec3 p = ro+rd*d;
    if(abs(p.x)<size[0]&&abs(p.z)<size[1]&&d>0.)
    	return vec3(d,planeUV(p,size));
    return vec3(GEO_MAX_DIST,vec2(0));
}

//Local space (tile uv:[0-1] to global uv)
vec2 tileToMain_uv(vec2 uv, int lod){
    float scaleDenom = exp2(float(lod+1));
	float xOffset = 1.0-(2.0/scaleDenom);
    return uv/scaleDenom+vec2(xOffset,0);
}

vec4 image(vec2 uv){
	return texture2DRect(heightMapTex, heightMapRes*uv);
}

vec4 imageNormal(vec2 uv){
    return texture2DRect(normalMapTex, normalMapRes*uv);
}

float imageHeight(vec2 uv){
    float h = image(uv).x;
    return h;
}

TraceData TRACE_geometry(vec3 o, vec3 rd)
{
    float max_h = 0.08;
    vec3 sup = aPlaneXZ(o-vec3(0,max_h,0),rd,vec2(1.0));
    
    vec3  p = o;
    float d = sup.x;
    float h = 0.;
    for(int i=0; i<32; ++i)
    {
        h = (imageHeight(planeUV(p,vec2(1.))))*max_h;
        d += (p.y-h);
        p = o + rd*d;
    }
    
    //if(sup.x<GEO_MAX_DIST) cDebug += vec4(1,0,0,0.1);

    bool bHit = sup.x<GEO_MAX_DIST;
    vec3 N = imageNormal(planeUV(p,vec2(1.))).xzy;//Rotated, so y=z
    
    return TraceData(d,rd,N,bHit?MATERIALID_SPHERE:MATERIALID_SKY);
}

vec4 mainImage( vec2 fragCoord )
{
	vec4 iMouse = vec4(0);
	float iTime = fTime;
    //Camera & setup
    ROUGHNESS_AMOUNT        = .5;
    SKY_COLOR               = .25;
    ABL_LIGHT_CONTRIBUTION  = .0005;
    
    float rotX = ((iMouse.z>0.)&&any(lessThan(iMouse.xy/iResolution.xy,vec2(0.9,0.80))))?
	             ((iMouse.x/iResolution.x)*2.0*3.14) : (iTime*0.3);
    vec2 uv = 2.5*(fragCoord.xy-0.5*iResolution.xy) / iResolution.xx;
    vec3 camO = vec3(cos(rotX),0.9,sin(rotX))*1.15;
    vec3 camD = normalize(vec3(0)-camO);
    vec3 camR = normalize(cross(camD,vec3(0,1,0)));
    vec3 camU = cross(camR,camD);
   	vec3 dir =  normalize(uv.x*camR+uv.y*camU+camD);
    
    //Raytrace
    TraceData geometryTraceData = TRACE_geometry(camO, dir);
    vec3 ptGeo = (geometryTraceData.rayLen < GEO_MAX_DIST)? camO+dir*geometryTraceData.rayLen : vec3(0);
    
    //Material
    vec3 c = MAT_apply(ptGeo,geometryTraceData).xyz;
    
    //Post-processing
    float sin2 = dot(uv/1.6,uv/1.6);
    float vignetting = pow(1.0-min(sin2*sin2,1.0),2.);
    c = pow(c*vignetting,vec3(0.4545)); //2.2 Gamma compensation
    
    //Slider overlay
	vec4 cOut = vec4(0,0,0,1);
    //cOut = vec4(mix(c,cSlider.rgb,cSlider.a),1.0);
    cOut.rgb = c;
    cOut.rgb = mix(cOut.rgb,cDebug.rgb,cDebug.a);
	return cOut;
}

void main()
{
	outputColor = mainImage(vec2(gl_FragCoord.x,iResolution.y-gl_FragCoord.y));
	/*vec2 uv = gl_FragCoord.xy/iResolution;
	outputColor.rgb = vec3(imageHeight(uv));
	outputColor.g = 0.8;
	outputColor.a   = 1.;*/
}



