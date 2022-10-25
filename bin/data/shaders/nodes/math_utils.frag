vec3 rotate(vec3 p, const float r)
{
    p.xy = vec2( p.x*cos(r)+p.y*sin(r),
                 p.y*cos(r)-p.x*sin(r));
    return p;
}