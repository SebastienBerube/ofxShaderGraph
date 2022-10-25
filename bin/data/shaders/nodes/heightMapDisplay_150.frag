#version 150

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

vec3 mainImage(in vec2 fragCoord ){
    //fragCoord.y = iResolution.y - fragCoord.y; //Force Y-Up
    vec2 uv = (fragCoord.xy) / iResolution.xx;
    vec3 N = (texture2DRect(brickNormalTex, brickHeightRes*uv).xyz-vec3(0.5));
    N = normalize(N*vec3( 1,1, 8));
    //N = normalize(N);

    vec3 o = vec3(0, 0, 0.5);
    vec3 p = vec3((uv - vec2(0.5))*vec2(1,-1), 0);

    const float F_DIELECTRIC_PLASTIC = 1.49;
    vec3 V = normalize(o-p);
    vec3 L1 = normalize(vec3(sin(fTime), cos(fTime)+2., 1.8));
    vec3 L2 = normalize(vec3(-0.18, 0.45, 0.8));
    vec3 L3 = normalize(vec3(0.4, 0.53, 0.5));
    vec3 L4 = normalize(vec3(2.3, 0.53, 0.3));
    float pixSize = 1.00;
    float roughness = 0.8;
    const vec3 ior_n = vec3(F_DIELECTRIC_PLASTIC);
    const vec3 ior_k = vec3(0);
    const bool metallic = false;
    const bool bIBL = false;
    vec3 cL1 = PBR_Equation(V, L1, N, roughness, ior_n, ior_k, metallic, bIBL);
    vec3 cL2 = PBR_Equation(V, L2, N, roughness, ior_n, ior_k, metallic, bIBL);
    vec3 cL3 = PBR_Equation(V, L3, N, roughness, ior_n, ior_k, metallic, bIBL);
    vec3 cL4 = PBR_Equation(V, L4, N, roughness, ior_n, ior_k, metallic, bIBL);

    vec3 cTint = vec3(0.95, 1.0, 1.0);
    vec3 cAmb = .40*(N.y + 0.25) + vec3(0.2);
    return cTint*((cL1+cL2+cL3+cL4)*2.+ cAmb);
}

void main(){
	outputColor.rgb = mainImage(gl_FragCoord.xy);
	outputColor.a   = 1.;
}