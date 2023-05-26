import {getKey} from './Input.js';

const PI = Math.PI
const P2 = PI/2
const P3 = 3*PI/2
const DR = 0.0174533 //one degree in radians
const numberOfRays = 600; //Can be changed to increase "resolution on the walls"

// Initializes the line things
let Objects = [];
for (let n = 0; n < numberOfRays; n++) {
    Objects.push(document.createElement("div"));
    document.getElementById("container").appendChild(Objects[n]);
    Objects[n].style.width = 100/numberOfRays + "vw";

    Objects[n].classList.add("idfk");
}


let px=100,py=100,pdx=0,pdy=0,pa=0; //player position, deltaX, deltaY and angle of player

function Movement() {
    if (getKey("A")) {pa-=0.1; if(pa<   0) {pa+=2*PI;} pdx=Math.cos(pa)*5; pdy=Math.sin(pa)*5};
    if (getKey("D")) {pa+=0.1; if(pa>2*PI) {pa-=2*PI;} pdx=Math.cos(pa)*5; pdy=Math.sin(pa)*5};
    
    //Offset to point before player
    let xo=0; if(pdx<0) { xo=(-32);} else{ xo=32;}
    let yo=0; if(pdy<0) { yo=(-32);} else{ yo=32;}
    //Gets the current square of the player (i think)
    let ipx=Math.round(px/64), ipx_add_xo=Math.round((px+xo)/64), ipx_sub_xo=Math.round((px-xo)/64);
    let ipy=Math.round(py/64), ipy_add_yo=Math.round((py+yo)/64), ipy_sub_yo=Math.round((py-yo)/64);

    if (getKey("W"))
    {
        if(map[ipy*mapX        +  ipx_add_xo]==0) { px+=pdx;}
        if(map[ipy_add_yo*mapX +  ipx       ]==0) { py+=pdy;}
        //console.log(ipy*mapX  +  ipx_add_xo, px, py, ipx, ipx_add_xo, ipx_sub_xo, xo)
    }
    if (getKey("S"))
    {
        if(map[ipy*mapX        +  ipx_sub_xo]==0) { px-=pdx;}
        if(map[ipy_sub_yo*mapX +  ipx       ]==0) { py-=pdy;}
        //console.log(ipy*mapX  +  ipx_add_xo, px, py, ipx, ipx_add_xo, ipx_sub_xo, xo)
    }
    console.log("px",px/64,"py",py/64,)
}


function dist(ax,ay,bx,by,ang) {
    return(Math.sqrt((bx-ax)*(bx-ax) + (by-ay)*(by-ay)));
}

function drawRays3D() {
    let Color;
    let r,mx,my,mp,dof;
    let rx,ry,ra,xo,yo,disT;
    ra=pa-DR*30; if(ra<0) {ra+=2*PI;} if(ra>2*PI) {ra-=2*PI;}
    for(r=0;r<numberOfRays;r++) {
        // ----Check horizontal line----
        dof=0
        let disH=1000000,hx=px,hy=py;
        let aTan=-1/Math.tan(ra);
        if(ra>PI) {ry=(((py)>>6)<<6)-0.0001; rx=(py-ry) *aTan+px; yo=-64; xo=-yo*aTan;} //looking up
        if(ra<PI) {ry=(((py)>>6)<<6)+64;     rx=(py-ry) *aTan+px; yo=+64; xo=-yo*aTan;} //looking down
        if(ra==0 || ra==PI) {rx=px; ry=py; dof=8;} //looking straight left or right
        while (dof<8) {
            mx=(rx)>>6; my=(ry)>>6; mp=my*mapX+mx;
            if(mp>0 && mp<mapX*mapY && map[mp]==1) {hx=rx; hy=ry; disH=dist(px,py,hx,hy,ra); dof=8;} // hit wall
            else{rx+=xo; ry+=yo; dof+=1;} //next line
        }

        // ----Check vertical line----
        dof=0
        let disV=1000000,vx=px,vy=py;
        let nTan=-Math.tan(ra);
        if(ra>P2 && ra<P3) {rx=(((px)>>6)<<6)-0.0001; ry=(px-rx) *nTan+py; xo=-64; yo=-xo*nTan;} //looking left
        if(ra<P2 || ra>P3) {rx=(((px)>>6)<<6)+64;     ry=(px-rx) *nTan+py; xo=+64; yo=-xo*nTan;} //looking right
        if(ra==0 || ra==PI) {rx=px; ry=py; dof=8;} //looking straight up or down
        while (dof<8) {
            mx=(rx)>>6; my=(ry)>>6; mp=my*mapX+mx;
            if(mp>0 && mp<mapX*mapY && map[mp]==1) {vx=rx; vy=ry; disV=dist(px,py,vx,vy,ra); dof=8;} // hit wall
            else{rx+=xo; ry+=yo; dof+=1;} //next line
        }
        if(disV<disH) {rx=vx; ry=vy; disT=disV; Color="(229.5, 0, 0)"}
        if(disH<disV) {rx=hx; ry=hy; disT=disH; Color="(178.5, 0, 0)"}

        // ----Draw 3D walls----
        let ca=pa-ra; if(ca<0) {ca+=2*PI;} if(ca>2*PI) {ca-=2*PI;} disT=disT*Math.cos(ca); //fix fisheye
        let lineH=(mapS*100)/disT; if(lineH>100) {lineH=100;} //line height
        
        Objects[r].style.height = lineH + "vh";
        Objects[r].style.backgroundColor = "rgb"+Color;

        ra+=DR/(numberOfRays/60); if(ra<0) {ra+=2*PI;} if(ra>2*PI) {ra-=2*PI;}
    }
}


let mapX=8,mapY=8,mapS=64;
let map = [
    1, 1, 1, 1, 1, 1, 1, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 1, 1, 0, 0, 1, 
    1, 0, 0, 1, 1, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 0, 0, 0, 0, 0, 0, 1, 
    1, 1, 1, 1, 1, 1, 1, 1];


//Updates every 1ms
mainLoop = setInterval(() => {
    
    Movement();
    drawRays3D();

}, 5);