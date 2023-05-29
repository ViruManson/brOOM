import {getKey} from './Input.js';

const PI = Math.PI
const P2 = PI/2
const P3 = 3*PI/2
const DR = 0.0174533 //one degree in radians
const numberOfRays = 100; //Can be changed to increase "resolution on the walls"     //but actually should be 100 so that the textures arent messed up.
const FOV = 60; //kind of but not really

function fixAng(input) {
    if(input<   0) {input+=2*PI;}
    if(input>2*PI) {input-=2*PI;} 
    return input;
}

// Initializes the line things
let Columns = [];
let PointArrays = [];
for (let n = 0; n < numberOfRays; n++) {
    //creates columns
    Columns.push(document.createElement("div"));
    document.getElementById("container").appendChild(Columns[n]);
    Columns[n].style.width = 100/numberOfRays + "%";
    Columns[n].classList.add("column");
    Columns[n].id = ("Column"+n);

    let y;
    let Points = [];
    //creates points, puts then in array and changes style
    for (y=0;y<numberOfRays;y++) {
        Points.push(document.createElement("div"));
        document.getElementById("Column"+n).appendChild(Points[y]);
        Points[y].style.width = "100%";
        Points[y].style.height = 100/numberOfRays + "%";
        Points[y].style.backgroundColor = "rgb(0, 0, 0)";
        Points[y].classList.add("point");
    }
    PointArrays.push(Points) //puts in larger array
}

let px=128,py=128,pdx=0,pdy=0,pa=0; //player position, deltaX, deltaY and angle of player
function Movement() {
    //rotates in radians if A or D is pressed
    if (getKey("A")) {pa-=0.1; if(pa<   0) {pa+=2*PI;} pdx=Math.cos(pa)*5; pdy=Math.sin(pa)*5};
    if (getKey("D")) {pa+=0.1; if(pa>2*PI) {pa-=2*PI;} pdx=Math.cos(pa)*5; pdy=Math.sin(pa)*5};
    
    //Offset to point infront of and behind player
    let xo=0; if(pdx<0) { xo=(-20);} else{ xo=20;}
    let yo=0; if(pdy<0) { yo=(-20);} else{ yo=20;}

    //Gets the current square of the player (i think) and some offsets for collision
    //Math.floor is to immitate int variables.
    let ipx=Math.floor(px/64), ipx_add_xo=Math.floor((px+xo)/64), ipx_sub_xo=Math.floor((px-xo)/64);
    let ipy=Math.floor(py/64), ipy_add_yo=Math.floor((py+yo)/64), ipy_sub_yo=Math.floor((py-yo)/64);

    if (getKey("W"))
    {
        //checks if the grid in front is empty, if so move forward
        if(mapW[ipy*mapX        +  ipx_add_xo]==0) { px+=pdx;}
        if(mapW[ipy_add_yo*mapX +  ipx       ]==0) { py+=pdy;}
    }
    if (getKey("S"))
    {
        //checks if the grid behind is empty, if so move backwards
        if(mapW[ipy*mapX        +  ipx_sub_xo]==0) { px-=pdx;}
        if(mapW[ipy_sub_yo*mapX +  ipx       ]==0) { py-=pdy;}
    }
}

function Interactions() {
    //Offset to point infront of and behind player
    let Reach = 25;
    let xo=0; if(pdx<0) { xo=(-Reach);} else{ xo=Reach;}
    let yo=0; if(pdy<0) { yo=(-Reach);} else{ yo=Reach;}
    let ipx=Math.floor(px/64), ipx_add_xo=Math.floor((px+xo)/64);
    let ipy=Math.floor(py/64), ipy_add_yo=Math.floor((py+yo)/64);

    if (getKey("F")) {
        if(mapW[ipy_add_yo*mapX+ipx_add_xo]==4) { mapW[ipy_add_yo*mapX+ipx_add_xo]=0;}
    }
}


function dist(ax,ay,bx,by,ang) {
    return(Math.sqrt((bx-ax)*(bx-ax) + (by-ay)*(by-ay)));
}

