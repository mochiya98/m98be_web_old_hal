var xste=function(n,s){return xste.t[n](s)};xste.t={};xste.add=
function(n,h){for(var x='var include=xste,x="";',m,c=0,
r=/<%(=?)([\s\S]*?)%>/g,f=function(q){c!==q&&(x+='x+="'+h.
slice(c,q).replace(/"/g,'\\"').replace(/\n/g,'\\n')+'";')};
m=r.exec(h);f(m.index),c=r.lastIndex,x+=(m[1]?'x+='+m[2]+
';':m[2]));f();xste.t[n]=new Function('self',x+'return x')};
