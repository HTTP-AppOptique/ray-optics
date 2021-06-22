//================================================================================================================================
  //=========================================================MouseDown==============================================================
  function canvas_onmousedown(e) {
    //Lorsque la souris est enfoncée
    if (e.changedTouches) {
      var et = e.changedTouches[0];
    } else {
      var et = e;
    }
    var mouse_nogrid = graphs.point((et.pageX - e.target.offsetLeft - origin.x) / scale, (et.pageY - e.target.offsetTop - origin.y) / scale); //Position réelle de la souris
    mouse_lastmousedown = mouse_nogrid;
    if (positioningObj != -1)
    {
      confirmPositioning(e.ctrlKey, e.shiftKey);
      if (!(e.which && e.which == 3))
      {
        return;
      }
    }
  
    if (!((e.which && (e.which == 1 || e.which == 3)) || (e.changedTouches)))
    {
      return;
    }
  
    //if(document.getElementById("grid").checked || e.altKey)
    if (document.getElementById('grid').checked)
    {
      //Utiliser la grille
      mouse = graphs.point(Math.round(((et.pageX - e.target.offsetLeft - origin.x) / scale) / gridSize) * gridSize, Math.round(((et.pageY - e.target.offsetTop - origin.y) / scale) / gridSize) * gridSize);
  
    }
    else
    {
      //N'utilisez pas de grille
      mouse = mouse_nogrid;
    }
  
    //Here, the user have clicked while rotating the polygon, that mean he want to stop rotating
    //Because right after the click, the program create a ray, we return to prevent that
    if(isRotating) {
      isRotating = false; 
      rotationPoint = {}; 
      nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}};
      mouseBeforeRotation = {x: Infinity, y: Infinity};
      mouseAfterRotation = {x: Infinity, y: Infinity};
      if(!isMovingMultipleObject) {
        if(objs[selectedObj].type == "refractor") {
          for(s of objs[selectedObj].path) {
            s.x = Math.round(s.x);
            s.y = Math.round(s.y);
          }
        }
      }
      if(isMovingMultipleObject) {
        for(o of currentSelectedGr[0].elements) {
          switch(o.type) {
            case "refractor": {
              for(pt of o.path) {
                pt.x = Math.round(pt.x);
                pt.y = Math.round(pt.y);
              }
              break
            };
            case "radiant": {
              o.x = Math.round(o.x);
              o.y = Math.round(o.y);
              break
            };
            default: {
              o.p1.x = Math.round(o.p1.x);
              o.p1.y = Math.round(o.p1.y);
              o.p2.x = Math.round(o.p2.x);
              o.p2.y = Math.round(o.p2.y);
              if(o.p3) {
                o.p3.x = Math.round(o.p3.x);
                o.p3.y = Math.round(o.p3.y);
              }
              break;
            };
          }
        }
      }
      return
    }
  
    //Here, the user have clicked while setting rotation point (after choosing a segment)
    //Because right after the click, the program create a ray, we return to prevent that
    if(isSettingRotationPoint && !isChoosingSeg && !isMovingMultipleObject) {
      isSettingRotationPoint = false;
      isRotating = true;
      rotationPoint = rotationPoint_;
      return
    }
  
    if(isMovingMultipleObject && isSettingRotationPoint) {
      isSettingRotationPoint = false;
      isRotating = true;
      rotationPoint = {x: mouse.x, y: mouse.y};
      return
    }
  
    if (isConstructing)
    {
      if ((e.which && e.which == 1) || (e.changedTouches))
      {
        //Seul le bouton gauche de la souris réagira
        //Si un objet est en cours de création, transmettez-lui l'action directement
        objTypes[objs[objs.length - 1].type].c_mousedown(objs[objs.length - 1], mouse);
      }
    }
    else
    {
      if ((!(document.getElementById('lockobjs').checked) != (e.altKey && AddingObjType != '')) && !(e.which == 3))
      {
        //Rechercher chaque objet, trouver l'objet cliqué par la souris
  
        draggingPart = {};
  
        if (mode == 'observer')
        {
          if (graphs.length_squared(mouse_nogrid, observer.c) < observer.r * observer.r)
          {
            //Clic de souris pour observer
            draggingObj = -4;
            draggingPart = {};
            draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
            draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
            draggingPart.snapData = {};
            return;
          }
        }
  
        var draggingPart_ = {};
        var click_lensq = Infinity;
        var click_lensq_temp;
        var targetObj_index = -1;
        //var targetObj_index_temp;
        var targetIsPoint = false;
  
        for (var i = 0; i < objs.length; i++)
          {
          if (typeof objs[i] != 'undefined')
            {
              draggingPart_ = {};
              if (objTypes[objs[i].type].clicked(objs[i], mouse_nogrid, mouse, draggingPart_))
              {
                //clicked() Renvoie true pour indiquer que la souris a cliqué sur l'objet
  
                if (draggingPart_.targetPoint)
                {
                  //Clic de souris jusqu'à un point
                  targetIsPoint = true; //Une fois que vous trouvez que vous pouvez atteindre le point, vous devez atteindre le point
                  click_lensq_temp = graphs.length_squared(mouse_nogrid, draggingPart_.targetPoint);
                  if (click_lensq_temp <= click_lensq)
                  {
                    targetObj_index = i; //Lorsque le point est atteint, sélectionnez celui le plus proche de la souris
                    click_lensq = click_lensq_temp;
                    draggingPart = draggingPart_;
                  }
                }
                else if (!targetIsPoint)
                {
                  //Le clic de souris n'est pas un point, et le point n'a pas été cliqué jusqu'à présent
                  targetObj_index = i; //Dans le cas d'un non-point, sélectionnez le dernier créé
                  draggingPart = draggingPart_;
                  if(selectedObj != -1) unhighlightObject(selectedObj);
                }
                if(AddingObjType == "regular" && e.shiftKey) {
                  let perp;
                  let f_point_away;
                  let s_point_away
                  let regular;
                  let mouse_away = 200;
                  if(objs[targetObj_index].type == "refractor") {
                    //Let's draw a normal on the refractor
                    choosingSeg(draggingPart_, i);
                    perp = graphs.perpendicularOfLine(nearestSeg.affine.m, mouse.x, mouse.y);
                    nearestSeg = {diff: Infinity, path: {from: -1, to: -1}, affine: {m: 0, p: 0}};
                    f_point_away = {"x": mouse.x + mouse_away, "y": (mouse.x + mouse_away) * perp.m + perp.p};
                    s_point_away = {"x": mouse.x - mouse_away, "y": (mouse.x - mouse_away) * perp.m + perp.p};
                    regular = {type: 'regular', p1: f_point_away, p2: s_point_away, group: [], selected: false};
                    objs.push(regular);
                  }
                  if(["halfplane", "lens", "mirror"].includes(objs[targetObj_index].type)) {
                    //Let's draw a normal on the halfplane/lens
                    let obj = objs[i];
                    let affine = graphs.affineFunctionOfTwoPoints(obj.p1.x, mouse.x, obj.p1.y, mouse.y);
                    perp = graphs.perpendicularOfLine(affine.m, mouse.x, mouse.y);
                    f_point_away = {"x": mouse.x + mouse_away, "y": (mouse.x + mouse_away) * perp.m + perp.p};
                    s_point_away = {"x": mouse.x - mouse_away, "y": (mouse.x - mouse_away) * perp.m + perp.p};
                    regular = {type: 'regular', p1: f_point_away, p2: s_point_away, group: [], selected: false};
                    objs.push(regular);
                  }
                  if(objs[targetObj_index].type == "circlelens") {
                    let obj = objs[i];
                    let affine = graphs.affineFunctionOfTwoPoints(obj.p1.x, mouse.x, obj.p1.y, mouse.y);
                    f_point_away = {"x": mouse.x + mouse_away, "y": (mouse.x + mouse_away) * affine.m + affine.p};
                    s_point_away = {"x": mouse.x - mouse_away, "y": (mouse.x - mouse_away) * affine.m + affine.p};
                    regular = {type: 'regular', p1: f_point_away, p2: s_point_away, group: [], selected: false};
                    objs.push(regular);
                  }
                  draw();
                }
                if(objs[targetObj_index].type == "refractor") $("#objSetPointRot_button").css("display", "inline-flex");
                else $("#objSetPointRot_button").css("display", "none");
                if(isChoosingSeg) {
                  //Here, the user clicked on the "Set a rotation point" and on the polygon
                  choosingSeg(draggingPart_, i);
                  //Here, now the user have choosed the segment, give him the right to set a point of rotation while moving the mouse
                  isSettingRotationPoint = true;
                }
                if(e.which == 1 && e.ctrlKey) {
                  //Enter here to add on selected gr
                  if(!isSelectingMultipleObject) currentSelectedGr = [];
                  isSelectingMultipleObject = true;
                  let isAlreadyIn = false;
                  for(c of currentSelectedGr) if(objs[i] == c) isAlreadyIn = true;
                  if(!isAlreadyIn) currentSelectedGr.push(objs[i]);
                }
              }
            }
            
          }
          if (targetObj_index != -1)
          {
            //Enfin décidé de choisir targetObj_index
            selectObj(targetObj_index);
            draggingPart.originalObj = JSON.parse(JSON.stringify(objs[targetObj_index])); //Stocker temporairement l'état de l'objet avant de le faire glisser
            draggingPart.hasDuplicated = false;
            draggingObj = targetObj_index;
            return;
          }
        }
  
      if (draggingObj == -1)
        {
        //=======================La souris a cliqué dans un espace vide==========================
         if ((AddingObjType == '') || (e.which == 3))
         {
         //=========================Prêt à faire un panoramique sur tout l'écran======================
           draggingObj = -3;
           draggingPart = {};
           //draggingPart.part=0;
           draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
           draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
           draggingPart.mouse2 = origin; //Original origin.
           draggingPart.snapData = {};
           document.getElementById('obj_settings').style.display = 'none';
           selectedObj = -1;
         }
         else
         {
         //======================Créer un nouvel objet=========================
         if(AddingObjType == "refractor" && e.shiftKey) {
            constructRefractorFromInstructions()
            return
         }
          objs[objs.length] = objTypes[AddingObjType].create(mouse);
          isConstructing = true;
          constructionPoint = mouse;
          if (objs[selectedObj])
          {
            if (hasSameAttrType(objs[selectedObj], objs[objs.length - 1]))
            {
              objs[objs.length - 1].p = objs[selectedObj].p; //Rendre les propriétés supplémentaires de cet objet identiques à celles du dernier objet sélectionné (si le type est le même)
            }
          }
          selectObj(objs.length - 1);
          objTypes[objs[objs.length - 1].type].c_mousedown(objs[objs.length - 1], mouse);
         }
        }
    }
    }
  
  
    //================================================================================================================================
    //========================================================MouseMove===============================================================
    function canvas_onmousemove(e) {
    //Quand la souris bouge
    if (e.changedTouches) {
      var et = e.changedTouches[0];
    } else {
      var et = e;
    }
    var mouse_nogrid = graphs.point((et.pageX - e.target.offsetLeft - origin.x) / scale, (et.pageY - e.target.offsetTop - origin.y) / scale); //滑鼠實際位置
    var mouse2;
    //if(document.getElementById("grid").checked != e.altKey)
    if (document.getElementById('grid').checked && !(e.altKey && !isConstructing))
    {
      //Utiliser la grille
      mouse2 = graphs.point(Math.round(((et.pageX - e.target.offsetLeft - origin.x) / scale) / gridSize) * gridSize, Math.round(((et.pageY - e.target.offsetTop - origin.y) / scale) / gridSize) * gridSize);
    }
    else
    {
      //N'utilise pas de grille
      mouse2 = mouse_nogrid;
    }
  
    if (mouse2.x == mouse.x && mouse2.y == mouse.y)
    {
      return;
    }
    mouse = mouse2;
  
    if(isSettingRotationPoint && !isMovingMultipleObject) choosingRotationPoint();
    if(isRotating) {doARotation(); draw();}
  
    if (isConstructing)
    {
      //Si un objet est en cours de création, transmettez-lui l'action directement
      objTypes[objs[objs.length - 1].type].c_mousemove(objs[objs.length - 1], mouse, e.ctrlKey, e.shiftKey);
    }
    else
    {
      if (draggingObj == -4)
      {
        if (e.shiftKey)
        {
          var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
        }
        else
        {
          var mouse_snapped = mouse;
          draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
        }
  
        var mouseDiffX = (mouse_snapped.x - draggingPart.mouse1.x); //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
        var mouseDiffY = (mouse_snapped.y - draggingPart.mouse1.y); //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris
  
        observer.c.x += mouseDiffX;
        observer.c.y += mouseDiffY;
  
        //Mettre à jour la position de la souris
        draggingPart.mouse1 = mouse_snapped;
        draw();
      }
  
      if (draggingObj >= 0)
        {
         //À ce stade, cela signifie que la souris fait glisser un objet
  
        objTypes[objs[draggingObj].type].dragging(objs[draggingObj], mouse, draggingPart, e.ctrlKey, e.shiftKey);
        //Si l'objet entier est déplacé, l'objet d'origine sera copié lorsque la touche Ctrl est enfoncée
        if (draggingPart.part == 0)
        {
          if(isSettingRotationPoint) isSettingRotationPoint = false;
          if (e.ctrlKey && !draggingPart.hasDuplicated)
          {
  
            objs[objs.length] = draggingPart.originalObj;
            draggingPart.hasDuplicated = true;
          }
          if (!e.ctrlKey && draggingPart.hasDuplicated)
          {
            objs.length--;
            draggingPart.hasDuplicated = false;
          }
        }
        draw();
        }
  
      if (draggingObj == -3)
      {
        //========================Panoramique sur tout l'écran=======================
        //À ce stade, la souris est la position actuelle de la souris, draggingPart.mouse1 est la dernière position de la souris
  
        if (e.shiftKey)
        {
          var mouse_snapped = snapToDirection(mouse_nogrid, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
        }
        else
        {
          var mouse_snapped = mouse_nogrid;
          draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
        }
  
        var mouseDiffX = (mouse_snapped.x - draggingPart.mouse1.x); //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
        var mouseDiffY = (mouse_snapped.y - draggingPart.mouse1.y); //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris
        origin.x = mouseDiffX * scale + draggingPart.mouse2.x;
        origin.y = mouseDiffY * scale + draggingPart.mouse2.y;
        draw();
      }
    }
    }
    //==================================================================================================================================
    //==============================MouseUp===============================
    function canvas_onmouseup(e) {
    if (isConstructing)
    {
      if ((e.which && e.which == 1) || (e.changedTouches))
      {
        //Si un objet est en cours de création, transmettez-lui l'action directement
        objTypes[objs[objs.length - 1].type].c_mouseup(objs[objs.length - 1], mouse);
        if (!isConstructing)
        {
          //L'objet a été créé
          createUndoPoint();
        }
      }
    }
    else
    {
      if (e.which && e.which == 3 && draggingObj == -3 && mouse.x == draggingPart.mouse0.x && mouse.y == draggingPart.mouse0.y)
      {
        draggingObj = -1;
        draggingPart = {};
        canvas_ondblclick(e);
        return;
      }
      draggingObj = -1;
      draggingPart = {};
      createUndoPoint();
    }
  
  
  
    }
  
    function canvas_ondblclick(e) {
      var mouse = graphs.point((e.pageX - e.target.offsetLeft - origin.x) / scale, (e.pageY - e.target.offsetTop - origin.y) / scale); //滑鼠實際位置(一律不使用格線)
      if (isConstructing)
      {
      }
      else if (mouseOnPoint(mouse, mouse_lastmousedown))
      {
        draggingPart = {};
        if (mode == 'observer')
        {
          if (graphs.length_squared(mouse, observer.c) < observer.r * observer.r)
          {
  
            //Clic de souris pour observer
            positioningObj = -4;
            draggingPart = {};
            draggingPart.targetPoint = graphs.point(observer.c.x, observer.c.y);
            draggingPart.snapData = {};
  
            document.getElementById('xybox').style.left = (draggingPart.targetPoint.x * scale + origin.x) + 'px';
            document.getElementById('xybox').style.top = (draggingPart.targetPoint.y * scale + origin.y) + 'px';
            document.getElementById('xybox').value = '(' + draggingPart.targetPoint.x + ',' + draggingPart.targetPoint.y + ')';
            document.getElementById('xybox').size = document.getElementById('xybox').value.length;
            document.getElementById('xybox').style.display = '';
            document.getElementById('xybox').select();
            document.getElementById('xybox').setSelectionRange(1, document.getElementById('xybox').value.length - 1);
            xyBox_cancelContextMenu = true;
  
            return;
          }
        }
  
  
        //Rechercher chaque objet, trouver l'objet cliqué par la souris
        var draggingPart_ = {};
        var click_lensq = Infinity;
        var click_lensq_temp;
        var targetObj_index = -1;
  
        for (var i = 0; i < objs.length; i++)
          {
          if (typeof objs[i] != 'undefined')
            {
              draggingPart_ = {};
              if (objTypes[objs[i].type].clicked(objs[i], mouse, mouse, draggingPart_))
              {
                //clicked()Renvoie true pour indiquer que la souris a cliqué sur l'objet
  
                if (draggingPart_.targetPoint)
                {
                  //Clic de souris jusqu'à un point
                  //targetIsPoint=true; //Une fois que vous trouvez que vous pouvez atteindre le point, vous devez atteindre le point
                  click_lensq_temp = graphs.length_squared(mouse, draggingPart_.targetPoint);
                  if (click_lensq_temp <= click_lensq)
                  {
                    targetObj_index = i; //Lorsque le point est atteint, sélectionnez celui le plus proche de la souris
                    click_lensq = click_lensq_temp;
                    draggingPart = draggingPart_;
                  }
                }
              }
            }
          }
          if (targetObj_index != -1)
          {
            selectObj(targetObj_index);
            draggingPart.originalObj = JSON.parse(JSON.stringify(objs[targetObj_index])); //Stocker temporairement l'état de l'objet avant de le faire glisser
            draggingPart.hasDuplicated = false;
            positioningObj = targetObj_index; //L'objet de la position d'entrée est défini sur i
  
            document.getElementById('xybox').style.left = (draggingPart.targetPoint.x * scale + origin.x) + 'px';
            document.getElementById('xybox').style.top = (draggingPart.targetPoint.y * scale + origin.y) + 'px';
            document.getElementById('xybox').value = '(' + draggingPart.targetPoint.x + ',' + draggingPart.targetPoint.y + ')';
            document.getElementById('xybox').size = document.getElementById('xybox').value.length;
            document.getElementById('xybox').style.display = '';
            document.getElementById('xybox').select();
            document.getElementById('xybox').setSelectionRange(1, document.getElementById('xybox').value.length - 1);
            xyBox_cancelContextMenu = true;
          }
      }
  
    }