function drawRays3D() {
    let Color;
    let r,mx,my,mp,dof;
    let rx,ry,ra,xo,yo,disT;
    ra=pa-DR*(FOV/2); if(ra<0) {ra+=2*PI;} if(ra>2*PI) {ra-=2*PI;}
    for(r=0;r<numberOfRays;r++) {
        let vmt=0,hmt=0; //vertical and horizontal map texture number

        // ----Check horizontal line----
        dof=0
        let disH=1000000,hx=px,hy=py;
        let aTan=-1/Math.tan(ra);
        if(ra>PI) {ry=(((py)>>6)<<6)-0.0001; rx=(py-ry) *aTan+px; yo=-64; xo=-yo*aTan;} //looking up
        if(ra<PI) {ry=(((py)>>6)<<6)+64;     rx=(py-ry) *aTan+px; yo=+64; xo=-yo*aTan;} //looking down
        if(ra==0 || ra==PI) {rx=px; ry=py; dof=8;} //looking straight left or right
        while (dof<8) {
            mx=(rx)>>6; my=(ry)>>6; mp=my*mapX+mx;
            if(mp>0 && mp<mapX*mapY && mapW[mp]>0) { hmt=mapW[mp]-1; hx=rx; hy=ry; disH=dist(px,py,hx,hy,ra); dof=8;} // hit wall
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
            if(mp>0 && mp<mapX*mapY && mapW[mp]>0) { vmt=mapW[mp]-1; vx=rx; vy=ry; disV=dist(px,py,vx,vy,ra); dof=8;} // hit wall
            else{rx+=xo; ry+=yo; dof+=1;} //next line
        }
        let Shade = 1;
        if(disV<disH) { hmt=vmt; rx=vx; ry=vy; disT=disV; Shade=0.5}
        if(disH<disV) {rx=hx; ry=hy; disT=disH;}

        // ----Draw walls----
        let ca=pa-ra; if(ca<0) {ca+=2*PI;} if(ca>2*PI) {ca-=2*PI;} disT=disT*Math.cos(ca); //fix fisheye
        let lineH=(mapS*100)/disT;
        let ty_step = 32/lineH;
        let ty_off = 0;
        if(lineH>100) {ty_off = (lineH-100)/2; lineH=100;} //line height
        //uppdates the Points
        for (let i = 0; i<numberOfRays; i++) {
            PointArrays[r][i].style.backgroundColor = "rgb(0, 0, 0)";
        }
        //adds texture to the walls, also fixes their dirrection and shading
        let ty = ty_off*ty_step+hmt*32;
        let tx;
        if(Shade==1) { tx=Math.floor(rx/2)%32; if(ra<PI) { tx=31-tx;}} //x walls
        else         { tx=Math.floor(ry/2)%32; if(ra>P2 && ra<P3) { tx=31-tx;}} // y walls
        //loops through the points that are located where the "column line height based on distance thing" would be
        for (let PointInColumnIndex = numberOfRays/2 - Math.floor(lineH/100*numberOfRays/2); PointInColumnIndex < numberOfRays/2 + Math.floor(lineH/100*numberOfRays/2); PointInColumnIndex++) {
            let c = 255/All_Textures[Math.floor(ty)*32 + Math.floor(tx)] * Shade; //changes colors of the current point to the right value form the texture map
            ////Color = `(${c}, ${c}, ${c})`
            if(hmt==0){ Color = `(${c}, ${c/2}, ${c/2})`;} //checkerboard red
            if(hmt==1){ Color = `(${c}, ${c}, ${c/2})`;} //Brick yellow
            if(hmt==2){ Color = `(${c/2}, ${c/2}, ${c})`;} //window blue
            if(hmt==3){ Color = `(${c/2}, ${c}, ${c/2})`;} //door green
            PointArrays[r][PointInColumnIndex].style.backgroundColor = "rgb"+Color; //changes the color of relevant points
            ty+=ty_step; //iterates the y value of texture map
        }
        
        // ----Draw floors----
        for(let PointInColumnIndex = numberOfRays/2 + Math.floor(lineH/100*numberOfRays/2); PointInColumnIndex < numberOfRays; PointInColumnIndex++) {
            let dy=PointInColumnIndex-(100/2), deg=ra, raFix = Math.cos(fixAng(pa-ra));
            tx=px/2 + Math.cos(deg)*48.375*32/dy/raFix;
            ty=py/2 + Math.sin(deg)*48.375*32/dy/raFix;
            let mp=mapF[Math.floor(ty/32)*mapX+Math.floor(tx/32)]*32*32
            let c = 255/All_Textures[(Math.floor(ty)&31)*32 + (Math.floor(tx)&31)+mp] * 0.7; //changes colors of the current point to the right value form the texture map
            Color = `(${c/1.3}, ${c/1.3}, ${c})`;
            PointArrays[r][PointInColumnIndex].style.backgroundColor = "rgb"+Color; //changes the color of relevant points
        }

        //----Draw ceiling----
        for(let PointInColumnIndex = 0; PointInColumnIndex < numberOfRays/2 - Math.floor(lineH/100*numberOfRays/2); PointInColumnIndex++) {
            let dy=PointInColumnIndex-(100/2), deg=ra, raFix = Math.cos(fixAng(pa-ra));
            tx=px/2 - Math.cos(deg)*48.375*32/dy/raFix;
            ty=py/2 - Math.sin(deg)*48.375*32/dy/raFix;
            let mp=mapC[Math.floor(ty/32)*mapX+Math.floor(tx/32)]*32*32
            let c = 255/All_Textures[(Math.floor(ty)&31)*32 + (Math.floor(tx)&31)+mp] * 0.7; //changes colors of the current point to the right value form the texture map
            Color = `(${c/2}, ${c/1.2}, ${c/2})`;
            PointArrays[r][PointInColumnIndex].style.backgroundColor = "rgb"+Color; //changes the color of relevant points
        }

        ra+=DR/(numberOfRays/FOV); if(ra<0) {ra+=2*PI;} if(ra>2*PI) {ra-=2*PI;}
    }
}


