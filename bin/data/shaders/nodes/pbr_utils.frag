//Reusable utility file
#define saturate(x) clamp(x,0.0,1.0)
const vec3  F_ALU_N  = vec3(1.600,0.912,0.695); //(Red ~ 670 nm; Green ~ 540 nm; Blue ~ 475 nm)
const vec3  F_ALU_K  = vec3(8.010,6.500,5.800); //(Red ~ 670 nm; Green ~ 540 nm; Blue ~ 475 nm)

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
		//F = vec3(1.);
    }
    else //Dielectric (Note: R/G/B do not really differ for dielectric materials)
    {
        float F0 = abs((1.0 - ior_n.x) / (1.0 + ior_n.x));
        //float F0 = pow((1.0 - ior_n.x) / (1.0 + ior_n.x),2.0); //abstrak version, not idea why diff.
  		F = vec3(F0 + (1.-F0) * pow( 1. - VdotH, 5.));
    }
    
    //Geometric term (Source: Real Shading in Unreal Engine 4 2013 Siggraph Presentation p.3/59)
    //k = Schlick model (IBL) : Disney's modification to reduce hotness (point light)
    float k = bIBL?(roughness*roughness/2.0):(roughness+1.)*(roughness+1.)/8.; 
    float Gl = max(NdotL,0.)/(NdotL*(1.0-k)+k);
    float Gv = max(NdotV,0.)/(NdotV*(1.0-k)+k);
    float G = Gl*Gv;
    
    //Personal addition: This parameter softens up the transition at grazing angles (otherwise too sharp IMHO).
    // Valid range : [0.001-0.25]. It will reduce reflexivity on edges when too high, however.
    float softTr = 0.1;    
    //Personal addition: This parameter limits the reflexivity loss at 90deg viewing angle (black spot in the middle?).
    // Valid range : [0-0.75] (Above 1.0, become very mirror-like and diverges from a physically plausible result)
    float angleLim = 0.15;
    if(bIBL)
        return (F*G*(angleLim + sinT) / (angleLim + 1.0) / (4.*NdotV*saturate(NdotH)*(1.0 - softTr) + softTr)); //IBL
    else
        return D*F*G / (4.*NdotV*NdotL*(1.0 - softTr) + softTr);	//ABL
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
	//FIXME : This "notColinear" vector creates a discontinuity around sampleDir condition threshold.
	//This was quickly fixed to work for the current scenario (sampleDir = vec3(0,1,0))
    vec3 notColinear   = (abs(sampleDir.x)<0.8)?vec3(1,0,0):vec3(0,1,0);
    vec3 othogonalAxis = normalize(cross(notColinear,sampleDir));
	mat3 m1 = PBR_axisRotationMatrix(normalize(othogonalAxis), cos(range), sin(range));
	mat3 m2 = PBR_axisRotationMatrix(normalize(sampleDir),     cos(phi),   sin(phi));
	return sampleDir*m1*m2;
}