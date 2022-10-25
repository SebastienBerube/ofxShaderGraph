//globals req :   vec4 iMouse
//                vec2 iResolution

struct Cam{ vec3 R, U, D, o;};
Cam lookAt(vec3 at, float fPitch, float dst, float rot){
	Cam cam;
    cam.D = vec3(cos(rot)*cos(fPitch),sin(fPitch),sin(rot)*cos(fPitch));
    cam.U = vec3(-sin(fPitch)*cos(rot),cos(fPitch),-sin(fPitch)*sin(rot));
    cam.R = cross(cam.D,cam.U);
    cam.o = at-cam.D*dst;
    return cam;
}
vec3 ray(vec2 uv){
    float rot = (iMouse.w<0.5)?0.:((iMouse.x/iResolution.x)-0.5)*7.0;
    float fPitch = (iMouse.w<0.5)?0.:((iMouse.y/iResolution.y)-0.5)*7.0;
    vec3 camD = vec3(sin(rot)*cos(fPitch),sin(fPitch),-cos(rot)*cos(fPitch));
    vec3 camU = vec3(-sin(fPitch)*sin(rot),cos(fPitch),sin(fPitch)*cos(rot));
    return normalize(uv.x*cross(camD,camU)+uv.y*camU+camD);
}