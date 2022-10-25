#define HASHSCALE1 9.1031
float hash11(float p)
{
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.x + p3.y) * p3.z);
}

float rdm(float seed)
{
    return hash11(seed)-.5;
    return sin(seed*16.54);
}