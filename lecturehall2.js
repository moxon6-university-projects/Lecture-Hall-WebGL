var rotateX=0;
var fan_angle=0;
var fan_on=false;
var wallwidth=170;
var wallheight=45;
var walldepth=5;
var lightx=wallwidth/2;
var lighty=wallheight/2;
var lightz=wallwidth/2;
var doorwidth=wallheight*0.5;
var roofheight=1;
var deltaX=3;
var VSHADER_SOURCE=null;
var FSHADER_SOURCE=null;
var VSHADERTEX_SOURCE=null;
var FSHADERTEX_SOURCE=null;
var g_modelMatrix = new Matrix4();
var g_mvpMatrix = new Matrix4();
var chairx=6;
var chairz=4;
var lights=[false,false,true,false];
var ticker=0;
var vy=0;
var ay=0.98;
var speed=10;
var nth=0;
var look = [0,0,-1];
var eye  = [70,20,270];
var slideIndex=0;
var g_matrixStack = []; // Array for storing a matrix
var last_time = Date.now();
var time=1.0;
var dragging = false; // Dragging or not
var lastX = -1, lastY = -1; // Last position of the mouse
var mousedown=false;
var now = Date.now();
var last = Date.now();
var crazy = false;
var theta=0;
var phi=0;
var keyMap=[];


