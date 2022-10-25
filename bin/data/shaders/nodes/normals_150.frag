#version 150

out vec4 outputColor;
uniform vec2 iResolution;

uniform sampler2DRect inputTex;
uniform vec2          inputRes;

/*
_nodes["normals"]->draw([&](ofShader& s) {
        ofTexture& tex = outputTex("other");
        s.setUniformTexture("inputTex", tex, 1);
        s.setUniform2f("inputRes", tex.getWidth(), tex.getHeight());
    });
*/
vec4 image(vec2 uv){
	return texture2DRect(inputTex, inputRes*uv);
}

const mat3 mSobelX = mat3(-1,  0, 1, //[0][0], [0][1], [0][2]
                          -2,  0, 2, //[1][0], [1][1], [1][2]
                          -1,  0, 1);//...

vec3 sobelImageNormal(vec2 uv, float pixSize, float zFactor){
	
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
	
	return normalize(vec3(dx,dy,pixSize*zFactor));
}

void main(){
	//vec2 fragCoord = vec2(gl_FragCoord.x, iResolution.y-gl_FragCoord.y);
	vec2 fragCoord = gl_FragCoord.xy;
	vec2 uv = fragCoord/iResolution.xy;
	
	float pixSize = 1./iResolution.x;
	
	//TODO : Improve normal computation with a sobel 5x5 Filter?
	//       For now, normal image resolution is uselessly high.
	vec3 N = normalize(sobelImageNormal(uv, pixSize*1., 110.));
	
	outputColor = vec4(vec3(N*.5+vec3(.5)),1);
}



































