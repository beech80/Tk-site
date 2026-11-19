  window.Museum={state:function(){var r=roomAt(P.x,P.z);return {mode:mode,x:P.x,z:P.z,yaw:P.yaw,room:r.id,near:near&&near.label,ov:ovKind}},set:function(x,z,yaw){P.x=x;P.z=z;P.yaw=yaw;P.pitch=0}};
  boot();
