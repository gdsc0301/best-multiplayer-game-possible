var E=Object.defineProperty;var k=(t,e,r)=>e in t?E(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var n=(t,e,r)=>(k(t,typeof e!="symbol"?e+"":e,r),r),_=(t,e,r)=>{if(!e.has(t))throw TypeError("Cannot "+r)};var m=(t,e,r)=>(_(t,e,"read from private field"),r?r.call(t):e.get(t)),I=(t,e,r)=>{if(e.has(t))throw TypeError("Cannot add the same private member more than once");e instanceof WeakSet?e.add(t):e.set(t,r)},P=(t,e,r,o)=>(_(t,e,"write to private field"),o?o.call(t,r):e.set(t,r),r);var L=(t,e,r)=>(_(t,e,"access private method"),r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const y of i.addedNodes)y.tagName==="LINK"&&y.rel==="modulepreload"&&o(y)}).observe(document,{childList:!0,subtree:!0});function r(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(s){if(s.ep)return;s.ep=!0;const i=r(s);fetch(s.href,i)}})();var c,g,R;class O{constructor(e){I(this,g);n(this,"username","");n(this,"currentRoomID","");n(this,"x",0);n(this,"y",0);n(this,"style","orange");n(this,"usernameStyle","white");n(this,"width",20);n(this,"height",20);n(this,"speed",10);n(this,"direction",0);I(this,c,{x:0,y:0});this.username=e}initInputEvents(){document.addEventListener("keydown",e=>{L(this,g,R).call(this,e.key,!0)}),document.addEventListener("keyup",e=>{L(this,g,R).call(this,e.key,!1)})}setRoomID(e){return this.currentRoomID===""?(this.currentRoomID=e,!0):!1}move(){this.x+=m(this,c).x*this.speed,this.y+=m(this,c).y*this.speed}setPosition(e,r){this.x=e,this.y=r}draw(e,r,o,s){const i=new Path2D,y={x:s.x-r/2,y:s.y-o/2},h={x:this.x-y.x,y:this.y-y.y};return e.strokeStyle=this.style,i.moveTo(h.x-this.width/2,h.y+this.height/2),i.lineTo(h.x,h.y-this.height/2),i.lineTo(h.x+this.width/2,h.y+this.height/2),i.closePath(),e.stroke(i),e.fillStyle=this.usernameStyle,e.fillText(this.username,h.x,h.y-this.height-12),i}setInputAxis(e,r){P(this,c,{x:e,y:r})}get currentRoomID(){return this.currentRoomID}}c=new WeakMap,g=new WeakSet,R=function(e,r){switch(e){case"ArrowUp":m(this,c).y=r?-1:0;break;case"ArrowDown":m(this,c).y=r?1:0;break;case"ArrowLeft":m(this,c).x=r?-1:0;break;case"ArrowRight":m(this,c).x=r?1:0;break}};class T{constructor(e,r=1e3,o=1e3){n(this,"ID");n(this,"width");n(this,"height");n(this,"players",{});n(this,"max_players_amount",2);n(this,"start_timestamp");this.start_timestamp=Date.now(),this.ID=e,this.width=r,this.height=o}get ID(){return this.ID}get start_timestamp(){return this.start_timestamp}get players_amount(){return Object.keys(this.players).length}get is_full(){return this.max_players_amount<=this.players_amount}get_free_room_position(){return{x:this.width/2,y:this.height/2}}add_player(e){if(!this.player_is_here(e.username)){const r=this.get_free_room_position();return e.setPosition(r.x,r.y),this.players[e.username]=e,!0}return!1}remove_player(e){this.player_is_here(e)&&delete this.players[e]}player_is_here(e){return Object.keys(this.players).indexOf(e)!==-1}get_player(e){return this.player_is_here(e)&&this.players[e]}}const w={ipAddress:void 0,get URL(){return this.ipAddress?`http://${this.ipAddress}`:!1}},S={"Content-Type":"text/plain"},v=document.getElementById("loginForm"),d=v.querySelector(".error"),x=document.querySelector(".welcomeMessage"),u=document.getElementById("app"),f=u.getContext("2d");let a,l,p;function j(){x.innerHTML="Insert the IP address and username to start",v.addEventListener("submit",t=>{t.preventDefault(),w.ipAddress=t.target.elements[0].value;const e=t.target.elements[1].value;Object.keys(t.target.elements).forEach(r=>{t.target.elements[r].setAttribute("disabled","")}),w.URL&&e?fetch(`${w.URL}/login?player_email=${encodeURIComponent(e)}`).then(r=>{r.json().then(o=>{(o==null?void 0:o.status)===200?(u.focus({preventScroll:!0}),d.classList.remove("active"),l=Object.assign(new T(o.data.ID),structuredClone(o.data)),a=Object.assign(new O(e),structuredClone(l.players[e])),A(),a.initInputEvents(),document.addEventListener("keydown",s=>{if(s.key==="Escape"){Object.keys(v.elements).forEach(i=>{v.elements[i].removeAttribute("disabled","")}),x.innerHTML="Insert the IP address and username to start",clearInterval(p);return}}),window.addEventListener("beforeunload",()=>{p&&(fetch(D("logout")),clearInterval(p))}),x.innerHTML="Welcome, "+e,p=setInterval(U,1e3/60)):(d.innerHTML="Login failed, try again later",d.classList.add("active"),clearInterval(p),console.error(o))})}):(d.innerHTML="Invalid IP address or Username",d.classList.add("active"))})}function D(t){return`${w.URL}/${t}?player_email=${a.username}&room_id=${a.currentRoomID}`}function b(){fetch(D("room")).then(t=>{t.json().then(e=>{(e==null?void 0:e.status)===200?(d.classList.remove("active"),l=Object.assign(l,e.data),A()):(d.classList.add("active"),d.innerHTML=e.error,clearInterval(p))})})}function A(){for(const t in l.players){const e=new O(t);l.players[t]=Object.assign(e,l.players[t])}}function M(){const t=new Request(D("player_update"),{method:"POST",headers:S,body:JSON.stringify({action:"player_update",params:a})});fetch(t)}function U(){b(),a.move(),M(),H()}function H(){f.clearRect(0,0,u.width,u.height),a.draw(f,u.width,u.height,a);for(const t in l.players)t!==a.username&&l.players[t].draw(f,u.width,u.height,a);f.strokeStyle="white",f.strokeRect(-a.x,-a.y,l.width,l.height)}j();
