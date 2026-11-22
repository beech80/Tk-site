  window.Museum={state:function(){var r=roomAt(P.x,P.z);return {mode:mode,x:P.x,z:P.z,yaw:P.yaw,room:r.id,near:near&&near.label,ov:ovKind}},set:function(x,z,yaw){P.x=x;P.z=z;P.yaw=yaw;P.pitch=0}};
  boot();
  window.Museum.ui=function(k,i){closeOv();({product:function(){openProduct(CH[i||0])},chapter:function(){openChapter(CH[i||0])},about:function(){openInfo("faq")},map:openMap,menu:openMenu,contact:openContact,list:openChapterList})[k]()};