function loadShaderFile(gl,fileName,shader){
  var request = new XMLHttpRequest();
  request.onreadystatechange=function()
    {
      if (request.readyState==4 && request.status!=404)
      {
        onLoadShader(gl,request.responseText,shader);
      }
    };
  request.open('GET',fileName,false);
  request.send();
}
function onLoadShader(gl,filestring,type){
  if (type ==gl.VERTEX_SHADER)
  {
    VSHADER_SOURCE=filestring;
  }
  if (type == gl.FRAGMENT_SHADER)
  {
    FSHADER_SOURCE=filestring;
  }
  if (FSHADER_SOURCE&&VSHADER_SOURCE)
  {
      solidProgram = makeShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE);
  }
}
function makeShaders(gl,vs,fs){
  shader= createProgram(gl, vs, fs);
  if (!shader) 
  {
    console.log('Failed to intialize shaders.');
    return;
  }
  return shader;
}
function main() {
  canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas,false);
  
  loadShaderFile(gl,'vshader.gl',gl.VERTEX_SHADER);
  loadShaderFile(gl,'fshader.gl',gl.FRAGMENT_SHADER);
  gl.useProgram(solidProgram);
  

  circle = makeShape(gl,10,1);
  triangle = makeShape(gl,3,30);
  cube = makeCube(gl);
  pentagon = makeShape(gl,5,18);
  hexagon = makeShape(gl,6,60);
  heptagon = makeShape(gl,7,60);
  octagon= makeShape(gl,8,60);
  shapes = [circle,null,null,triangle,cube,pentagon,hexagon,heptagon,octagon];


  gl.clearColor(0.28, 0.58, 0.82, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);
  
  solidProgram.u_MvpMatrix = gl.getUniformLocation(solidProgram, 'u_MvpMatrix'); //Uniform mapping matrix for each vertex
  solidProgram.u_NormalMatrix = gl.getUniformLocation(solidProgram, 'u_NormalMatrix'); //Uniform normal matrix for each object
  solidProgram.u_ModelMatrix = gl.getUniformLocation(solidProgram, 'u_ModelMatrix'); //Uniform mapping matrix for each vertex
  solidProgram.a_Color = gl.getAttribLocation(solidProgram,'a_Color'); //Color Attribute variable for each vertex
  solidProgram.a_Normal = gl.getAttribLocation(solidProgram, 'a_Normal'); //Position Attribute variable for each vertex
  solidProgram.a_Position = gl.getAttribLocation(solidProgram, 'a_Position'); //Position Attribute variable for each vertex
  solidProgram.u_LightColor1 = gl.getUniformLocation(solidProgram, 'u_LightColor1'); //Colour of point light
  solidProgram.u_LightColor2 = gl.getUniformLocation(solidProgram, 'u_LightColor2'); //Colour of point light
  solidProgram.u_LightColor3 = gl.getUniformLocation(solidProgram, 'u_LightColor3'); //Colour of point light
  solidProgram.u_LightColor4 = gl.getUniformLocation(solidProgram, 'u_LightColor4'); //Colour of point light
  solidProgram.u_AmbientLight = gl.getUniformLocation(solidProgram, 'u_AmbientLight'); //Amount of ambient light
  solidProgram.u_LightPosition1 = gl.getUniformLocation(solidProgram, 'u_LightPosition1'); //Position of point light
  solidProgram.u_LightPosition2 = gl.getUniformLocation(solidProgram, 'u_LightPosition2'); //Position of point light
  solidProgram.u_LightPosition3 = gl.getUniformLocation(solidProgram, 'u_LightPosition3'); //Position of point light
  solidProgram.u_LightPosition4 = gl.getUniformLocation(solidProgram, 'u_LightPosition4'); //Position of point light
  solidProgram.u_LightOn1 = gl.getUniformLocation(solidProgram, 'u_LightOn1'); //Position of point light
  solidProgram.u_LightOn2 = gl.getUniformLocation(solidProgram, 'u_LightOn2'); //Position of point light
  solidProgram.u_LightOn3 = gl.getUniformLocation(solidProgram, 'u_LightOn3'); //Position of point light
  solidProgram.u_LightOn4 = gl.getUniformLocation(solidProgram, 'u_LightOn4'); //Position of point light
  solidProgram.u_isTexture = gl.getUniformLocation(solidProgram, 'u_isTexture'); //Position of point light
  solidProgram.a_TexCoord = gl.getAttribLocation(solidProgram, 'a_TexCoord');

  gl.uniform1i(solidProgram.u_isTexture, false);
  gl.uniform1i(solidProgram.u_LightOn1, lights[0]);
  gl.uniform1i(solidProgram.u_LightOn2, lights[1]);
  gl.uniform1i(solidProgram.u_LightOn3, lights[2]);
  gl.uniform1i(solidProgram.u_LightOn4, lights[3]);
  gl.uniform3f(solidProgram.u_LightPosition1, walldepth+wallwidth*0.25,lighty,30+wallwidth*0.25);// Set the light direction (in the world coordinate)      
  gl.uniform3f(solidProgram.u_LightPosition2, walldepth+wallwidth*0.25,lighty,30+wallwidth*0.75);// Set the light direction (in the world coordinate)      
  gl.uniform3f(solidProgram.u_LightPosition3, walldepth+wallwidth*0.75,lighty,30+wallwidth*0.25);// Set the light direction (in the world coordinate)      
  gl.uniform3f(solidProgram.u_LightPosition4, walldepth+wallwidth*0.75,lighty,30+wallwidth*0.75);// Set the light direction (in the world coordinate)      
  gl.uniform3f(solidProgram.u_LightColor1,0.6,0.6,0.6);
  gl.uniform3f(solidProgram.u_LightColor2,0.6,0.6,0.6);
  gl.uniform3f(solidProgram.u_LightColor3,0.6,0.6,0.6);
  gl.uniform3f(solidProgram.u_LightColor4,0.6,0.6,0.6);
  gl.uniform3f(solidProgram.u_AmbientLight , 0.3,0.3,0.3);// Set the ambient light
  
  texCubes=[];
  for (var i=1;i<=34;i++)
  {
    var y = createTexCube(gl,'textures//lectureslides//lectureslide ('+i+').jpg',1,1);// Set the vertex information
    texCubes.push(y);
  }
  carpet = createTexCube(gl,'textures//tile.jpg',6,6);// Set the vertex information
  door = createTexCube(gl,'textures//door.png',1,1);// Set the vertex information
  wood = createTexCube(gl,'textures//wood.jpg',5,1);// Set the vertex information
  ceiling = createTexCube(gl,'textures//ceiling.jpg',1,1);// Set the vertex information
  llama = createTexCube(gl,'textures//llama.png',1,1);
  chair = createTexCube(gl,'textures//chair.jpg',1,1);
  grass = createTexCube(gl,'textures//grass.jpg',100,100);

  // Calculate the view projection matrix
  viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 250.0);
  viewProjMatrix.lookAt(eye[0],eye[1],eye[2], look[0], look[1], eye[2]+look[2], 0, 1.0, 0.0);
  viewProjMatrix.rotate(rotateX,0,1,0);

  // Register the event handler to be called on key press
  document.onkeydown = function(ev){ keyMap[ev.keyCode]=true; };
  document.onkeyup = function(ev){ keyMap[ev.keyCode]=false; };

  document.onmouseup  = function(ev){ mousedown=false; };
  document.onmousedown = function(ev){ mousedown=true; };
  document.onmousemove = function(ev){ movemouse(ev); };


  var tick = function() 
    {
      keydown(gl);
      look=[Math.sin(theta),Math.sin(phi),-Math.cos(theta)];
      roundArrays();
      var now = Date.now();
      deltaT = now-last_time;
      last_time=now;
      time+=deltaT/10000;
      light_time = Math.max(Math.cos(time),0);
      if (light_time===0)
      {
        time+=deltaT/10000;
      }
      gl.uniform3f(solidProgram.u_AmbientLight,0.2+0.4*light_time,0.2+0.4*light_time,0.2+0.4*light_time);
      gl.clearColor(0.28*light_time,0.58*light_time, 0.1+0.72*light_time, 1.0);
      if (fan_on)
      {
        fan_angle+=5*deltaT/100;
      }
      floorheight=20;
      if (eye[1]>20+wallheight)
      {
       if (eye[0]>0 && eye[0]<wallwidth)
        {
         if (eye[2]>0 && eye[2]<wallwidth) 
          floorheight=20+wallheight+1;
        }
      } 

      if (vy>0 || eye[1]>floorheight)
      {
        eye[1]+=vy;
        vy-=ay;
      }
      if (vy<0 && eye[1]<floorheight)
      {
        //console.log('reset');
        eye[1]=floorheight;
        vy=0; 
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      viewProjMatrix.setPerspective(50.0, canvas.width / canvas.height, 1.0, 1000.0);
      viewProjMatrix.lookAt(eye[0],eye[1],eye[2], eye[0]+look[0], eye[1]+look[1], eye[2]+look[2], 0, 1.0, 0.0);
      drawShapes(gl,solidProgram,viewProjMatrix);
      requestAnimationFrame(tick); // Request that the browser calls tick
      document.getElementById("eyepos").innerHTML= "Eye Position:"  +eye;
      document.getElementById("lookpos").innerHTML="Look Direction:"+look;
    };
  tick();
}
function movemouse(ev){
  if (mousedown)
  {
  var dx = ev.movementX ||ev.mozMovementX || ev.webkitMovementX || 0;
  var dy = ev.movementY ||ev.mozMovementY || ev.webkitMovementY || 0;
  theta+=dx/400;
  phi-=dy/400;
  look=[Math.sin(theta),Math.sin(phi),-Math.cos(theta)];
  roundArrays();
  }
}
function roundArrays(){
  eye[0] = Math.round(eye[0]*100)/100;
  eye[1] = Math.round(eye[1]*100)/100;
  eye[2] = Math.round(eye[2]*100)/100;
  look[0] = Math.round(look[0]*100)/100;
  look[1] = Math.round(look[1]*100)/100;
  look[2] = Math.round(look[2]*100)/100;
}
function doorMove(){
  rotateX+=deltaX*deltaT/20;
  if (rotateX>85)
  {
    rotateX=85;
    deltaX*=-1;
  }
  if (rotateX<0)
  {
    rotateX=0;
    deltaX*=-1;
  }
}
function keydown(gl) {
  for (var key in keyMap)
  {
    if (keyMap[key])
    {
      switch (parseInt(key)) 
      {
        case 16:
          speed*=1.05;
          break;
        case 17:
          speed/=1.05;
          break;
        case 72:
          doorMove();     
          break;
        case 74:
          fan_on=!fan_on;
          keyMap[key]=false;
          break;
        case 49://1
          lights[0]=!lights[0]; 
          //console.log('testing');
          gl.uniform1i(solidProgram.u_LightOn1, lights[0]);
          keyMap[key]=false;
          break;
        case 50://2
          lights[2]=!lights[2]; 
          gl.uniform1i(solidProgram.u_LightOn3, lights[2]);
          keyMap[key]=false;
          break;
        case 51://3
          lights[1]=!lights[1]; 
          gl.uniform1i(solidProgram.u_LightOn2, lights[1]);
          keyMap[key]=false;
          break;
        case 52://4
          lights[3]=!lights[3]; 
          gl.uniform1i(solidProgram.u_LightOn4, lights[3]);
          keyMap[key]=false;
          break;
        case 53://5
          crazy=!crazy;
          keyMap[key]=false;
          break;
        case 82:
          slideIndex-=1;
          if (slideIndex<0)
          {
          slideIndex+=34;
          }
          keyMap[key]=false;
          break;

        case 84:
          slideIndex+=1;
          if (slideIndex>33)
          {
          slideIndex-=34;
          }
          keyMap[key]=false;
          break;
        case 87: //w
          eye[0]+=speed*look[0]*deltaT/100;
          eye[2]+=speed*look[2]*deltaT/100;
          roundArrays();
          break;
        case 83: //s
          eye[0]-=speed*look[0]*deltaT/100;
          eye[2]-=speed*look[2]*deltaT/100;
          roundArrays();
    		  break;
    	  case 65: //a
          eye[0]+=speed*look[2]*deltaT/100;
          eye[2]-=speed*look[0]*deltaT/100;
          roundArrays();
        	break;
        case 68: //d
        	eye[0]-=speed*look[2]*deltaT/100;
          eye[2]+=speed*look[0]*deltaT/100;
          roundArrays();
        	break;
        case 32: //space
          if (vy===0){
            vy=5;
          }
          vy+=ay;
        	break;
        case 79: //o
          eye  = [70,20,270];
          look = [0,0,-1];
          break;
        case 80: //p
        	eye[1]-=1;
          break;
        case 37: //left
          theta-=0.1;
          break;
        case 38: //up
          if (phi<Math.PI/2)
          {
          phi+=0.1;
          }
          break;
        case 39: //right
          theta+=0.1;
          break;
        case 40: //down
          if (phi>-Math.PI/2)
          {
          phi-=0.1;
          }
          break;
        case 67: //c
          if(chairx>0)
          {
            chairx-=1;
          }
          keyMap[key]=false;
          break;
        case 86: //v
          if (chairx<6)
          {
            chairx+=1;
          }
          keyMap[key]=false;
          break;
        case 66:
          if(chairz>1)
          {
            chairz-=1;
          }
          keyMap[key]=false;
          break;
        case 78:
          if (chairz<7)
          {
            chairz+=1;
          }
          keyMap[key]=false;
          break;
        default:
          return; // Skip drawing at no effective action
      }
    }
  } 
}
function makeCube(gl){
  var cube=[];
  cube.isTexture=false;
  var vertices = new Float32Array(
    [
     1, 1, 1,  0,  1, 1,  0,  0, 1,  1,  0, 1,
     1, 1, 1,  1,  0, 1,  1,  0, 0,  1,  1, 0,
     1, 1, 1,  1,  1, 0,  0,  1, 0,  0,  1, 1,
     0, 1, 1,  0,  1, 0,  0 , 0, 0,  0,  0, 1,
     0, 0, 0,  1,  0, 0,  1,  0, 1,  0,  0, 1,
     1, 0, 0,  0,  0, 0,  0,  1, 0,  1,  1, 0 
    ]
    );
  var normals = new Float32Array( //These are scaled using the special inverse-transpose matrix later
    [
     0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ]
    );
  var indices = new Uint8Array( //Indices for vertices of cuboids, again uniform for all cuboids
    [
    0 ,1 ,2 , 0 ,2 ,3 ,    // front
    4 ,5 ,6 , 4 ,6 ,7 ,    // right
    8 ,9 ,10, 8 ,10,11,    // up
    12,13,14, 12,14,15,    // left
    16,17,18, 16,18,19,    // down
    20,21,22, 20,22,23     // back
    ]
    );
  
  cube.vertexBuffer = initArrayBufferForLaterUse(gl,vertices, 3, gl.FLOAT);
  cube.normalBuffer = initArrayBufferForLaterUse(gl, normals, 3, gl.FLOAT);
  cube.indexBuffer = initElementArrayBufferForLaterUse(gl,indices,gl.STATIC_DRAW);
  cube.num_vertices = indices.length;
  cube.drawtype = gl.TRIANGLES;
  return cube;
}
function makeShape(gl,n,dtheta){
  var shape=[];
  shape.isTexture=false;
  var bottom = [];
  var top = [];
  dtheta = Math.PI*(dtheta/180);
  s22=Math.sqrt(2);
  var angle = (Math.PI * 2.0/n);
  bottom.push(0.5,0.5,1);
  top.push(0.5,0.5,0);
  for (var i=0;i<n;i++)
  {
    var x = 0.5+Math.cos((i)*angle+dtheta)/s22;
    var y = 0.5+Math.sin((i)*angle+dtheta)/s22;
    bottom.push(x,y,1);
    top.push(x,y,0);
  }
  var vertices = [].concat(bottom,top);
  vertices = new Float32Array(vertices);
  shape.vertexBuffer = initArrayBufferForLaterUse(gl,vertices, 3, gl.FLOAT);
  var alpha = bottom.length/3;
  var indices = [];
  for (var i=1;i<=n;i++)
  {
    indices.push(0,i,i%n+1);
  }
  for (var i=n+1;i<=2*n;i++){
    indices.push(n+1,i+1,(n+1)+i%n+1);
  }
  for (var i=1;i<=n;i++)
  {
    indices.push(i,i%n+1,i%n+1+(n+1));
    indices.push(i,i+1+n,i%n+1+(n+1));
  }
  indices = new Uint8Array(indices);

  var normals = new Float32Array([].concat(bottom,bottom)); //Since normal vectors are simply the vector from centre axis

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  shape.num_vertices = indices.length;
  shape.drawtype = gl.TRIANGLES;
  shape.indexBuffer=indexBuffer;

  shape.normalBuffer = normalBuffer;
  shape.normalBuffer.num=3;
  shape.normalBuffer.type = gl.FLOAT;

  return shape;
}
function initArrayBufferForLaterUse(gl, data, num, type){
  var buffer = gl.createBuffer(); 
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  buffer.num = num;
  buffer.type = type;
  return buffer;
}
function drawShapes(gl, program ,viewProjMatrix){

  if (Math.cos(time)<0)
  {
  lights=[true,true,true,true];
  gl.uniform1i(solidProgram.u_LightOn1, true);
  gl.uniform1i(solidProgram.u_LightOn2, true);
  gl.uniform1i(solidProgram.u_LightOn3, true);
  gl.uniform1i(solidProgram.u_LightOn4, true);
  crazy=true;
  }
  else
  {
      crazy=false;
  }
  if (crazy)
  {
    var sin_now = Math.abs(Math.sin(time*15));
    var cos_now = Math.abs(Math.cos(time*15));
    gl.uniform3f(solidProgram.u_LightColor1,sin_now,cos_now,cos_now);
    gl.uniform3f(solidProgram.u_LightColor2,cos_now,sin_now,sin_now);
    gl.uniform3f(solidProgram.u_LightColor3,cos_now,sin_now,cos_now);
    gl.uniform3f(solidProgram.u_LightColor4,sin_now,cos_now,sin_now);
    chairSpin= time*1500;
    fan_angle+=5*deltaT/100;
    doorMove();
  }
  else
  {
    chairSpin= 0;
    gl.uniform3f(solidProgram.u_LightColor1,0.6,0.6,0.6);
    gl.uniform3f(solidProgram.u_LightColor2,0.6,0.6,0.6);
    gl.uniform3f(solidProgram.u_LightColor3,0.6,0.6,0.6);
    gl.uniform3f(solidProgram.u_LightColor4,0.6,0.6,0.6);
  }


    g_modelMatrix.setIdentity();
    gl.vertexAttrib3f(program.a_Color,0.0,0.5,0.0); 
    pushMatrix(g_modelMatrix);
      g_modelMatrix.translate(-500,-2,-500);
      g_modelMatrix.scale(1000,1,1000);
      drawShape(gl, program, grass, viewProjMatrix);
    g_modelMatrix=popMatrix();

    pushMatrix(g_modelMatrix);
        gl.vertexAttrib3f(program.a_Color,1.0,1.0,0.0); 
        g_modelMatrix.translate(500*Math.sin(time),250*Math.cos(time),0);
        g_modelMatrix.scale(20,20,1);
        drawShape(gl, program, circle, viewProjMatrix);
    g_modelMatrix=popMatrix();
    pushMatrix(g_modelMatrix);
        gl.vertexAttrib3f(program.a_Color,1.0,1.0,1.0); 
        g_modelMatrix.translate(-500*Math.sin(time),-250*Math.cos(time),0);
        g_modelMatrix.scale(20,20,1);
        drawShape(gl, program, circle, viewProjMatrix);
    g_modelMatrix=popMatrix();
  
    pushMatrix(g_modelMatrix);
      //Floor
      g_modelMatrix.scale(wallwidth,roofheight,wallwidth);
      gl.vertexAttrib3f(program.a_Color,1.0,0.0,0.0); 
      g_modelMatrix.translate(0.0, -roofheight, 0.0);
      drawShape(gl, program, carpet, viewProjMatrix);
      //Roof
      g_modelMatrix.translate(0.0, wallheight+roofheight, 0.0);
      drawShape(gl, program, ceiling, viewProjMatrix);
    g_modelMatrix = popMatrix(g_modelMatrix);  


    
    //Move to Origin, draw back wall
    pushMatrix(g_modelMatrix);
      gl.vertexAttrib3f(program.a_Color,0.5,0.5,0.5); 
      g_modelMatrix.translate(0.0, 0.0, -walldepth);
      g_modelMatrix.scale(wallwidth,wallheight,walldepth);
      drawShape(gl, program, wood, viewProjMatrix);
    g_modelMatrix = popMatrix();

    
    gl.vertexAttrib3f(program.a_Color,0.0,0.0,1.0);    
    g_modelMatrix.setTranslate(0, 0.0, wallwidth);
    g_modelMatrix.rotate(90, 0.0, 1.0, 0.0);
    pushMatrix(g_modelMatrix);
      g_modelMatrix.scale(wallwidth*0.35,wallheight,5);  
      drawShape(gl, program, wood, viewProjMatrix);
    g_modelMatrix = popMatrix();
      
    g_modelMatrix.translate(wallwidth*0.35+doorwidth, 0.0, 0.0);
    pushMatrix(g_modelMatrix);
      g_modelMatrix.scale(wallwidth*0.65-doorwidth,wallheight,5);  
      drawShape(gl, program, wood, viewProjMatrix);
    g_modelMatrix = popMatrix();
    
    
    pushMatrix(g_modelMatrix);
      g_modelMatrix.setTranslate(wallwidth, 0.0, 0.0);
      g_modelMatrix.rotate(270, 0.0, 1.0, 0.0);
      g_modelMatrix.scale(wallwidth,wallheight,walldepth);  
      drawShape(gl, program, wood, viewProjMatrix);
    popMatrix();
    
    gl.vertexAttrib3f(program.a_Color,1.0,1.0,1.0);    
    for (var i=0;i<5;i++)
    {
      pushMatrix(g_modelMatrix);
        g_modelMatrix.setTranslate(wallwidth-3, wallheight*0.25, wallwidth*(0.05+i*0.2));
        g_modelMatrix.rotate(270, 0.0, 1.0, 0.0);
        g_modelMatrix.scale(wallwidth/10,wallwidth*(0.1),3);  
        drawShape(gl, program, shapes[i+3], viewProjMatrix);
      popMatrix();
    }
    
    pushMatrix(g_modelMatrix);
    //Making a brown door
    g_modelMatrix.setTranslate(2.5, 0.0, wallwidth*0.65);
    g_modelMatrix.rotate(90.0-rotateX, 0.0, 1.0, 0.0);
    g_modelMatrix.scale(doorwidth,wallheight,1);  
    drawShape(gl, program, door, viewProjMatrix);
    g_modelMatrix = popMatrix();



    pushMatrix(g_modelMatrix);

    g_modelMatrix.setTranslate(x*16+25, 0.0, 64+z*16);

    g_modelMatrix=popMatrix();

    //Drawing the chairs and tables

    for (var z=0;z<chairz;z++)
    {
      for (var x=1;x<=chairx+1;x++)
      {
        if (x==4)
        {
          x+=1;
        }
        var d = 2*((x+z)%2)-1;

        gl.vertexAttrib3f(program.a_Color,0.45,0.52,1.0);
        g_modelMatrix.setTranslate(x*16+25, 0.0, 64+z*16);
        g_modelMatrix.rotate(d*chairSpin, 0.0, 1.0, 0.0);    
        pushMatrix(g_modelMatrix);  
          g_modelMatrix.translate(0,6,0);
          g_modelMatrix.scale(8,8, 2);
          drawShape(gl, program, chair, viewProjMatrix); //Chair back
        
        
        g_modelMatrix=popMatrix();
        g_modelMatrix.translate(0,6,-8);
        pushMatrix(g_modelMatrix);
          g_modelMatrix.scale(8,1.6,8);
          drawShape(gl, program, chair, viewProjMatrix); //Chair seat
        
        g_modelMatrix=popMatrix();
        g_modelMatrix.translate(0,-6,0);

        gl.vertexAttrib3f(program.a_Color,0.6,0.3,0.7);
        for (var lx=0;lx<=1;lx++)
        {
          for (var lz=0;lz<=1;lz++)
          {
          pushMatrix(g_modelMatrix);
          g_modelMatrix.translate(6*lx,0,8*lz);
            g_modelMatrix.scale(2,6,1.6);
            drawShape(gl, program, wood, viewProjMatrix);//Draw legs
          g_modelMatrix=popMatrix();
          }
        }
        
        //Minitable
        gl.vertexAttrib3f(program.a_Color,1,1,1);
        g_modelMatrix.translate(-5,9,0);
        g_modelMatrix.scale(16,1,6);
        drawShape(gl, program, cube, viewProjMatrix);
      }
    } 


    gl.vertexAttrib3f(program.a_Color,1,1,1); 
    
    g_modelMatrix.setIdentity();
    for (var x=0;x<=1;x++)
    {
      for (var z=0;z<=1;z++)
      {
      pushMatrix(g_modelMatrix);
      g_modelMatrix.translate(wallwidth*(0.25+0.5*x),wallheight-3,wallwidth*(0.25+0.5*z));
      g_modelMatrix.scale(3,3,30);
      drawShape(gl, program, cube, viewProjMatrix);
      g_modelMatrix=popMatrix();
      }
    }

    var length=30;
    gl.vertexAttrib3f(program.a_Color,1,1,1); 
    for (var i=0;i<4;i++)    
    {
      g_modelMatrix.setIdentity();
      g_modelMatrix.translate(6+wallwidth*(0.5),1.5+wallheight-3,3+wallwidth*(0.5)+length/2);
      g_modelMatrix.rotate(fan_angle+i*45,0,1,0);
      g_modelMatrix.translate(-1.5,0,-length/2);
      pushMatrix(g_modelMatrix);
      g_modelMatrix.scale(3,1.5,length);
      drawShape(gl, program, cube, viewProjMatrix);
      g_modelMatrix=popMatrix();
      g_modelMatrix.translate(0.25,-1.3,0);
      g_modelMatrix.scale(2.4,1.5,length); 
      drawShape(gl, program, triangle, viewProjMatrix);
    }
    gl.vertexAttrib3f(program.a_Color,1,1,1); 
    g_modelMatrix.setIdentity();
    g_modelMatrix.translate(3+wallwidth*(0.5),wallheight-3.4,wallwidth*(0.5)+22.5);
    g_modelMatrix.scale(7,3,6);
    g_modelMatrix.rotate(-90,1,0,0);
    gl.vertexAttrib3f(program.a_Color,1,0,1); 
    drawShape(gl, program, circle, viewProjMatrix);

    g_modelMatrix.setIdentity();
    g_modelMatrix.translate(wallwidth*0.075,wallheight*0.15,0);
  
    k=5;
    gl.vertexAttrib3f(program.a_Color,0.15,0.15,0.15); 
    for (var j=0;j<3;j++) // making blackboards
    {
      pushMatrix(g_modelMatrix);
      g_modelMatrix.scale(wallwidth/4,wallheight*0.55,1);
      drawShape(gl, program, texCubes[slideIndex], viewProjMatrix);
      g_modelMatrix = popMatrix();
      pushMatrix(g_modelMatrix);
      g_modelMatrix.translate(-k/2,-k/2,-0.5);
      g_modelMatrix.scale(k+wallwidth/4,k+wallheight*0.55,1);
      drawShape(gl, program, cube, viewProjMatrix);
      g_modelMatrix = popMatrix();
      g_modelMatrix.translate(wallwidth*0.3,0,0);
    }

    gl.vertexAttrib3f(program.a_Color,0.4,0.4,0.0); 
    
    g_modelMatrix.setIdentity();
    g_modelMatrix.translate(wallwidth*0.75,0,wallwidth*0.2);
    pushMatrix(g_modelMatrix);
      g_modelMatrix.scale(10,15,10);
      g_modelMatrix.rotate(180,0,1,0);
      g_modelMatrix.rotate(-90,1,0,0);
    drawShape(gl, program, pentagon, viewProjMatrix);
    g_modelMatrix=popMatrix();
    

      g_modelMatrix.translate(-2.5,15,5);
      
      pushMatrix(g_modelMatrix);
        g_modelMatrix.translate(-0.05,0.35,-0.45);
        g_modelMatrix.scale(5.8,4.5,4.5);
        g_modelMatrix.rotate(180,0,1,0);
        g_modelMatrix.rotate(-90,1,0,0);
        gl.vertexAttrib3f(program.a_Color,0.5,0.5,0.5); 
        drawShape(gl, program, texCubes[slideIndex], viewProjMatrix);
      g_modelMatrix = popMatrix();

        g_modelMatrix.translate(1.0,0.0,-0.4);
        g_modelMatrix.scale(8,5,5);
        g_modelMatrix.rotate(180,0,1,0);
        g_modelMatrix.rotate(-90,1,0,0);
        gl.vertexAttrib3f(program.a_Color,0.5,0.5,0.5); 
        drawShape(gl, program, cube, viewProjMatrix);

    g_modelMatrix.setTranslate(0,0,-250);
      g_modelMatrix.scale(170,110,1);
    drawShape(gl, program, llama, viewProjMatrix);
}
function pushMatrix(m){
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}
function popMatrix(){
  return g_matrixStack.pop();
}
function drawShape(gl, program, drawshape, viewProjMatrix){
  gl.uniform1i(program.u_isTexture, drawshape.isTexture);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, drawshape.indexBuffer);
  gl.uniformMatrix4fv(program.u_ModelMatrix, false, g_modelMatrix.elements);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, drawshape.normalBuffer);
  gl.vertexAttribPointer(program.a_Normal, drawshape.normalBuffer.num, drawshape.normalBuffer.type, false, 0, 0);
  gl.enableVertexAttribArray(program.a_Normal);   // Normal
  
  gl.bindBuffer(gl.ARRAY_BUFFER, drawshape.vertexBuffer);
  gl.vertexAttribPointer(program.a_Position, drawshape.vertexBuffer.num, drawshape.vertexBuffer.type, false, 0, 0);
  gl.enableVertexAttribArray(program.a_Position);
  
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);

  var g_normalMatrix = new Matrix4();  // Coordinate transformation matrix for normals
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, g_normalMatrix.elements);

  if (drawshape.isTexture)
  {
  var FSIZE = drawshape.texCoordBuffer.BYTES_PER_ELEMENT;
  gl.bindBuffer(gl.ARRAY_BUFFER, drawshape.texCoordBuffer);
  gl.vertexAttribPointer(program.a_TexCoord,2,gl.FLOAT, false,FSIZE*4,FSIZE*8 );
  gl.enableVertexAttribArray(program.a_TexCoord);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, drawshape.texture);
  }
  gl.drawElements(drawshape.drawtype, drawshape.num_vertices, gl.UNSIGNED_BYTE, 0);  
}
function initTextures(gl,imagepath) {
  var texture = gl.createTexture();   // Create a texture object
  var image = new Image();  
  image.onload = function() 
  {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    var ext = (
    gl.getExtension('EXT_texture_filter_anisotropic') ||
    gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );
    if (ext)
      {
      var max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      }
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  image.src = imagepath;
  return texture;
}
function initElementArrayBufferForLaterUse(gl, data, type){
  var buffer = gl.createBuffer();　  // Create a buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  buffer.type = type;
  return buffer;
}
function createTexCube(gl,imagepath,scaleX,scaleY) {
  var cube = makeCube(gl);
  cube.isTexture=true;
  var texCoords = [
       1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
       0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
       1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
       1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
       0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
       0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ];
    for (var i=0;i<texCoords.length;i++)
    {
      if (i%2===0)
      {
        texCoords[i]*=scaleX;
      }
      if (i%2===1)
      {
        texCoords[i]*=scaleY;
      }
    }
  texCoords = new Float32Array(texCoords);
  cube.texCoordBuffer = initArrayBufferForLaterUse(gl, texCoords, 2, gl.FLOAT);
  cube.texture = initTextures(gl,imagepath);// Set texture
  return cube;
}