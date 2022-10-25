#version 150

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

vec4 image(vec2 uv){
	return texture2DRect(inputTex, inputRes*uv);
}

const mat3 mSobelX = mat3(-1,  0, 1, //[0][0], [0][1], [0][2]
                          -2,  0, 2, //[1][0], [1][1], [1][2]
                          -1,  0, 1);//...

vec2 imageGrad(vec2 uv, float pixSize){
	
	float dx = 0.;
	dx += mSobelX[0][0]*image(uv+vec2(float(0-1),float(0-1))*pixSize).x;
	dx += mSobelX[0][2]*image(uv+vec2(float(0-1),float(2-1))*pixSize).x;
	dx += mSobelX[1][0]*image(uv+vec2(float(0-1),float(1-1))*pixSize).x;
	dx += mSobelX[1][2]*image(uv+vec2(float(2-1),float(1-1))*pixSize).x;
	dx += mSobelX[2][0]*image(uv+vec2(float(0-1),float(2-1))*pixSize).x;
	dx += mSobelX[2][2]*image(uv+vec2(float(2-1),float(2-1))*pixSize).x;
	
	float dy = 0.;
	dy += mSobelX[0][0]*image(uv+vec2(float(0-1),float(0-1))*pixSize).x;
	dy += mSobelX[0][2]*image(uv+vec2(float(2-1),float(0-1))*pixSize).x;
	dy += mSobelX[1][0]*image(uv+vec2(float(1-1),float(0-1))*pixSize).x;
	dy += mSobelX[1][2]*image(uv+vec2(float(1-1),float(2-1))*pixSize).x;
	dy += mSobelX[2][0]*image(uv+vec2(float(2-1),float(0-1))*pixSize).x;
	dy += mSobelX[2][2]*image(uv+vec2(float(2-1),float(2-1))*pixSize).x;
	
	/*for(int i=0; i<3; ++i)
	{
		for(int j=0; j<3; ++j)
		{
			dx += mSobelX[i][j]*image(uv+vec2(float(i-1),float(j-1))*pixSize).x;
		}
	}*/
	
	return vec2(dx,dy);
}

void main(){
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord/iResolution.xy;
	
	float pixRange = 1.0;
	float pixSize = pixRange/inputRes.x;
	
	vec2 G = imageGrad(uv, pixSize)*pixSize*512.;
	
	outputColor = vec4(G,0,1);
}



































