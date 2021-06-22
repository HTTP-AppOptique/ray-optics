  var canvas;
  var ctx;
  var mouse; //Position de la souris
  var mouse_lastmousedown; //Position de la souris lors du dernier clic de la souris
  var objs = []; //objet
  var objCount = 0; //Nombre d'objets

  //Multiple select
  var selectGr = [] // {name:, elements:[{}, {}]}, {name:, elements:[{}, {}]}
  var currentSelectedGr = []; //[{}, {}]
  var isConstructing = false; //Créer un nouvel objet
  var isSelectingMultipleObject = false;
  var isMovingMultipleObject = false;

  //Rotation
  var isRotating = false;
  var isChoosingSeg = false;
  var isSettingRotationPoint = false;
  var rotationPoint = {x: Infinity, y: Infinity}; //The last rotation point that have been choosen
  var rotationPoint_ = {x: Infinity, y: Infinity}; //The rotation point that is display while choosing rotation point over the segment
  var mouseBeforeRotation = {x: Infinity, y: Infinity};
  var mouseAfterRotation = {x: Infinity, y: Infinity};
  var nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}}; //Le côté de l'objet le plus proche de la souris lors du placement du point de rotation
  
  //Text
  var text = "";

  //Arrows on rays
  var showArrows = false;

  //Parasitic rays
  var showParasiticRays = false;

  //Cauchy
  var isCauchyActive = false;
  const red_length = 0.8;
  const green_length = 0.6;
  const blue_length = 0.4;
  var A_cauchy_coefficient = 1;
  var B_cauchy_coefficient = 0;
  const environment_coefficient = 
  {"water":{A: 1.324, B: 0.00312}, 
  "flint glass":{A: 1.67, B: 0.00743},
  "crown glass":{A: 1.5220, B: 0.00459}, 
  "plexiglas":{A: 1.4890, B: 0.00467}, 
  "diamond":{A: 2.3837, B: 0.01112}, 
  "air":{A: 1, B: 0}}

  var constructionPoint; //Créer la position de départ de l'objet
  var draggingObj = -1; //Le numéro de l'objet glissé (-1 signifie pas de glissement, -3 signifie tout l'écran, -4 signifie l'observateur)
  var positioningObj = -1; //Entrez le numéro de l'objet dans les coordonnées (-1 signifie non, -4 signifie observateur)
  var draggingPart = {}; //Informations sur la pièce et la position de la souris déplacées
  var selectedObj = -1; //Numéro d'objet sélectionné (-1 signifie non sélectionné)
  var AddingObjType = ''; //Faites glisser l'espace vide pour ajouter le type de l'objet
  var waitingRays = []; //Lumière à traiter
  var waitingRayCount = 0; //Nombre de lumière à traiter
  var rayDensity_light = 0.1; //Densité lumineuse (mode dépendant de la lumière)
  var rayDensity_images = 1; //Densité lumineuse (mode lié à l'image)
  var extendLight = false; //L'image de l'observateur
  var showLight = true; //Montrer la lumière
  var gridSize = 20; //Taille de la grille
  const centimeterInPixel = gridSize * 2; //This way, one centimeter equal to a square on grid
  var origin = {x: 0, y: 0}; //Coordonnées d'origine de la grille
  var undoArr = []; //Données de récupération
  var undoIndex = 0; //Emplacement actuel restauré
  var undoLimit = 20; //Nombre maximum d'étapes de récupération
  var undoUBound = 0; //Limite supérieure des données de récupération actuelles
  var undoLBound = 0; //Limite inférieure des données de récupération actuelles
  var observer;
  var mode = 'light';
  var timerID = -1;
  var isDrawing = false;
  var hasExceededTime = false;
  var forceStop = false;
  var lastDrawTime = -1;
  var stateOutdated = false; //L'état a changé depuis le dernier dessin
  var minShotLength = 1e-6; //La distance la plus courte entre les deux effets de lumière (les effets de lumière inférieurs à cette distance seront ignorés)
  var minShotLength_squared = minShotLength * minShotLength;
  var snapToDirection_lockLimit_squared = 900; //Le carré de la distance de déplacement nécessaire pour verrouiller la direction de l'accrochage lors du déplacement d'un objet et de l'utilisation de la fonction d'accrochage à la direction
  var clickExtent_line = 10;
  var clickExtent_point = 10;
  var clickExtent_point_construct = 10;
  var tools_normal = ['laser', 'radiant', 'parallel', 'blackline', 'ruler', 'protractor', 'regular', 'text', ''];
  var tools_withList = ['mirror_', 'refractor_'];
  var tools_inList = ['mirror', 'arcmirror', 'idealmirror', 'lens', 'refractor', 'halfplane', 'circlelens'];
  var modes = ['light', 'extended_light', 'images', 'observer'];
  var xyBox_cancelContextMenu = false;
  var scale = 1;

  window.onload = function(e) {
    init_i18n();
    canvas = document.getElementById('canvas1');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');



    mouse = graphs.point(0, 0);

    if (typeof(Storage) !== "undefined" && localStorage.rayOpticsData) {
      document.getElementById('textarea1').value = localStorage.rayOpticsData;
    }
    if (typeof(Storage) !== "undefined" && localStorage.showArrows) {
      showArrows = JSON.parse(localStorage.getItem("showArrows"));
      if(showArrows) document.querySelector("input[id=showArrowOnRay]").checked = true;
      else document.querySelector("input[id=showArrowOnRay]").checked = false;
    }
    if (typeof(Storage) !== "undefined" && localStorage.showParasiticRays) {
      showParasiticRays = JSON.parse(localStorage.getItem("showParasiticRays"));
      if(showParasiticRays) document.querySelector("input[id=showParasiticRays]").checked = true;
      else document.querySelector("input[id=showParasiticRays]").checked = false;
    }


    if (document.getElementById('textarea1').value != '')
    {
      JSONInput();
      toolbtn_clicked('');
    }
    else
    {
      initParameters();
    }
    undoArr[0] = document.getElementById('textarea1').value;
    document.getElementById('undo').disabled = true;
    document.getElementById('redo').disabled = true;

    //Delete all the group for all objects
    for(o of objs) o.group = [];

    window.onmousedown = function(e)
    {
      selectObj(-1);
    };
    window.ontouchstart = function(e)
    {
      selectObj(-1);
    };


    canvas.onmousedown = function(e)
    {
      document.getElementById('objAttr_text').blur();
      document.body.focus();
      canvas_onmousedown(e);
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
      return false;
    };

    canvas.onmousemove = function(e)
    {
      canvas_onmousemove(e);
    };

    canvas.onmouseup = function(e)
    {
      canvas_onmouseup(e);
    };

    // IE9, Chrome, Safari, Opera
    canvas.addEventListener("mousewheel", canvas_onmousewheel, false);
    // Firefox
    canvas.addEventListener("DOMMouseScroll", canvas_onmousewheel, false);

    function canvas_onmousewheel(e) {
      // cross-browser wheel delta
      var e = window.event || e; // old IE support
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      var d = scale;
      if (delta < 0) {
        d = scale * 0.9;
      } else if (delta > 0) {
        d = scale / 0.9;
      }
      d = Math.max(25, Math.min(500, d * 100));
      setScaleWithCenter(d / 100, (e.pageX - e.target.offsetLeft) / scale, (e.pageY - e.target.offsetTop) / scale);
      window.toolBarViewModel.zoom.value(d);
      return false;
    }

    canvas.ontouchstart = function(e)
    {
      document.getElementById('objAttr_text').blur();
      document.body.focus();
      canvas_onmousedown(e);
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };

    canvas.ontouchmove = function(e)
    {
      canvas_onmousemove(e);
      e.preventDefault();
    };

    canvas.ontouchend = function(e)
    {
      canvas_onmouseup(e);
      e.preventDefault();
    };

    canvas.ontouchcancel = function(e)
    {
      canvas_onmouseup(e);
      undo();
      e.preventDefault();
    };

    canvas.ondblclick = function(e)
    {
      canvas_ondblclick(e);
    };


    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onmouseenter = function(e) {toolbtn_mouseentered(element, e);};
      document.getElementById('tool_' + element).onclick = function(e) {toolbtn_clicked(element, e);};
      cancelMousedownEvent('tool_' + element);
    });

    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onclick = function(e) {toolbtn_clicked(element, e);};
      document.getElementById('tool_' + element + 'list').onmouseleave = function(e) {toollist_mouseleft(element, e);};
      cancelMousedownEvent('tool_' + element);
    });

    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).onclick = function(e) {toollistbtn_clicked(element, e);};
      cancelMousedownEvent('tool_' + element);
    });


    document.getElementById('undo').onclick = undo;
    cancelMousedownEvent('undo');
    document.getElementById('redo').onclick = redo;
    cancelMousedownEvent('redo');
    document.getElementById('reset').onclick = function() {initParameters();createUndoPoint();};
    cancelMousedownEvent('reset');
    document.getElementById('accessJSON').onclick = accessJSON;
    cancelMousedownEvent('accessJSON');
    document.getElementById('save_canvas').onclick = function() {
      let can = $("#canvas1");
      let img = can[0].toDataURL("image/png");

      var link = document.createElement('a');
      link.href = img;
      link.download = 'Scene.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    cancelMousedownEvent('save_canvas');
    document.getElementById('save').onclick = function()
    {
      document.getElementById('saveBox').style.display = '';
      document.getElementById('save_name').select();
    };
    cancelMousedownEvent('save');
    document.getElementById('open').onclick = function()
    {
      document.getElementById('openfile').click();
    };
    cancelMousedownEvent('open');

    document.getElementById('openfile').onchange = function()
    {
      open(this.files[0]);
    };

    modes.forEach(function(element, index)
    {
    document.getElementById('mode_' + element).onclick = function() {
      modebtn_clicked(element);
      createUndoPoint();
    };
    cancelMousedownEvent('mode_' + element);
    });
    document.getElementById('zoom').oninput = function()
    {
      setScale(this.value / 100);
      draw();
    };
    document.getElementById('zoom_txt').onfocusout = function()
    {
      setScale(this.value / 100);
      draw();
    };
    document.getElementById('zoom_txt').onkeyup = function()
    {
      if (event.keyCode === 13) {
        setScale(this.value / 100);
        draw();
      }
    };
    document.getElementById('zoom').onmouseup = function()
    {
      setScale(this.value / 100); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      createUndoPoint();
    };
    document.getElementById('zoom').ontouchend = function()
    {
      setScale(this.value / 100); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      createUndoPoint();
    };
    cancelMousedownEvent('rayDensity');
    document.getElementById('rayDensity').oninput = function()
    {
      setRayDensity(Math.exp(this.value));
      draw();
    };
    document.getElementById('rayDensity_txt').onfocusout = function()
    {
      setRayDensity(Math.exp(this.value));
      draw();
    };
    document.getElementById('rayDensity_txt').onkeyup = function()
    {
      if (event.keyCode === 13) {
        setRayDensity(Math.exp(this.value));
        draw();
      }
    };
    document.getElementById('rayDensity').onmouseup = function()
    {
      setRayDensity(Math.exp(this.value)); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      draw();
      createUndoPoint();
    };
    document.getElementById('rayDensity').ontouchend = function()
    {
      setRayDensity(Math.exp(this.value)); //Pour le rendre disponible aux navigateurs qui ne prennent pas en charge oninput
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('rayDensity');
    cancelMousedownEvent('lockobjs_');
    cancelMousedownEvent('grid_');
    document.getElementById('showgrid_').onclick = function() {draw()};
    document.getElementById('showgrid').onclick = function() {draw()};
    cancelMousedownEvent('showgrid_');

    document.getElementById('forceStop').onclick = function()
    {
      if (timerID != -1)
      {
        forceStop = true;
      }
    };
    cancelMousedownEvent('forceStop');
    document.getElementById('objAttr_range').oninput = function()
    {
      setAttr(document.getElementById('objAttr_range').value * 1);
    };

    document.getElementById('objAttr_range').onmouseup = function()
    {
      createUndoPoint();
    };

    document.getElementById('objAttr_range').ontouchend = function()
    {
      setAttr(document.getElementById('objAttr_range').value * 1);
      createUndoPoint();
    };
    cancelMousedownEvent('objAttr_range');
    document.getElementById('objAttr_text').onchange = function()
    {
      setAttr(document.getElementById('objAttr_text').value * 1);
    };
    cancelMousedownEvent('objAttr_text');
    document.getElementById('objAttr_text').onkeydown = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById('objAttr_text').onclick = function(e)
    {
      this.select();
    };
    document.getElementById('setAttrAll').onchange = function()
    {
      setAttr(document.getElementById('objAttr_text').value * 1);
      createUndoPoint();
    };
    cancelMousedownEvent('setAttrAll');
    cancelMousedownEvent('setAttrAll_');

    document.getElementById('copy').onclick = function()
    {
      objs[objs.length] = JSON.parse(JSON.stringify(objs[selectedObj]));
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('copy');
    document.getElementById('delete').onclick = function()
    {
      removeObj(selectedObj);
      draw();
      createUndoPoint();
    };
    cancelMousedownEvent('delete');
    document.getElementById('textarea1').onchange = function()
    {
      JSONInput();
      createUndoPoint();
    };
    document.getElementById('objSetPointRot_button').onclick = function() {
      if(!isMovingMultipleObject && objs[selectedObj].type == "refractor") isChoosingSeg = true;
      if(isMovingMultipleObject) isSettingRotationPoint = true;
    }
    cancelMousedownEvent('objSetPointRot_button');

    document.getElementById('showArrowOnRay').onchange = function() {
      if(showArrows) showArrows = false;
      else showArrows = true;
      localStorage.setItem("showArrows", showArrows)
      draw();
    }
    cancelMousedownEvent('showArrowOnRay');

    document.getElementById('showParasiticRays').onclick = function() {
      if(showParasiticRays) showParasiticRays = false;
      else showParasiticRays = true;
      localStorage.setItem("showParasiticRays", showParasiticRays)
      draw();
    };
    cancelMousedownEvent('showParasiticRays');
    
    document.getElementById('toggleGroupPanel_button').onclick = function() {
      createGroupPanel();
      $("#sideMultipleGroup").dialog({
          width: 400,
          maxHeight: 300,
          title: getMsg("group_management"),
          modal: true,
          close: function(e, ui) {
              $("#sideMultipleGroup").remove();
          }
      });
    }
    cancelMousedownEvent('toggleGroupPanel_button');

    document.getElementById('cauchy_button').onclick = function() {
      //Define onready script.js
      cauchyPanel();
    }
    cancelMousedownEvent('cauchy_button');

    document.getElementById('save_name').onkeydown = function(e)
    {
      if (e.keyCode == 13)
      {
        //enter
        document.getElementById('save_confirm').onclick();
      }
      if (e.keyCode == 27)
      {
        //esc
        document.getElementById('save_cancel').onclick();
      }

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById('save_cancel').onclick = function()
    {
      document.getElementById('saveBox').style.display = 'none';
    };
    document.getElementById('save_confirm').onclick = save;

    cancelMousedownEvent('saveBox');


    document.getElementById('xybox').onkeydown = function(e)
    {
      //(e.keyCode)
      if (e.keyCode == 13)
      {
        //enter
        confirmPositioning(e.ctrlKey, e.shiftKey);
      }
      if (e.keyCode == 27)
      {
        //esc
        endPositioning();
      }

      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };

    document.getElementById('xybox').oninput = function(e)
    {
      this.size = this.value.length;
    };

    document.getElementById('xybox').addEventListener('contextmenu', function(e) {
      if (xyBox_cancelContextMenu)
      {
         e.preventDefault();
         xyBox_cancelContextMenu = false;
      }
        }, false);

    cancelMousedownEvent('xybox');


    window.ondragenter = function(e)
    {
      e.stopPropagation();
      e.preventDefault();
    };

    window.ondragover = function(e)
    {
      e.stopPropagation();
      e.preventDefault();
    };

    window.ondrop = function(e)
    {
      e.stopPropagation();
      e.preventDefault();

      var dt = e.dataTransfer;
      if (dt.files[0])
      {
        var files = dt.files;
        open(files[0]);
      }
      else
      {
        var fileString = dt.getData('text');
        document.getElementById('textarea1').value = fileString;
        selectedObj = -1;
        JSONInput();
        createUndoPoint();
      }
    };

    canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        }, false);

    toolbtn_clicked('laser');
  };


  //==========================Dessiner des objets===============================

  function draw()
  {
    stateOutdated = true;
    document.getElementById('forceStop').style.display = 'none';
    if (timerID != -1)
    {
      //Si le programme traite le dernier dessin, arrêtez le traitement
      clearTimeout(timerID);
      timerID = -1;
      isDrawing = false;
    }

    if (!isDrawing)
    {
      isDrawing = true;
      draw_();
    }
  }


  function draw_() {
    if (!stateOutdated)
    {
      isDrawing = false;
      return;
    }
    stateOutdated = false;

    JSONOutput();
    canvasPainter.cls(); //Toile transparente
    ctx.globalAlpha = 1;
    hasExceededTime = false;
    waitingRays = []; //Vider la zone d'attente
    shotRayCount = 0;



    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (document.getElementById('showgrid').checked)
    {
      //Dessiner une grille
      //ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgb(64,64,64)';
      var dashstep = 4;
      ctx.beginPath();
      for (var x = origin.x / scale % gridSize; x <= canvas.width / scale; x += gridSize)
      {
        for (var y = 0; y <= canvas.height / scale; y += dashstep)
        {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + dashstep * 0.5);
        }
      }
      for (var y = origin.y / scale % gridSize; y <= canvas.height / scale; y += gridSize)
      {
        for (var x = 0; x <= canvas.width / scale; x += dashstep)
        {
          ctx.moveTo(x, y);
          ctx.lineTo(x + dashstep * 0.5, y);
        }
      }
      ctx.stroke();
    }
    ctx.restore();


    //Dessiner des objets
    for (var i = 0; i < objs.length; i++)
    {
      objTypes[objs[i].type].draw(objs[i], canvas); //Dessiner l'objet [i]
      if (objTypes[objs[i].type].shoot)
      {
        objTypes[objs[i].type].shoot(objs[i]); //Si objs [i] peut tirer de la lumière, laissez-la tirer
      }
    }
    shootWaitingRays();
    if (mode == 'observer')
    {
      //Dessinez un observateur instantané
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.arc(observer.c.x, observer.c.y, observer.r, 0, Math.PI * 2, false);
      ctx.fill();
    }
    lastDrawTime = new Date();
    //ctx.setTransform(1,0,0,1,0,0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //===============================Zone de traitement de la rotation ===================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  function choosingSeg(draggingPart_, i) {
    if(isMovingMultipleObject) return
    if (draggingPart_.part == 0) {
      //Here, the dragging part is a segment
      let clickedObject = objs[i];
      //Let's get the nearest segment from the mouse
      var pathFunction;
      //Get the affine function of each side of the polygon
      $.each(clickedObject.path, (index, value) => {
        let secondPt;
        //Because the polygon is closed, treat the last path with a destination back to 0
        //Get the affine function for all the line of the polygon
        if (index != clickedObject.path.length - 1) {
          pathFunction = graphs.affineFunctionOfTwoPoints(value.x, clickedObject.path[(index + 1)].x, value.y, clickedObject.path[(index + 1)].y);
          secondPt = index + 1;
        } else {
          pathFunction = graphs.affineFunctionOfTwoPoints(value.x, clickedObject.path[0].x, value.y, clickedObject.path[0].y);
          secondPt = 0;
        }
        //The nearest segment is the closest distance between where the mouse should be according to the function and the real position of the mouse
        let supposedY = pathFunction.m * mouse.x + pathFunction.p;
        let diff = Math.abs(mouse.y - supposedY);
        if (diff < nearestSeg.diff) {
          nearestSeg.diff = diff;
          nearestSeg.path.from = index;
          nearestSeg.path.to = secondPt;
          nearestSeg.affine.m = pathFunction.m;
          nearestSeg.affine.p = pathFunction.p;
        }
      });
    }
    //Here we want to prevent the user to choose another segment while he will choose the right location of the point
    isChoosingSeg = false;
  }

  function choosingRotationPoint() {
    //Theses functions are used to get the intersection of the choosen side and the perpedicular line passing by the mouse
    let sideFunction = nearestSeg.affine;
    let perpendicularToMouse = graphs.perpendicularOfLine(sideFunction.m, mouse.x, mouse.y);
    let intersection = graphs.intersection(sideFunction, perpendicularToMouse);
    rotationPoint_ = intersection;
    //These are the coordonates of the two bounds of the segments
    let fromPath = objs[selectedObj].path[nearestSeg.path.from]
    let toPath = objs[selectedObj].path[nearestSeg.path.to]

    //If the intersection is out of bounds, return
    let isIn = false;
    if((intersection.x > fromPath.x) && (intersection.x < toPath.x)) isIn = true;
    if((intersection.x < fromPath.x) && (intersection.x > toPath.x)) isIn = true;
    if(!isIn) return
    draw();
    ctx.fillRect(intersection.x-2, intersection.y-2, 3, 3);
    ctx.fillStyle = "red";
  }
  
  function doARotationOnASingleElement(angleRad) {
      drawRotationPoint()
      for(pt of objs[selectedObj].path) {
          //Do a rotation arround the rotation point
          let newCoord = graphs.rotateArround(pt, rotationPoint, angleRad);
          pt.x = newCoord.x;
          pt.y = newCoord.y;
      }
  }

  function doARotationOnCurrentSetOfGroup(angleRad) {
      drawRotationPoint()
      for(c of currentSelectedGr[0].elements) {
        for(o of objs) if(c == o) {
          switch(o.type) {
            case "refractor": {
              for(pt of o.path) {
                let newCoord = graphs.rotateArround(pt, rotationPoint, angleRad);
                pt.x = newCoord.x;
                pt.y = newCoord.y;
              }
              break
            };
            case "radiant": {
              let newCoord = graphs.rotateArround(o, rotationPoint, angleRad);
              o.x = newCoord.x;
              o.y = newCoord.y;
              break
            };
            default: {
              let newCoord = graphs.rotateArround(o.p1, rotationPoint, angleRad);
              o.p1.x = newCoord.x;
              o.p1.y = newCoord.y;
              newCoord = graphs.rotateArround(o.p2, rotationPoint, angleRad);
              o.p2.x = newCoord.x;
              o.p2.y = newCoord.y;
              if(o.p3) {
                newCoord = graphs.rotateArround(o.p3, rotationPoint, angleRad);
                o.p3.x = newCoord.x;
                o.p3.y = newCoord.y;
              }
              break;
            };
          }
        }
      }
  }

  function doARotation() {
    if(mouseBeforeRotation.x == Infinity) {mouseBeforeRotation = {x: mouse.x, y: mouse.y}; return;}
    mouseAfterRotation = {x: mouse.x, y: mouse.y};
    //Point A = Cursor before rotation - Point B = Rotation point - Point C = Cursor after rotation
    var distanceBefAft = Math.sqrt(Math.pow(mouseAfterRotation.x - mouseBeforeRotation.x, 2) + Math.pow(mouseAfterRotation.y - mouseBeforeRotation.y, 2));
    var distanceAftRot = Math.sqrt(Math.pow(mouseAfterRotation.x - rotationPoint.x, 2) + Math.pow(mouseAfterRotation.y - rotationPoint.y, 2));
    var distanceBefRot = Math.sqrt(Math.pow(rotationPoint.x - mouseBeforeRotation.x, 2) + Math.pow(rotationPoint.y - mouseBeforeRotation.y, 2));
    
    //Doing Al-Kashi theorem with the three distance above to find the angle ABC
    var angleRad = Math.acos((Math.pow(distanceBefAft, 2) - (Math.pow(distanceBefRot, 2) + Math.pow(distanceAftRot, 2))) / ((-2) * distanceAftRot * distanceBefRot));

    //Because angle are always positive, we want to go back if the mouse goes counterclockwise
    if(!isClockwise(mouseBeforeRotation, rotationPoint, mouseAfterRotation)) angleRad = -angleRad;
    
    mouseBeforeRotation = mouseAfterRotation;
    if(!isMovingMultipleObject) doARotationOnASingleElement(angleRad);
    if(isMovingMultipleObject) doARotationOnCurrentSetOfGroup(angleRad);
  }

  /**
   * Determine if a point is on left of another point, so if the mouse goes clockwise
   * @param {{x,y}} pt1 the point we want to know its relative location based on pt3
   * @param {{x,y}} pt2 the center point
   * @param {{x,y}} pt3 reference for pt1
   * @returns 
   */
  function isClockwise(pt1, pt2, pt3) {
    return ((pt2.x - pt1.x) * (pt3.y - pt1.y) - (pt2.y - pt1.y) * (pt3.x - pt1.x)) > 0;
  }

  function drawRotationPoint() {
    var rotationPTInterval = setInterval(function() {
      ctx.fillRect(rotationPoint.x-2, rotationPoint.y-2, 3, 3);
      ctx.fillStyle = "red";
      if(!isRotating) clearInterval(rotationPTInterval);
    }, 10)
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //========================================Zone de traitement de la lumière==================================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////

  //======================Mettez une lumière dans la zone d'attente=======================
  function addRay(ray) {
    waitingRays[waitingRays.length] = ray;
  }

  //====================Obtenez la densité lumineuse du mode actuel====================
  function getRayDensity()
  {
    if (mode == 'images' || mode == 'observer')
    {
      return rayDensity_images;
    }
    else
    {
      return rayDensity_light;
    }
  }


  //====================Lumière de la zone d'attente=========================
  function shootWaitingRays() {
    timerID = -1;
    var st_time = new Date();
    var alpha0 = 1;
    ctx.globalAlpha = alpha0;
    var ray1;
    var observed;
    var last_ray;
    var last_intersection;
    var s_obj;
    var s_obj_index;
    var last_s_obj_index;
    var s_point;
    var s_point_temp;
    var s_lensq;
    var s_lensq_temp;
    var observed_point;
    var observed_intersection;
    var rpd;
    var leftRayCount = waitingRays.length;
    var surfaceMerging_objs = [];

    while (leftRayCount != 0 && !forceStop)
    {
      if (new Date() - st_time > 200)
      {
        //S'il a été calculé pour dépasser 200ms
        //Reposez-vous pendant 10 ms avant de continuer (pour éviter que le programme ne réponde)
        document.getElementById('status').innerHTML = shotRayCount + ' rays (' + leftRayCount + ' waiting)'; //顯示狀態
        hasExceededTime = true;
        timerID = setTimeout(shootWaitingRays, 10); //10ms Revenez ici plus tard function
        document.getElementById('forceStop').style.display = '';
        return; //Hors de la function
      }

      leftRayCount = 0; //Recommencer le calcul du nombre de rayons restants
      last_s_obj_index = -1;
      last_ray = null;
      last_intersection = null;
      for (var j = 0; j < waitingRays.length; j++)
      {
        if (waitingRays[j] && waitingRays[j].exist)
        {
          //Si waitingRays[j] existe
          //Commencer la prise de vuewaitingRays[j](La dernière lumière dans la zone d'attente)
          //Déterminez quel objet cette lumière frappera en premier après son tir

          //↓Recherchez chaque "objet qui croise cette lumière", et trouvez "l'objet qui est l'intersection de l'objet et du rayon] et l'objet le plus proche de [la tête du rayon]"
          s_obj = null; //"Jusqu'à présent, parmi les objets vérifiés, [l'intersection avec le rayon] est la plus proche de [la tête du rayon]"
          s_obj_index = -1;
          s_point = null;  //L'intersection de s_obj et du rayon
          surfaceMerging_objs = []; //L'objet à interfacer avec l'objet tiré
          s_lensq = Infinity; //Réglez "Le carré de la distance entre [s_obj et l'intersection du rayon] et [la tête du rayon] à l'infini (car aucun objet n'a encore été vérifié, et maintenant je recherche la valeur minimale)
          observed = false; //waitingRays[j]Vu par les observateurs
          for (var i = 0; i < objs.length; i++)
          {
            //↓Siobjs[i]Affectera la lumière
            if (objTypes[objs[i].type].rayIntersection) {
              //↓Détermine si objs [i] croise cette lumière
              s_point_temp = objTypes[objs[i].type].rayIntersection(objs[i], waitingRays[j]);
              if (s_point_temp && !waitingRays[j].regular)
              {
                //Add the last intersection in order to draw arrow
                if(waitingRays[j].last_intersection) waitingRays[j].last_intersection.push(s_point_temp);
                //À ce stade, cela signifie que objs [i] est "l'objet qui croise cette lumière", et que le point d'intersection est s_point_temp
                s_lensq_temp = graphs.length_squared(waitingRays[j].p1, s_point_temp); //La distance entre l'intersection et [la tête du rayon]
                if (s_point && graphs.length_squared(s_point_temp, s_point) < minShotLength_squared && (objTypes[objs[i].type].supportSurfaceMerging || objTypes[s_obj.type].supportSurfaceMerging))
                {
                  //Cette lumière frappe deux objets en même temps, et au moins un prend en charge la fusion d'interface

                  if (objTypes[s_obj.type].supportSurfaceMerging)
                  {
                    if (objTypes[objs[i].type].supportSurfaceMerging)
                    {
                      //Les deux supportent la fusion d'interface (par exemple, deux réfracteurs sont connectés d'un côté)
                      surfaceMerging_objs[surfaceMerging_objs.length] = objs[i];
                    }
                    else
                    {
                      //Seule la première interface de prise de vue prend en charge la fusion d'interface
                      //Définissez l'objet à tirer sur un objet qui ne prend pas en charge la fusion d'interface (si la limite du réfracteur chevauche un écran anti-lumière, seule l'action de l'écran anti-lumière sera effectuée)
                      s_obj = objs[i];
                      s_obj_index = i;
                      s_point = s_point_temp;
                      s_lensq = s_lensq_temp;

                      surfaceMerging_objs = [];
                    }
                  }
                }
                else if (s_lensq_temp < s_lensq && s_lensq_temp > minShotLength_squared)
                {
                  //↑Si "la distance entre l'intersection de [objs [i] et le rayon] et [la tête du rayon]" est supérieure à "l'objet qui a été vérifié jusqu'à présent, [l'intersection avec le rayon] est la plus proche de [ la tête du rayon] "C'est encore court

                  s_obj = objs[i]; //Mise à jour "Jusqu'à présent, parmi les objets vérifiés, [l'intersection de l'objet et du rayon] est la plus proche de [la tête du rayon]"
                  s_obj_index = i;
                  s_point = s_point_temp; //s_point est également mis à jour
                  s_lensq = s_lensq_temp; //s_len est également mis à jour ensemble

                  surfaceMerging_objs = [];
                }
              }
            }
          }
          ctx.globalAlpha = alpha0 * waitingRays[j].brightness;
          if(showParasiticRays) {
            ctx.globalAlpha = 1;
          }
          //↓Si la lumière ne frappe aucun objet
          if (s_lensq == Infinity)
          {
            if (mode == 'light' || mode == 'extended_light')
            {
              let color;
              if(!waitingRays[j].cauchy_color) color = "rgb(255, 255, 128)";
              if(waitingRays[j].cauchy_color == "red") color = "red";
              if(waitingRays[j].cauchy_color == "green") color = "green";
              if(waitingRays[j].cauchy_color == "blue") color = "blue";
              if(waitingRays[j].cauchy_color && waitingRays[j].last_intersection.length == 0) color = "white";
              if(waitingRays[j].regular) color = 'rgb(128,236,255)';

              if(!isCauchyActive || (isCauchyActive && waitingRays[j].cauchy_color) || waitingRays[j].regular)
              canvasPainter.draw(waitingRays[j], color); //Dessine cette normale/lumière
            }
            if (mode == 'extended_light' && !waitingRays[j].isNew)
            {
              canvasPainter.draw(graphs.ray(waitingRays[j].p1, graphs.point(waitingRays[j].p1.x * 2 - waitingRays[j].p2.x, waitingRays[j].p1.y * 2 - waitingRays[j].p2.y)), 'rgb(255,128,0)'); //畫出這條光的延長線
            }

            if (mode == 'observer')
            {
              //Utiliser l'observateur instantané
              observed_point = graphs.intersection_line_circle(waitingRays[j], observer)[2];
              if (observed_point)
              {
                if (graphs.intersection_is_on_ray(observed_point, waitingRays[j]))
                {
                  observed = true;
                }
              }
            }
          }
          else
          {
            //A ce moment, la lumière représentative frappera s_obj (objet) à s_point (position) après avoir passé s_len (distance).
            if (mode == 'light' || mode == 'extended_light')
            {
              let color_temp;
              console.log(waitingRays[j])
              if(!waitingRays[j].cauchy_color) color_temp = "rgb(255, 255, 128)";
              if(waitingRays[j].cauchy_color == "red") color_temp = "red";
              if(waitingRays[j].cauchy_color == "green") color_temp = "green";
              if(waitingRays[j].cauchy_color == "blue") color_temp = "blue";
              if(waitingRays[j].cauchy_color && waitingRays[j].brightness == 1) color_temp = "white";
              if(!isCauchyActive || (isCauchyActive && waitingRays[j].cauchy_color) || waitingRays[j].regular)
              canvasPainter.draw(graphs.segment(waitingRays[j].p1, s_point), color_temp); //Dessine cette lumière
            }
            if (mode == 'extended_light' && !waitingRays[j].isNew)
            {
              canvasPainter.draw(graphs.ray(waitingRays[j].p1, graphs.point(waitingRays[j].p1.x * 2 - waitingRays[j].p2.x, waitingRays[j].p1.y * 2 - waitingRays[j].p2.y)), 'rgb(255,128,0)'); //Dessinez l'extension de cette lumière
              canvasPainter.draw(graphs.ray(s_point, graphs.point(s_point.x * 2 - waitingRays[j].p1.x, s_point.y * 2 - waitingRays[j].p1.y)), 'rgb(80,80,80)'); //Tracez cette longue ligne de lumière vers l'avant

            }

            if (mode == 'observer')
            {
              //Utiliser l'observateur instantané
              observed_point = graphs.intersection_line_circle(waitingRays[j], observer)[2];

              if (observed_point)
              {

                if (graphs.intersection_is_on_segment(observed_point, graphs.segment(waitingRays[j].p1, s_point)))
                {
                  observed = true;
                }
              }
            }


          }
          if (mode == 'observer' && last_ray)
          {
            //Mode: observateur instantané
            if (!waitingRays[j].gap)
            {
              observed_intersection = graphs.intersection_2line(waitingRays[j], last_ray); //L'intersection des rayons observés

              if (observed)
              {
                if (last_intersection && graphs.length_squared(last_intersection, observed_intersection) < 25)
                {
                  //Lorsque les intersections sont assez proches les unes des autres
                  if (graphs.intersection_is_on_ray(observed_intersection, graphs.ray(observed_point, waitingRays[j].p1)) && graphs.length_squared(observed_point, waitingRays[j].p1) > 1e-5)
                  {

                    ctx.globalAlpha = alpha0 * (waitingRays[j].brightness + last_ray.brightness) * 0.5;
                    if (s_point) 
                    rpd = (observed_intersection.x - waitingRays[j].p1.x) * (s_point.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (s_point.y - waitingRays[j].p1.y);
                    else 
                    rpd = (observed_intersection.x - waitingRays[j].p1.x) * (waitingRays[j].p2.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (waitingRays[j].p2.y - waitingRays[j].p1.y);
                    if (rpd < 0)
                    {
                      //Image virtuelle
                      canvasPainter.draw(observed_intersection, 'rgb(255,128,0)'); //Dessiner comme
                    }
                    else if (rpd < s_lensq)
                    {
                      //Image réelle
                      canvasPainter.draw(observed_intersection, 'rgb(255,255,128)'); //Dessiner comme
                    }
                    canvasPainter.draw(graphs.segment(observed_point, observed_intersection), 'rgb(0,0,255)'); //畫出連線
                  }
                  else
                  {
                    canvasPainter.draw(graphs.ray(observed_point, waitingRays[j].p1), 'rgb(0,0,255)'); //畫出觀察到的光線(射線)
                  }
                }
                else
                {
                  if (last_intersection)
                  {
                    canvasPainter.draw(graphs.ray(observed_point, waitingRays[j].p1), 'rgb(0,0,255)'); //畫出觀察到的光線(射線)
                  }
                }
              }
              last_intersection = observed_intersection;
            }
            else
            {
              last_intersection = null;
            }
          }

          if (mode == 'images' && last_ray)
          {
            //Mode: comme
            if (!waitingRays[j].gap)
            {

              observed_intersection = graphs.intersection_2line(waitingRays[j], last_ray);
              if (last_intersection && graphs.length_squared(last_intersection, observed_intersection) < 25)
              {
                ctx.globalAlpha = alpha0 * (waitingRays[j].brightness + last_ray.brightness) * 0.5;

                if (s_point)
                {
                  rpd = (observed_intersection.x - waitingRays[j].p1.x) * (s_point.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (s_point.y - waitingRays[j].p1.y);
                }
                else
                {
                  rpd = (observed_intersection.x - waitingRays[j].p1.x) * (waitingRays[j].p2.x - waitingRays[j].p1.x) + (observed_intersection.y - waitingRays[j].p1.y) * (waitingRays[j].p2.y - waitingRays[j].p1.y);
                }

                if (rpd < 0)
                {
                  //Image virtuelle
                  canvasPainter.draw(observed_intersection, 'rgb(255,128,0)'); //畫出像
                }
                else if (rpd < s_lensq)
                {
                  //Image réelle
                  canvasPainter.draw(observed_intersection, 'rgb(255,255,128)'); //畫出像
                }
                else
                {
                  //Imaginaire
                  canvasPainter.draw(observed_intersection, 'rgb(80,80,80)'); //畫出像
                }
              }
              last_intersection = observed_intersection;
            }

          }
          if (last_s_obj_index != s_obj_index)
          {
            waitingRays[j].gap = true;
          }
          waitingRays[j].isNew = false;

          last_ray = {p1: waitingRays[j].p1, p2: waitingRays[j].p2};
          last_s_obj_index = s_obj_index;
          if (s_obj)
          {
            objTypes[s_obj.type].shot(s_obj, waitingRays[j], j, s_point, surfaceMerging_objs);
          }
          else
          {
            waitingRays[j] = null;
          }

          shotRayCount = shotRayCount + 1; //Nombre de rayons traités +1
          if (waitingRays[j] && waitingRays[j].exist)
          {
            leftRayCount = leftRayCount + 1;
          }
          //Cette lumière est traitée
        }
      }

    }
    ctx.globalAlpha = 1.0;
      for (var i = 0; i < objs.length; i++)
        {
        objTypes[objs[i].type].draw(objs[i], canvas, true); //Dessiner objs[i]
        }
    if (mode == 'observer')
    {
      //Dessinez un observateur instantané
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.fillStyle = 'blue';
      ctx.arc(observer.c.x, observer.c.y, observer.r, 0, Math.PI * 2, false);
      ctx.fill();
    }
    if (forceStop)
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays (stopped)';
      forceStop = false;
    }
    else if (hasExceededTime)
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays';
    }
    else
    {
      document.getElementById('status').innerHTML = shotRayCount + ' rays (' + (new Date() - st_time) + 'ms)';
    }
    document.getElementById('forceStop').style.display = 'none';
    setTimeout(draw_, 10);
  }



  //////////////////////////////////////////////////////////////////////////////////////////////////////
  //==========================================Zone d'action de la souris================================================
  //////////////////////////////////////////////////////////////////////////////////////////////////////


  function mouseOnPoint(mouse, point)
  {
    return graphs.length_squared(mouse, point) < clickExtent_point * clickExtent_point;
  }

  function mouseOnPoint_construct(mouse, point)
  {
    return graphs.length_squared(mouse, point) < clickExtent_point_construct * clickExtent_point_construct;
  }

  function mouseOnSegment(mouse, segment)
  {
    var d_per = Math.pow((mouse.x - segment.p1.x) * (segment.p1.y - segment.p2.y) + (mouse.y - segment.p1.y) * (segment.p2.x - segment.p1.x), 2) / ((segment.p1.y - segment.p2.y) * (segment.p1.y - segment.p2.y) + (segment.p2.x - segment.p1.x) * (segment.p2.x - segment.p1.x)); //Similaire à la distance verticale entre une souris et une ligne droite
    var d_par = (segment.p2.x - segment.p1.x) * (mouse.x - segment.p1.x) + (segment.p2.y - segment.p1.y) * (mouse.y - segment.p1.y); //Similaire à la position de projection de la souris sur une ligne droite
    return d_per < clickExtent_line * clickExtent_line && d_par >= 0 && d_par <= graphs.length_segment_squared(segment);
  }

  function mouseOnLine(mouse, line)
  {
    var d_per = Math.pow((mouse.x - line.p1.x) * (line.p1.y - line.p2.y) + (mouse.y - line.p1.y) * (line.p2.x - line.p1.x), 2) / ((line.p1.y - line.p2.y) * (line.p1.y - line.p2.y) + (line.p2.x - line.p1.x) * (line.p2.x - line.p1.x)); //Similaire à la distance verticale entre une souris et une ligne droite
    return d_per < clickExtent_line * clickExtent_line;
  }

  //Accrochez la position de la souris à la position la plus proche dans la direction spécifiée (le point de projection sur la ligne droite dans cette direction)
  function snapToDirection(mouse, basePoint, directions, snapData)
  {
    var x = mouse.x - basePoint.x;
    var y = mouse.y - basePoint.y;

    if (snapData && snapData.locked)
    {
      //L'objet d'accrochage a été verrouillé
      var k = (directions[snapData.i0].x * x + directions[snapData.i0].y * y) / (directions[snapData.i0].x * directions[snapData.i0].x + directions[snapData.i0].y * directions[snapData.i0].y);
      return graphs.point(basePoint.x + k * directions[snapData.i0].x, basePoint.y + k * directions[snapData.i0].y);
    }
    else
    {
      var i0;
      var d_sq;
      var d0_sq = Infinity;
      for (var i = 0; i < directions.length; i++)
      {
        d_sq = (directions[i].y * x - directions[i].x * y) * (directions[i].y * x - directions[i].x * y) / (directions[i].x * directions[i].x + directions[i].y * directions[i].y);
        if (d_sq < d0_sq)
        {
          d0_sq = d_sq;
          i0 = i;
        }
      }

      if (snapData && x * x + y * y > snapToDirection_lockLimit_squared)
      {
        //Verrouiller l'objet d'accrochage
        snapData.locked = true;
        snapData.i0 = i0;
      }

      var k = (directions[i0].x * x + directions[i0].y * y) / (directions[i0].x * directions[i0].x + directions[i0].y * directions[i0].y);
      return graphs.point(basePoint.x + k * directions[i0].x, basePoint.y + k * directions[i0].y);
    }
  }

  


  window.onresize = function(e) {
  if (ctx)
  {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }
  };

  function selectObj(index)
  {
    unhighlightAllObj();

    if(currentSelectedGr[0] != undefined && objs[index]) {
      if(isMovingMultipleObject && objs[index].group.includes(currentSelectedGr[0].name)) $("#objSetPointRot_button").css("display", "inline-flex");
      else $("#objSetPointRot_button").css("display", "none");
    }

    if (index < 0 || index >= objs.length)
    {
      //Si cet objet n'existe pas
      selectedObj = -1;
      document.getElementById('obj_settings').style.display = 'none';
      return;
    }
    selectedObj = index;
    document.getElementById('obj_name').innerHTML = document.getElementById('tool_' + objs[index].type).dataset['n'];
    if (objTypes[objs[index].type].p_name)
    {
      //Si cet objet a des paramètres ajustables (tels que l'indice de réfraction)
      document.getElementById('p_box').style.display = '';
      var p_temp = objs[index].p;
      document.getElementById('p_name').innerHTML = document.getElementById('tool_' + objs[index].type).dataset['p'];
      document.getElementById('objAttr_range').min = objTypes[objs[index].type].p_min;
      document.getElementById('objAttr_range').max = objTypes[objs[index].type].p_max;
      document.getElementById('objAttr_range').step = objTypes[objs[index].type].p_step;
      document.getElementById('objAttr_range').value = p_temp;
      document.getElementById('objAttr_text').value = p_temp;
      objs[index].p = p_temp;
      for (var i = 0; i < objs.length; i++)
      {
        if (i != selectedObj && hasSameAttrType(objs[i], objs[selectedObj]))
        {
          //S'il existe un autre objet du même type, l'option "Appliquer tout" sera affichée
          document.getElementById('setAttrAll_box').style.display = '';
          break;
        }
        if (i == objs.length - 1)
        {
          document.getElementById('setAttrAll_box').style.display = 'none';
        }
      }
    }
    else
    {
      document.getElementById('p_box').style.display = 'none';
    }
    highlightObject(index);
    draw();
    document.getElementById('obj_settings').style.display = '';
  }

  function hasSameAttrType(obj1, obj2)
  {
    //obj1.type==obj2.type
    //objTypes[obj1.type].p_name==objTypes[obj2.type].p_name
    return document.getElementById('tool_' + obj1.type).dataset['n'] == document.getElementById('tool_' + obj2.type).dataset['n'];
  }

  function setAttr(value)
  {
    //alert(value)
    objs[selectedObj].p = value;
    document.getElementById('objAttr_text').value = value;
    document.getElementById('objAttr_range').value = value;
    if (document.getElementById('setAttrAll').checked)
    {
      for (var i = 0; i < objs.length; i++)
      {
        if (hasSameAttrType(objs[i], objs[selectedObj]))
        {
          objs[i].p = value;
        }
      }
    }
    draw();
  }

  function confirmPositioning(ctrl, shift)
  {
    var xyData = JSON.parse('[' + document.getElementById('xybox').value.replace(/\(|\)/g, '') + ']');
    //Ce n'est que lorsque deux valeurs (coordonnées) sont entrées que l'action sera entreprise
    if (xyData.length == 2)
    {
      if (positioningObj == -4)
      {
        //Observateur
        observer.c.x = xyData[0];
        observer.c.y = xyData[1];
      }
      else
      {
        //objet
        objTypes[objs[positioningObj].type].dragging(objs[positioningObj], graphs.point(xyData[0], xyData[1]), draggingPart, ctrl, shift);
      }
      draw();
      createUndoPoint();
    }

    endPositioning();
  }

  function highlightObject(index) {
    objs[index].selected = true;
  }

  function unhighlightObject(index) {
    objs[index].selected = false;
  }

  function unhighlightAllObj() {
    for(o of objs) o.selected = false;
  }

  function endPositioning()
  {
    document.getElementById('xybox').style.display = 'none';
    positioningObj = -1;
    draggingPart = {};
  }

  function removeObj(index)
  {
    for (var i = index; i < objs.length - 1; i++)
    {
      objs[i] = JSON.parse(JSON.stringify(objs[i + 1]));
    }
    isConstructing = false;
    objs.length = objs.length - 1;
    selectedObj--;
    selectObj(selectedObj);
  }

  function createUndoPoint()
  {
    undoIndex = (undoIndex + 1) % undoLimit;
    undoUBound = undoIndex;
    document.getElementById('undo').disabled = false;
    document.getElementById('redo').disabled = true;
    undoArr[undoIndex] = document.getElementById('textarea1').value;
    if (undoUBound == undoLBound)
    {
      //Le nombre d'étapes de récupération a atteint la limite supérieure
      undoLBound = (undoLBound + 1) % undoLimit;
    }
  }

  function undo()
  {
    if (isConstructing)
    {
      //Si l'utilisateur crée un objet en appuyant sur restaurer, alors seule l'action de création sera terminée à ce moment, et aucune restauration réelle ne sera effectuée

      isConstructing = false;
      objs.length--;
      selectObj(-1);

      draw();
      return;
    }
    if (positioningObj != -1)
    {
      //Si l'utilisateur entre des coordonnées en appuyant sur la touche de restauration, alors seule l'action de saisie de coordonnées sera terminée à ce moment et aucune restauration réelle ne sera effectuée.
      endPositioning();
      return;
    }
    if (undoIndex == undoLBound)
        //Atteint la limite inférieure des données de récupération
        return;
    undoIndex = (undoIndex + (undoLimit - 1)) % undoLimit;
    document.getElementById('textarea1').value = undoArr[undoIndex];
    JSONInput();
    document.getElementById('redo').disabled = false;
    if (undoIndex == undoLBound)
    {
      //Atteint la limite inférieure des données de récupération
      document.getElementById('undo').disabled = true;
    }

  }

  function redo()
  {
    isConstructing = false;
    endPositioning();
    if (undoIndex == undoUBound)
      //Atteint la limite inférieure des données de récupération
      return;
    undoIndex = (undoIndex + 1) % undoLimit;
    document.getElementById('textarea1').value = undoArr[undoIndex];
    JSONInput();
    document.getElementById('undo').disabled = false;
    if (undoIndex == undoUBound)
    {
      //Atteint la limite inférieure des données de récupération
      document.getElementById('redo').disabled = true;
    }
  }

  function initParameters()
  {
    isConstructing = false;
    endPositioning();
    objs.length = 0;
    selectObj(-1);

    //AddingObjType="";
    rayDensity_light = 0.1; //Densité lumineuse (mode dépendant de la lumière)
    rayDensity_images = 1; //Densité lumineuse (mode lié à l'image)
    window.toolBarViewModel.rayDensity.value(rayDensity_light);
    extendLight = false; //L'image de l'observateur
    showLight = true; //Montrer la lumière
    origin = {x: 0, y: 0};
    observer = null;
    scale = 1;
    window.toolBarViewModel.zoom.value(scale * 100);
    //mode="light";
    toolbtn_clicked('laser');
    modebtn_clicked('light');

    //Reset new UI.
    window.toolBarViewModel.tools.selected("Ray");
    window.toolBarViewModel.modes.selected("Rays");
    window.toolBarViewModel.c1.selected(false);
    window.toolBarViewModel.c2.selected(false);
    window.toolBarViewModel.c3.selected(false);

    document.getElementById('lockobjs').checked = false;
    document.getElementById('grid').checked = false;
    document.getElementById('showgrid').checked = false;

    document.getElementById('setAttrAll').checked = false;

    draw();
    //createUndoPoint();
  }

  window.onkeydown = function(e)
  {
    //Ctrl+Z
    if (e.ctrlKey && e.keyCode == 90)
    {
    if (document.getElementById('undo').disabled == false)
    {
      undo();
    }
    return false;
    }

    //Ctrl+D
    if (e.ctrlKey && e.keyCode == 68)
    {
    objs[objs.length] = JSON.parse(JSON.stringify(objs[selectedObj]));
    draw();
    createUndoPoint();
    return false;
    }
    //Ctrl+Y
    if (e.ctrlKey && e.keyCode == 89)
    {
      document.getElementById('redo').onclick();
    }

    //Ctrl+S
    if (e.ctrlKey && e.keyCode == 83)
    {
      document.getElementById('save').onclick();
    }

    //Ctrl+O
    if (e.ctrlKey && e.keyCode == 79)
    {
      document.getElementById('open').onclick();
    }

    //Delete
    if (e.keyCode == 46 || e.keyCode == 8)
    {
    if (selectedObj != -1)
    {
      removeObj(selectedObj);
      draw();
      createUndoPoint();
    }
    return false;
    }

    //Arrow Keys
    if (e.keyCode >= 37 && e.keyCode <= 40)
    {
      var step = document.getElementById('grid').checked ? gridSize : 1;
      if (selectedObj >= 0)
      {
        if (e.keyCode == 37)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], -step, 0);
        }
        if (e.keyCode == 38)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], 0, -step);
        }
        if (e.keyCode == 39)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], step, 0);
        }
        if (e.keyCode == 40)
        {
          objTypes[objs[selectedObj].type].move(objs[selectedObj], 0, step);
        }
      }
      else if (mode == 'observer')
      {
        if (e.keyCode == 37)
        {
          observer.c.x -= step;
        }
        if (e.keyCode == 38)
        {
          observer.c.y -= step;
        }
        if (e.keyCode == 39)
        {
          observer.c.x += step;
        }
        if (e.keyCode == 40)
        {
          observer.c.y += step;
        }
      }
      else
      {
        for (var i = 0; i < objs.length; i++)
        {
          if (e.keyCode == 37)
          {
            objTypes[objs[i].type].move(objs[i], -step, 0);
          }
          if (e.keyCode == 38)
          {
            objTypes[objs[i].type].move(objs[i], 0, -step);
          }
          if (e.keyCode == 39)
          {
            objTypes[objs[i].type].move(objs[i], step, 0);
          }
          if (e.keyCode == 40)
          {
            objTypes[objs[i].type].move(objs[i], 0, step);
          }
        }
      }
      draw();
    }



};

  window.onkeyup = function(e)
  {
    //Arrow Keys
    if (e.keyCode >= 37 && e.keyCode <= 40)
    {
      createUndoPoint();
    }

  };


  //=========================================JSONSortie entrée====================================================
  function JSONOutput()
  {
    document.getElementById('textarea1').value = JSON.stringify({version: 2, objs: objs, mode: mode, rayDensity_light: rayDensity_light, rayDensity_images: rayDensity_images, observer: observer, origin: origin, scale: scale});
    if (typeof(Storage) !== "undefined") {
      localStorage.rayOpticsData = document.getElementById('textarea1').value;
    }
  }
  function JSONInput()
  {
    var jsonData = JSON.parse(document.getElementById('textarea1').value);
    if (typeof jsonData != 'object')return;
    if (!jsonData.version)
    {
      //"Line Optics Simulation 1.0" ou format antérieur
      //var str1=document.getElementById("textarea1").value.replace(/"point"|"xxa"/g,"1").replace(/"circle"|"xxf"/g,"5");
      var str1 = document.getElementById('textarea1').value.replace(/"point"|"xxa"|"aH"/g, '1').replace(/"circle"|"xxf"/g, '5').replace(/"k"/g, '"objs"').replace(/"L"/g, '"p1"').replace(/"G"/g, '"p2"').replace(/"F"/g, '"p3"').replace(/"bA"/g, '"exist"').replace(/"aa"/g, '"parallel"').replace(/"ba"/g, '"mirror"').replace(/"bv"/g, '"lens"').replace(/"av"/g, '"notDone"').replace(/"bP"/g, '"lightAlpha"').replace(/"ab"|"observed_light"|"observed_images"/g, '"observer"');
      jsonData = JSON.parse(str1);
      if (!jsonData.objs)
      {
        jsonData = {objs: jsonData};
      }
      if (!jsonData.mode)
      {
        jsonData.mode = 'light';
      }
      if (!jsonData.rayDensity_light)
      {
        jsonData.rayDensity_light = 1;
      }
      if (!jsonData.rayDensity_images)
      {
        jsonData.rayDensity_images = 1;
      }
      if (!jsonData.scale)
      {
        jsonData.scale = 1;
      }
      jsonData.version = 1;
    }
    if (jsonData.version == 1)
    {
      //"Line Optics Simulation 1.1" à "Line Optics Simulation 1.2"
      jsonData.origin = {x: 0, y: 0};
    }
    if (jsonData.version > 2)
    {
      //Est une version de fichier plus récente que cette version
      return;
    }
    //TODO: Create new version.
    if (!jsonData.scale)
    {
      jsonData.scale = 1;
    }

    objs = jsonData.objs;
    rayDensity_light = jsonData.rayDensity_light;
    rayDensity_images = jsonData.rayDensity_images;
    observer = jsonData.observer;
    origin = jsonData.origin;
    scale = jsonData.scale;
    modebtn_clicked(jsonData.mode);
    selectObj(selectedObj);
  }

  function accessJSON()
  {
    if (document.getElementById('textarea1').style.display == 'none')
    {
      document.getElementById('textarea1').style.display = '';
      document.getElementById('textarea1').select();
    }
    else
    {
      document.getElementById('textarea1').style.display = 'none';
    }

  }

  function toolbtn_mouseentered(tool, e)
  {
    hideAllLists();
  }

  function toolbtn_clicked(tool, e)
  {
    if(tool == "text") chooseText();
    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';

    });
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toollistbtn';
    });

    hideAllLists();

    document.getElementById('tool_' + tool).className = 'toolbtnselected';
    AddingObjType = tool;
    if (tool == "mirror_") {
      var t = window.toolBarViewModel.mirrors.selected();
      if (t == "Segment")
        AddingObjType = "mirror";
      else if (t == "Circular Arc")
        AddingObjType = "arcmirror";
      else if (t == "Ideal Curved")
        AddingObjType = "idealmirror";
    } else if (tool == "refractor_") {
      var t = window.toolBarViewModel.glasses.selected();
      if (t == "Half-plane")
        AddingObjType = "halfplane";
      else if (t == "Circle")
        AddingObjType = "circlelens";
      else if (t == "Free-shape")
        AddingObjType = "refractor";
      else if (t == "Ideal Lens")
        AddingObjType = "lens";
    }
  }

  function toollist_mouseleft(tool, e)
  {
    var rect = document.getElementById('tool_' + tool).getBoundingClientRect();
    mouse = graphs.point(e.pageX, e.pageY);
    if (mouse.x < rect.left || mouse.x > rect.right || mouse.y < rect.top || mouse.y > rect.bottom + 5)
    {
      document.getElementById('tool_' + tool + 'list').style.display = 'none';
      if (document.getElementById('tool_' + tool).className == 'toolbtnwithlisthover')
      {
        document.getElementById('tool_' + tool).className = 'toolbtn';
      }
    }
  }

  function hideAllLists()
  {
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element + 'list').style.display = 'none';
      if (document.getElementById('tool_' + element).className == 'toolbtnwithlisthover')
      {
        document.getElementById('tool_' + element).className = 'toolbtn';
      }
    });
  }

  function toollistbtn_clicked(tool, e)
  {
    var selected_toolbtn; //Toolbtn précédemment pressé
    var selecting_toolbtnwithlist; //Toolbtn avec la liste à laquelle appartient ce toollistbtn
    tools_withList.forEach(function(element, index)
    {
      if (document.getElementById('tool_' + element).className == 'toolbtnwithlisthover')
      {
        selecting_toolbtnwithlist = element;
      }
      if (document.getElementById('tool_' + element).className == 'toolbtnselected')
      {
        selected_toolbtn = element;
      }
    });
    if (!selecting_toolbtnwithlist)
    {
      selecting_toolbtnwithlist = selected_toolbtn; //Ce toollistbtn appartient au toolbtn précédemment pressé
    }
    tools_normal.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_withList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toolbtn';
    });
    tools_inList.forEach(function(element, index)
    {
      document.getElementById('tool_' + element).className = 'toollistbtn';
    });

    hideAllLists();

    document.getElementById('tool_' + selecting_toolbtnwithlist).className = 'toolbtnselected';
    document.getElementById('tool_' + tool).className = 'toollistbtnselected';
    AddingObjType = tool;
  }

  function modebtn_clicked(mode1)
  {
    document.getElementById('mode_' + mode).className = 'toolbtn';
    document.getElementById('mode_' + mode1).className = 'toolbtnselected';
    mode = mode1;
    if (mode == 'images' || mode == 'observer')
    {
      window.toolBarViewModel.rayDensity.value(Math.log(rayDensity_images));
    }
    else
    {
      window.toolBarViewModel.rayDensity.value(Math.log(rayDensity_light));
    }
    if (mode == 'observer' && !observer)
    {
      //Initialiser l'observateur
      observer = graphs.circle(graphs.point((canvas.width * 0.5 - origin.x) / scale, (canvas.height * 0.5 - origin.y) / scale), 20);
    }


    draw();
  }

  function cancelMousedownEvent(id)
  {
    document.getElementById(id).onmousedown = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
    document.getElementById(id).ontouchstart = function(e)
    {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    };
  }

  function cancelKeyEvent(obj) {
    $(obj)
    .on("keydown", function(e) {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    })
    .on("keyup", function(e) {
      e.cancelBubble = true;
      if (e.stopPropagation) e.stopPropagation();
    })
  }


  function setRayDensity(value)
  {
    if (mode == 'images' || mode == 'observer')
    {
      rayDensity_images = value;
    }
    else
    {
      rayDensity_light = value;
    }
  }

  function setScale(value) {
    setScaleWithCenter(value, canvas.width / scale / 2, canvas.height / scale / 2);
  }

  function setScaleWithCenter(value, centerX, centerY) {
    scaleChange = value - scale;
    origin.x *= value / scale;
    origin.y *= value / scale;
    origin.x -= centerX * scaleChange;
    origin.y -= centerY * scaleChange;
    scale = value;
    draw();
  }

  function save()
  {
    JSONOutput();

    var blob = new Blob([document.getElementById('textarea1').value], {type: 'application/json'});
    saveAs(blob, document.getElementById('save_name').value);

    document.getElementById('saveBox').style.display = 'none';
  }

  function open(readFile)
  {
    var reader = new FileReader();
    document.getElementById('save_name').value = readFile.name;
    reader.readAsText(readFile);
    reader.onload = function(evt) {
      var fileString = evt.target.result;
      document.getElementById('textarea1').value = fileString;
      endPositioning();
      selectedObj = -1;
      JSONInput();
      createUndoPoint();
    };

  }
  var lang = 'en';
  function getMsg(msg) {
    return locales[lang][msg].message;
  }

  function init_i18n() {
    if (navigator.language) {
      var browser_lang = navigator.language;
      lang = browser_lang.toLowerCase().substring(0, 2);
      if (browser_lang.toLowerCase() == 'zh-tw') {
        lang = 'zh-TW';
      }
      if (browser_lang.toLowerCase() == 'zh-cn') {
        lang = 'zh-CN';
      }
    }
    var url_lang = location.search.substr(1)
    if (url_lang && locales[url_lang]) {
      lang = url_lang;
    }
    var downarraw = '\u25BC';
    document.title = getMsg('appName');

    //===========toolbar===========
    document.getElementById('toolbar_title').innerHTML = getMsg('toolbar_title');

    //Ray
    document.getElementById('tool_laser').value = getMsg('toolname_laser');
    document.getElementById('tool_laser').dataset['n'] = getMsg('toolname_laser');

    //Point source
    document.getElementById('tool_radiant').value = getMsg('toolname_radiant');
    document.getElementById('tool_radiant').dataset['n'] = getMsg('toolname_radiant');
    document.getElementById('tool_radiant').dataset['p'] = getMsg('brightness');

    //Beam
    document.getElementById('tool_parallel').value = getMsg('toolname_parallel');
    document.getElementById('tool_parallel').dataset['n'] = getMsg('toolname_parallel');
    document.getElementById('tool_parallel').dataset['p'] = getMsg('brightness');

    //Mirror▼
    document.getElementById('tool_mirror_').value = getMsg('toolname_mirror_') + downarraw;

    //Mirror->Line
    document.getElementById('tool_mirror').value = getMsg('tooltitle_mirror');
    document.getElementById('tool_mirror').dataset['n'] = getMsg('toolname_mirror_');

    //Mirror->Circular Arc
    document.getElementById('tool_arcmirror').value = getMsg('tooltitle_arcmirror');
    document.getElementById('tool_arcmirror').dataset['n'] = getMsg('toolname_mirror_');

    //Mirror->Curve (ideal)
    document.getElementById('tool_idealmirror').value = getMsg('tooltitle_idealmirror');
    document.getElementById('tool_idealmirror').dataset['n'] = getMsg('toolname_idealmirror');
    document.getElementById('tool_idealmirror').dataset['p'] = getMsg('focallength');

    //Refractor▼
    document.getElementById('tool_refractor_').value = getMsg('toolname_refractor_') + downarraw;

    //Refractor->Half-plane
    document.getElementById('tool_halfplane').value = getMsg('tooltitle_halfplane');
    document.getElementById('tool_halfplane').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_halfplane').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Circle
    document.getElementById('tool_circlelens').value = getMsg('tooltitle_circlelens');
    document.getElementById('tool_circlelens').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_circlelens').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Other shape
    document.getElementById('tool_refractor').value = getMsg('tooltitle_refractor');
    document.getElementById('tool_refractor').dataset['n'] = getMsg('toolname_refractor_');
    document.getElementById('tool_refractor').dataset['p'] = getMsg('refractiveindex');

    //Refractor->Lens (ideal)
    document.getElementById('tool_lens').value = getMsg('tooltitle_lens');
    document.getElementById('tool_lens').dataset['n'] = getMsg('toolname_lens');
    document.getElementById('tool_lens').dataset['p'] = getMsg('focallength');

    //Blocker
    document.getElementById('tool_blackline').value = getMsg('toolname_blackline');
    document.getElementById('tool_blackline').dataset['n'] = getMsg('toolname_blackline');

    //Ruler
    document.getElementById('tool_ruler').value = getMsg('toolname_ruler');
    document.getElementById('tool_ruler').dataset['n'] = getMsg('toolname_ruler');

    //Protractor
    document.getElementById('tool_protractor').value = getMsg('toolname_protractor');
    document.getElementById('tool_protractor').dataset['n'] = getMsg('toolname_protractor');

    //Regular
    document.getElementById('tool_regular').value = getMsg('toolname_regular');
    document.getElementById('tool_regular').dataset['n'] = getMsg('toolname_regular');

    //Text
    document.getElementById('tool_text').value = getMsg('toolname_text');
    document.getElementById('tool_text').dataset['n'] = getMsg('toolname_text');

    //Move view
    document.getElementById('tool_').value = getMsg('toolname_');



    //===========modebar===========
    document.getElementById('modebar_title').innerHTML = getMsg('modebar_title');
    document.getElementById('mode_light').value = getMsg('modename_light');
    document.getElementById('mode_extended_light').value = getMsg('modename_extended_light');
    document.getElementById('mode_images').value = getMsg('modename_images');
    document.getElementById('mode_observer').value = getMsg('modename_observer');
    document.getElementById('rayDensity_title').innerHTML = getMsg('raydensity');


    document.getElementById('undo').value = getMsg('undo');
    document.getElementById('redo').value = getMsg('redo');
    document.getElementById('reset').value = getMsg('reset');
    document.getElementById('save_canvas').value = getMsg('save_canvas');
    document.getElementById('save').value = getMsg('save');
    document.getElementById('save_name_title').innerHTML = getMsg('save_name');
    document.getElementById('save_confirm').value = getMsg('save');
    document.getElementById('save_cancel').value = getMsg('save_cancel');
    document.getElementById('save_description').innerHTML = getMsg('save_description');
    document.getElementById('open').value = getMsg('open');
    document.getElementById('lockobjs_title').innerHTML = getMsg('lockobjs');
    document.getElementById('grid_title').innerHTML = getMsg('snaptogrid');
    document.getElementById('showgrid_title').innerHTML = getMsg('grid');

    document.getElementById('setAttrAll_title').innerHTML = getMsg('applytoall');
    document.getElementById('copy').value = getMsg('duplicate');
    document.getElementById('delete').value = getMsg('delete');
    document.getElementById('objSetPointRot_button').value = getMsg('placerotation');
    document.getElementById('toggleGroupPanel_button').value = getMsg('grouppanel');
    document.getElementById('cauchy_button').value = getMsg('cauchy');
    document.querySelector("label[for=showArrowOnRay]").innerHTML = getMsg('show_arrow_ray');
    document.querySelector("label[for=showParasiticRays]").innerHTML = getMsg('show_parasitic_ray');

    document.getElementById('forceStop').innerHTML = getMsg('processing');

    document.getElementById('footer_message').innerHTML = getMsg('footer_message');
    document.getElementById('homepage').innerHTML = getMsg('homepage');
    document.getElementById('source').innerHTML = getMsg('source');
  }