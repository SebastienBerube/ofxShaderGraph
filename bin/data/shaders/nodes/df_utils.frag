float opSmoothSubtract( float d1, float d2 ){
    return length(vec2(max(d1,0.),min(d2,0.0)));
}

float udRoundBox( vec3 p, vec3 b, float r ){
  return length(max(abs(p)-(b-r),0.0))-r;
}