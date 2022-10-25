#version 150

out vec4 outputColor;
uniform vec2 iResolution;
/*
 Checkerboard_150
 Date Modified : 2019-05-29
 Date Tested : 2019-05-29
 UsageExample:
 {
    declareShader("checkerboard", new RenderPass(1024, 768, "shaders/checkerboard_150", GL_RGBA8));
 }
*/

float checkerboard(vec2 p)
{
    const float eps = 0.01;
    float c = smoothstep(0.25-eps,0.25+eps,abs(fract(p.x)-0.5))*2.-1.;
    c *=     (smoothstep(0.25-eps,0.25+eps,abs(fract(p.y)-0.5)))*2.-1.;
    return max(c,0.);
}

void main()
{
    vec4 color;
	vec2 uv = gl_FragCoord.xy/iResolution;

	float freq = 10.;
	color.rgb = vec3(1)*checkerboard(freq*uv);
	color.a = 1;

	outputColor = color;
}



