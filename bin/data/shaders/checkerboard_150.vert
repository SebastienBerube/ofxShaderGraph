#version 150

in vec4 position;

void main(){
	gl_Position = position; //for this to work, need to draw using "ofRect(-1, -1, 2, 2);" on the C++ side.
}