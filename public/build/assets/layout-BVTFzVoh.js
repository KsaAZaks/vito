import{R as m,j as d,q as p}from"./app-TbjAc4hW.js";import{L as u}from"./layout-BcEAMtX1.js";import{A as h}from"./app-logo-icon-fUKoKpES.js";import{c as l}from"./utils-BEGSiYh3.js";import{c as i}from"./createLucideIcon-C42a9sS1.js";import{U as y}from"./users-Vc1868nC.js";import{G as f}from"./globe-GAJdxb-F.js";import{K as x}from"./key-CzbRhbPD.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["line",{x1:"22",x2:"2",y1:"12",y2:"12",key:"1y58io"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}],["line",{x1:"6",x2:"6.01",y1:"16",y2:"16",key:"sgf278"}],["line",{x1:"10",x2:"10.01",y1:"16",y2:"16",key:"1l4acy"}]],v=i("HardDrive",g);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],_=i("LayoutDashboard",k);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M12 22v-5",key:"1ega77"}],["path",{d:"M9 8V2",key:"14iosj"}],["path",{d:"M15 8V2",key:"18g5xt"}],["path",{d:"M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z",key:"osxo6l"}]],b=i("Plug",N),w=m.forwardRef(({color:t="currentColor",strokeWidth:o=30,className:r,...e},s)=>d.jsx(h,{ref:s,color:t,className:l(r,"rounded-xs"),strokeWidth:o,...e})),L=[{title:"Dashboard",href:route("admin.dashboard"),icon:_,permission:"dashboard"},{title:"Users",href:route("users"),icon:y,permission:"users"},{title:"Servers",href:route("admin.servers"),icon:v,permission:"servers"},{title:"Sites",href:route("admin.sites"),icon:f,permission:"sites"},{title:"Credentials",href:route("admin.credentials"),icon:x,permission:"credentials"},{title:"Plugins",href:route("plugins"),icon:b,permission:"plugins"},{title:"Vito Settings",href:route("vito-settings"),icon:w,permission:"settings"}];function P({children:t,breadcrumbs:o}){var n;if(typeof window>"u")return null;const e=(n=p().props.auth)==null?void 0:n.user,s=L.filter(c=>{var a;return e!=null&&e.is_super_admin?!0:(a=e==null?void 0:e.admin_permissions)==null?void 0:a.includes(c.permission)});return d.jsx(u,{breadcrumbs:o,secondNavItems:s,secondNavTitle:"Admin",children:t})}export{P as A,v as H};