let mapX=8,mapY=8,mapS=64;
let mapW = [ //map of the walls
    2,2,2,2,2,4,2,2, 
    2,0,0,0,3,0,0,2, 
    2,0,0,0,0,1,0,4, 
    4,0,0,0,0,1,0,2, 
    2,0,4,2,0,0,0,2, 
    2,0,0,0,0,3,0,2, 
    2,0,0,0,3,0,0,2, 
    2,2,2,2,2,2,2,2,
];

let mapF = [ //map of floor
    0,0,0,0,0,0,0,0, 
    0,2,2,2,2,2,2,0, 
    0,2,2,2,2,2,2,0, 
    0,2,2,2,2,2,2,0, 
    0,2,2,2,0,0,0,0, 
    0,2,2,2,0,0,0,0, 
    0,2,2,2,0,0,0,0, 
    0,0,0,0,0,0,0,0,
]

let mapC = [ //map of ceiling
    0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0, 
    0,0,0,0,3,0,0,0, 
    0,0,0,0,3,0,0,0, 
    0,0,0,0,3,0,0,0, 
    0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,
]

let All_Textures = [ //all 32x32 textures
    //Checkerboard
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,

    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0,

    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1,

    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 
    1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0, 

    //Brick
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,

    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,

    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,

    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,

    //Window
    1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,    
        
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 

    1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,   
        
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,  
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 
    1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 

    //Door
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,    
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,    
    0,0,0,1,1,1,1,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,1,1,1,1,0,0,0,  
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,  
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,   
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,     

    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,  
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,    
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,    
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,   
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,  
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,  
    0,0,0,1,0,0,0,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,0,0,0,1,0,0,0,  
    0,0,0,1,1,1,1,1, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 1,1,1,1,1,0,0,0,  

    0,0,0,0,0,0,0,0, 0,0,0,0,0,1,0,1, 1,0,1,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,0,0,0,0,0,0,0, 0,0,1,1,1,1,0,1, 1,0,1,1,1,1,0,0, 0,0,0,0,0,0,0,0,   
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,    
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,    
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,   
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0, 
    
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,  
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,     
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,   
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,   
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,   
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,  
    0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,   
    0,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,1, 1,1,1,1,1,1,1,0,
]

//Updates every 1ms
let mainLoop = setInterval(() => {
    
    Movement();
    drawRays3D();
    Interactions();
    
}, 5);