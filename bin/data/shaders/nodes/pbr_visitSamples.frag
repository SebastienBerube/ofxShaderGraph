vec3 PBR_visitSamples(vec3 pos, vec3 V, vec3 N, float roughness, bool metallic, vec3 ior_n, vec3 ior_k )
{
	//roughness = 0.02;
	float angularRange = 0.;    
	vec3 vCenter = reflect(-V,N);
	if(vCenter.y<0.) vCenter.y *= -1.;
	
	//This was quickly fixed to work for the current scenario (sampleDir = vec3(0,1,0))
	/*vec3 sampleDirTest    = PBR_importanceSampling(vCenter, roughness, 0.0, 0.0, angularRange);
	
	
	vec3 contribTest = PBR_Equation(normalize(V),
	                                normalize(sampleDirTest),
									normalize(N),
									roughness, ior_n, ior_k, metallic, true);
	
	return PBR_HDRCubemap(pos, sampleDirTest, 1.)*contribTest;*/
	
    const float MIPMAP_SWITCH  = 0.29; //sampling angle delta (rad) equivalent to the lowest LOD.
    const ivec2 SAMPLE_COUNT = ivec2(5,15); //(5 random, 15 fixed) samples
    const vec2 weight = vec2(1./float(SAMPLE_COUNT.x),1./float(SAMPLE_COUNT.y));
    
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
        vec3 sampleColor  = PBR_HDRCubemap(pos, sampleDir, angularRange/MIPMAP_SWITCH);
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
        vec3 sampleColor  = PBR_HDRCubemap(pos, sampleDir, angularRange/MIPMAP_SWITCH);
        vec3 contribution = PBR_Equation(V, sampleDir, N, roughness, ior_n, ior_k, metallic, true)*weight[1];
        totalFixed += contribution*sampleColor;
		++fIdx;
    }
    
    return (totalRandom*weight[1]+totalFixed*weight[0])/(weight[0]+weight[1]);
}