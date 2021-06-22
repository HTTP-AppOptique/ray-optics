  var objTypes = {};

  //Prototype d'objet de ligne
  objTypes['lineobj'] = {
  //==============================Creation d'objet (clic)=======================================
  c_mousedown: function(obj, mouse)
  {
    obj.p2 = mouse;
    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      draw();
    }
  },
  //==============================Creation d'objet (mouvement)=======================================
  c_mousemove: function(obj, mouse, ctrl, shift)
  {
    if (shift)
    {
      obj.p2 = snapToDirection(mouse, constructionPoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1}]);
    }
    else
    {
      obj.p2 = mouse;
    }

    obj.p1 = ctrl ? graphs.point(2 * constructionPoint.x - obj.p2.x, 2 * constructionPoint.y - obj.p2.y) : constructionPoint;

    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      draw();
    }

  },
  //==============================Creation d'objet (relachement)=======================================
  c_mouseup: function(obj, mouse)
  {
    if (!mouseOnPoint_construct(mouse, obj.p1))
    {
      isConstructing = false;
    }
  },

  //=================================Traduit l'objet====================================
  move: function(obj, diffX, diffY) {
    //Deplacement du premier point du segment de ligne
    obj.p1.x = obj.p1.x + diffX;
    obj.p1.y = obj.p1.y + diffY;
    //Deplacement du second point du segment de ligne
    obj.p2.x = obj.p2.x + diffX;
    obj.p2.y = obj.p2.y + diffY;
  },


  //==========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)===========================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    if (mouseOnSegment(mouse_nogrid, obj))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //==================================Lorsque vous faites glisser un objet===================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    var basePoint;
    if (draggingPart.part == 1)
    {
      basePoint = slidingTerminaisonPoint(basePoint, ctrl, draggingPart, obj, shift, mouse, 1);
    }
    if (draggingPart.part == 2)
    {
      basePoint = slidingTerminaisonPoint(basePoint, ctrl, draggingPart, obj, shift, mouse, 2);
    }
    if (draggingPart.part == 0)
    {
      //Faire glisser toute la ligne
      slidingWholeLine(shift, mouse, draggingPart, obj);
    }
  },

  //=================Déterminez si une lumière atteindra cet objet (si c'est le cas, renvoyez le point d'intersection)=======================
  rayIntersection: function(obj, ray) {
    var rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.p1, obj.p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et de l'objet (la ligne d'extension)

    if (graphs.intersection_is_on_segment(rp_temp, obj) && graphs.intersection_is_on_ray(rp_temp, ray))
    {
      //↑ Si rp_temp est sur ray et rp_temp est sur obj (c'est-à-dire que ray frappe vraiment obj, pas l'extension de ray ou l'extension d'obj)
      return rp_temp; //L'intersection de la tête et du miroir qui renvoie la lumière
    }
  }


  };

  //"halfplane" -> Coord are p1, p2
  objTypes['halfplane'] = {

  p_name: 'Refractive index',
  p_min: 1,
  p_max: 3,
  p_step: 0.01,

  supportSurfaceMerging: true, //Intégration de l'interface de support

  //===================================Créer un objet============================================
  create: function(mouse) {
    return {type: 'halfplane', p1: mouse, p2: mouse, p: 1.5, group: [], selected: false};
  },

  //Utiliser le prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,

  //=========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)============================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    draggingPart.snapData = {};
    if (isInHalplane(mouse_nogrid, obj.p1, obj.p2))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //=============================Lorsque vous faites glisser un objet========================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    var basePoint;
    if (draggingPart.part == 1)
    {
      basePoint = slidingTerminaisonPoint(basePoint, ctrl, draggingPart, obj, shift, mouse, 1);
      //obj.p1=mouse;
    }
    if (draggingPart.part == 2)
    {
      //Faire glisser le deuxième point de terminaison
      basePoint = slidingTerminaisonPoint(basePoint, ctrl, draggingPart, obj, shift, mouse, 2);
    }
    if (draggingPart.part == 0)
    {
      //Faire glisser toute la ligne
      slidingWholeLineHalfplane(shift, mouse, draggingPart, obj);
    }
  },

  //===================Déterminez si une lumière atteindra cet objet (si c'est le cas, renvoyez le point d'intersection)=====================
  rayIntersection: function(obj, ray) {
    if (obj.p <= 0) return
    var rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.p1, obj.p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et de l'objet

    if (graphs.intersection_is_on_ray(rp_temp, ray))
    {
      //↑Si rp_temp est sur le rayon (c'est-à-dire que le rayon frappe vraiment obj, pas l'extension de rayon)
      return rp_temp; //L'intersection de la tête et du miroir qui renvoie la lumière
    }
  },


  //=============================Dessiner des objets sur le canevas========================================
  draw: function(obj, canvas, aboveLight) {
  if (!aboveLight)
  {
    var len = Math.sqrt((obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y));
    var par_x = (obj.p2.x - obj.p1.x) / len;
    var par_y = (obj.p2.y - obj.p1.y) / len;
    var per_x = par_y;
    var per_y = -par_x;

    var sufficientlyLargeDistance = (Math.abs(obj.p1.x + origin.x) + Math.abs(obj.p1.y + origin.y) + canvas.height + canvas.width) / Math.min(1, scale);

    ctx.beginPath();
    ctx.moveTo(obj.p1.x - par_x * sufficientlyLargeDistance, obj.p1.y - par_y * sufficientlyLargeDistance);
    ctx.lineTo(obj.p1.x + par_x * sufficientlyLargeDistance, obj.p1.y + par_y * sufficientlyLargeDistance);
    ctx.lineTo(obj.p1.x + (par_x - per_x) * sufficientlyLargeDistance, obj.p1.y + (par_y - per_y) * sufficientlyLargeDistance);
    ctx.lineTo(obj.p1.x - (par_x + per_x) * sufficientlyLargeDistance, obj.p1.y - (par_y + per_y) * sufficientlyLargeDistance);

    objTypes['refractor'].fillGlass(obj.p, obj);
  }

  ctx.fillStyle = 'red';
  ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
  ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
  },

  //============================Lorsque l'objet est frappé par la lumière=================================
  shot: function(obj, ray, rayIndex, rp, surfaceMerging_objs) {
    var rdots = (ray.p2.x - ray.p1.x) * (obj.p2.x - obj.p1.x) + (ray.p2.y - ray.p1.y) * (obj.p2.y - obj.p1.y); //ray與此線段之內積
    var ssq = (obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y); //此線段長度平方
    var normal = {x: rdots * (obj.p2.x - obj.p1.x) - ssq * (ray.p2.x - ray.p1.x), y: rdots * (obj.p2.y - obj.p1.y) - ssq * (ray.p2.y - ray.p1.y)};

    var shotType = this.getShotType(obj, ray);
    if (shotType == 1)
    {
      //Tourné de l'intérieur vers l'extérieur
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = obj.p;
      if(ray.cauchy_color == "red") n1 = cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = cauchy(blue_length);
    }
    else if (shotType == -1)
    {
      //Tourné de l'extérieur vers l'intérieur
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = 1 / obj.p;
      if(ray.cauchy_color == "red") n1 = 1 / cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = 1 / cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = 1 / cauchy(blue_length);
    }
    else
    {
      //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
      //Afin d'éviter les malentendus causés par la prise de vue de la lumière dans la mauvaise direction, la lumière est absorbée
      ray.exist = false;
      return;
    }

    //Fusion d'interface
    //if(surfaceMerging_obj)
    for (var i = 0; i < surfaceMerging_objs.length; i++)
    {
      shotType = objTypes[surfaceMerging_objs[i].type].getShotType(surfaceMerging_objs[i], ray);
      if (shotType == 1)
      {
        //Tourné de l'intérieur vers l'extérieur
        n1 *= surfaceMerging_objs[i].p;
      }
      else if (shotType == -1)
      {
        //Tourné de l'extérieur vers l'intérieur
        n1 /= surfaceMerging_objs[i].p;
      }
      else if (shotType == 0)
      {
        //Cela équivaut à ne pas être tourné (par exemple, les deux interfaces se chevauchent)
        //n1=n1;
      }
      else
      {
        //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
        //Afin d'éviter les malentendus causés par la prise de vue de la lumière dans la mauvaise direction, la lumière est absorbée
        ray.exist = false;
        return;
      }
    }
    objTypes['refractor'].refract(ray, rayIndex, rp, normal, n1);


  },

  getShotType: function(obj, ray) {
    var rcrosss = (ray.p2.x - ray.p1.x) * (obj.p2.y - obj.p1.y) - (ray.p2.y - ray.p1.y) * (obj.p2.x - obj.p1.x);
    if (rcrosss > 0)
    {
      return 1; //À l'envers
    }
    if (rcrosss < 0)
    {
      return -1; //De l'extérieur vers l'intérieur
    }
    return 2;
  }

  };

  //objet "circlelens" -> Coord are p1, p2
  objTypes['circlelens'] = {

  p_name: 'Refractive index', //Nom d'attribut
  p_min: 1,
  p_max: 3,
  p_step: 0.01,

  supportSurfaceMerging: true, //Intégration de l'interface de support

  //======================================Créer un objet=========================================
  create: function(mouse) {
    return {type: 'circlelens', p1: mouse, p2: mouse, p: 1.5, group: [], selected: false};
  },

  //Utiliser le prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: function(obj, mouse, ctrl, shift) {objTypes['lineobj'].c_mousemove(obj, mouse, false, shift)},
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,

  //===========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)==========================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    if(Math.pow(graphs.length(obj.p1, obj.p2), 2) > (Math.pow(mouse_nogrid.x - obj.p1.x, 2) + Math.pow(mouse_nogrid.y - obj.p1.y, 2)))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //================================Lorsque vous faites glisser un objet=====================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {objTypes['lineobj'].dragging(obj, mouse, draggingPart, false, shift)},

  //===================Déterminez si une lumière atteindra cet objet (si c'est le cas, renvoyez le point d'intersection)=====================
  rayIntersection: function(obj, ray) {
    if (obj.p <= 0)return;
    var rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(obj.p1, obj.p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et du miroir
    var rp_exist = [];
    var rp_lensq = [];
    for (var i = 1; i <= 2; i++)
    {

      rp_exist[i] = graphs.intersection_is_on_ray(rp_temp[i], ray) && graphs.length_squared(rp_temp[i], ray.p1) > minShotLength_squared;


      rp_lensq[i] = graphs.length_squared(ray.p1, rp_temp[i]); //La distance entre le rayon et la i-ème intersection
    }


    if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2])) {return rp_temp[1];}
    if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1])) {return rp_temp[2];}
  },


  //==================================Dessiner des objets sur le canevas===================================
  draw: function(obj, canvas, aboveLight) {
  if (!aboveLight)
  {
    ctx.beginPath();
    ctx.arc(obj.p1.x, obj.p1.y, graphs.length_segment(obj), 0, Math.PI * 2, false);
    objTypes['refractor'].fillGlass(obj.p, obj);
  }
  ctx.lineWidth = 1;
  ctx.fillStyle = 'red';
  ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
  ctx.fillStyle = 'indigo';
  ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
  },

  //===========================Lorsque l'objet est frappé par la lumière==================================
  shot: function(obj, ray, rayIndex, rp, surfaceMerging_objs) {
    var midpoint = graphs.midpoint(graphs.line_segment(ray.p1, rp));
    var d = graphs.length_squared(obj.p1, obj.p2) - graphs.length_squared(obj.p1, midpoint);
    if (d > 0)
    {
      //Tourné de l'intérieur vers l'extérieur
      var normal = {x: obj.p1.x - rp.x, y: obj.p1.y - rp.y};
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = obj.p;
      if(ray.cauchy_color == "red") n1 = cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = cauchy(blue_length);
    }
    else if (d < 0)
    {
      //Tourné de l'extérieur vers l'intérieur
      var normal = {x: rp.x - obj.p1.x, y: rp.y - obj.p1.y};
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = 1 / obj.p;
      if(ray.cauchy_color == "red") n1 = 1 / cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = 1 / cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = 1 / cauchy(blue_length);
    }
    else
    {
      //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
      //Afin d'éviter les malentendus causés par la prise de vue de la lumière dans la mauvaise direction, la lumière est absorbée
      ray.exist = false;
      return;
    }
    var shotType;

    //Fusion d'interface
    for (var i = 0; i < surfaceMerging_objs.length; i++)
    {
      shotType = objTypes[surfaceMerging_objs[i].type].getShotType(surfaceMerging_objs[i], ray);
      if (shotType == 1)
      {
        //Tourné de l'intérieur vers l'extérieur
        n1 *= surfaceMerging_objs[i].p;
      }
      else if (shotType == -1)
      {
        //Tourné de l'extérieur vers l'intérieur
        n1 /= surfaceMerging_objs[i].p;
      }
      else if (shotType == 0)
      {
        //Cela équivaut à ne pas être tourné (par exemple, les deux interfaces se chevauchent)
      }
      else
      {
        //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
        //Afin d'éviter les malentendus causés par une prise de vue lumineuse dans la mauvaise direction, la lumière est absorbée.)
        ray.exist = false;
        return;
      }
    }
    objTypes['refractor'].refract(ray, rayIndex, rp, normal, n1);


  },

  getShotType: function(obj, ray) {
    var midpoint = graphs.midpoint(graphs.line_segment(ray.p1, this.rayIntersection(obj, ray)));
    var d = graphs.length_squared(obj.p1, obj.p2) - graphs.length_squared(obj.p1, midpoint);

    if (d > 0)
    {
      return 1; //À l'envers
    }
    if (d < 0)
    {
      return -1; //De l'extérieur vers l'intérieur
    }
    return 2;
  }

  };

  //"refractor"物件 HERE
  objTypes['refractor'] = {


  p_name: 'Refractive index', //Nom d'attribut
  p_min: 1,
  p_max: 3,
  p_step: 0.01,

  supportSurfaceMerging: true, //Intégration de l'interface de support
  //=================================Créer un objet==============================================
  create: function(mouse) {
    return {type: 'refractor', path: [{x: mouse.x, y: mouse.y, arc: false}], notDone: true, p: 1.5, group: [], selected: false};
  },

  //=================================Clic de souris lors de la création de l'objet====================================
  c_mousedown: function(obj, mouse)
  {
    if (obj.path.length > 1)
    {
      if (obj.path.length > 3 && mouseOnPoint(mouse, obj.path[0]))
      {
        //La souris a cliqué sur le premier point
        obj.path.length--;
        obj.notDone = false;
        draw();
        return;
      }
      obj.path[obj.path.length - 1] = {x: mouse.x, y: mouse.y}; //Déplacer le dernier point
      obj.path[obj.path.length - 1].arc = true;
    }
  },
  //===============================Mouvement de la souris lors de la création d'objet======================================
  c_mousemove: function(obj, mouse, ctrl, shift)
  {
    if (!obj.notDone) {return;}
    if (typeof obj.path[obj.path.length - 1].arc != 'undefined')
    {
      if (obj.path[obj.path.length - 1].arc && Math.sqrt(Math.pow(obj.path[obj.path.length - 1].x - mouse.x, 2) + Math.pow(obj.path[obj.path.length - 1].y - mouse.y, 2)) >= 5)
      {
        obj.path[obj.path.length] = mouse;
        draw();
      }
    }
    else
    {
      obj.path[obj.path.length - 1] = {x: mouse.x, y: mouse.y}; //Déplacer le dernier point
      draw();
    }
  },
  //=================================Relâchez la souris lors de la création de l'objet====================================
  c_mouseup: function(obj, mouse)
  {
    if (!obj.notDone) {
      isConstructing = false;
      draw();
      return;
    }
    if (obj.path.length > 3 && mouseOnPoint(mouse, obj.path[0]))
    {
      //La souris est relâchée au premier point
      obj.path.length--;
      obj.notDone = false;
      isConstructing = false;
      draw();
      return;
    }
    if (obj.path[obj.path.length - 2] && !obj.path[obj.path.length - 2].arc && mouseOnPoint_construct(mouse, obj.path[obj.path.length - 2]))
    {
      delete obj.path[obj.path.length - 1].arc;
    }
    else
    {
      obj.path[obj.path.length - 1] = {x: mouse.x, y: mouse.y}; //Déplacer le dernier point
      obj.path[obj.path.length - 1].arc = false;
      obj.path[obj.path.length] = {x: mouse.x, y: mouse.y}; //Créer un nouveau point

    }
    draw();
  },
  //===================================Dessiner des objets sur le canevas==================================
  draw: function(obj, canvas, aboveLight) {
    var p1;
    var p2;
    var p3;
    var center;
    var r;
    var a1;
    var a2;
    var a3;
    var acw;

    if (obj.notDone)
    {
      ctx.beginPath();
      ctx.moveTo(obj.path[0].x, obj.path[0].y);

      for (var i = 0; i < obj.path.length - 1; i++)
      {
        //ii=i%(obj.path.length);
        //Traitement des pts, il y a 3 pts, un point de debut, de fin et de direction
        if (obj.path[(i + 1)].arc && !obj.path[i].arc && i < obj.path.length - 2)
        {
          p1 = graphs.point(obj.path[i].x, obj.path[i].y);
          p2 = graphs.point(obj.path[(i + 2)].x, obj.path[(i + 2)].y);
          p3 = graphs.point(obj.path[(i + 1)].x, obj.path[(i + 1)].y);
          center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(p1, p3)), graphs.perpendicular_bisector(graphs.line(p2, p3)));
          if (isFinite(center.x) && isFinite(center.y))
          {
            r = graphs.length(center, p3);
            a1 = Math.atan2(p1.y - center.y, p1.x - center.x);
            a2 = Math.atan2(p2.y - center.y, p2.x - center.x);
            a3 = Math.atan2(p3.y - center.y, p3.x - center.x);
            acw = (a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2); //p1->p3->p2之旋轉方向,逆時針為true

            ctx.arc(center.x, center.y, r, a1, a2, acw);
          }
          else
          {
            //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
            //arcInvalid=true;
            ctx.lineTo(obj.path[(i + 2)].x, obj.path[(i + 2)].y);
          }


        }
        else if (!obj.path[(i + 1)].arc && !obj.path[i].arc)
        {
          ctx.lineTo(obj.path[(i + 1)].x, obj.path[(i + 1)].y);
        }
      }
      //if(!arcInvalid)
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgb(128,128,128)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    else if (!aboveLight)
    {
      //L'objet a été dessiné
      ctx.beginPath();
      ctx.moveTo(obj.path[0].x, obj.path[0].y);

      for (var i = 0; i < obj.path.length; i++)
      {
        //ii=i%(obj.path.length);
        if (obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
        {
          p1 = graphs.point(obj.path[i % obj.path.length].x, obj.path[i % obj.path.length].y);
          p2 = graphs.point(obj.path[(i + 2) % obj.path.length].x, obj.path[(i + 2) % obj.path.length].y);
          p3 = graphs.point(obj.path[(i + 1) % obj.path.length].x, obj.path[(i + 1) % obj.path.length].y);
          center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(p1, p3)), graphs.perpendicular_bisector(graphs.line(p2, p3)));
          if (isFinite(center.x) && isFinite(center.y))
          {
            r = graphs.length(center, p3);
            a1 = Math.atan2(p1.y - center.y, p1.x - center.x);
            a2 = Math.atan2(p2.y - center.y, p2.x - center.x);
            a3 = Math.atan2(p3.y - center.y, p3.x - center.x);
            acw = (a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2); //p1->p3->p2 Le sens de rotation, dans le sens antihoraire est true

            ctx.arc(center.x, center.y, r, a1, a2, acw);
          }
          else
          {
            //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
            ctx.lineTo(obj.path[(i + 2) % obj.path.length].x, obj.path[(i + 2) % obj.path.length].y);
          }

        }
        else if (!obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
        {
          ctx.lineTo(obj.path[(i + 1) % obj.path.length].x, obj.path[(i + 1) % obj.path.length].y);
        }
      }
      this.fillGlass(obj.p, obj);
    }
    ctx.lineWidth = 1;


    for (var i = 0; i < obj.path.length; i++)
    {
      if (typeof obj.path[i].arc != 'undefined')
      {
        if (obj.path[i].arc) ctx.fillStyle = 'rgb(255,0,255)';
        else ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillRect(obj.path[i].x - 2, obj.path[i].y - 2, 3, 3);
      }
    }

  },

  fillGlass: function(n, obj)
  {
    if (n >= 1)
    {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgb(180, 180, 180)';
      if(obj.selected) ctx.fillStyle = 'white';
      ctx.globalAlpha = Math.log(n) / Math.log(1.5) * 0.2;

      ctx.fill('evenodd');
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

    }
    else
    {

      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgb(70,70,70)';
      ctx.lineWidth = 1;
      ctx.stroke();

    }
  },

  //===============================Traduire l'objet==============================
  move: function(obj, diffX, diffY) {
    for (var i = 0; i < obj.path.length; i++) {
          obj.path[i].x += diffX;
          obj.path[i].y += diffY;
    }
  },


  //=======================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)==============================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    var click_lensq = Infinity;
    var click_lensq_temp;
    var targetPoint_index = -1;

    for (var i = 0; i < obj.path.length; i++)
    {
      if (mouseOnPoint(mouse_nogrid, obj.path[i]))
      {
        click_lensq_temp = graphs.length_squared(mouse_nogrid, obj.path[i]);
        if (click_lensq_temp <= click_lensq)
        {
          click_lensq = click_lensq_temp;
          targetPoint_index = i;
        }
      }
    }
    if (targetPoint_index != -1)
    {
      draggingPart.part = 1;
      draggingPart.index = targetPoint_index;
      draggingPart.targetPoint = graphs.point(obj.path[targetPoint_index].x, obj.path[targetPoint_index].y);
      return true;
    }
    if(isInRefractor(mouse_nogrid, obj.path)) {
      //Faites glisser l'objet entier
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
  },

  //===============================Lorsque vous faites glisser un objet======================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    if (draggingPart.part == 1)
    {
      obj.path[draggingPart.index].x = mouse.x;
      obj.path[draggingPart.index].y = mouse.y;
    }

    if (draggingPart.part == 0)
    {
      if (shift)
      {
        var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
      }
      else
      {
        var mouse_snapped = mouse;
        draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez Maj
      }
      this.move(obj, mouse_snapped.x - draggingPart.mouse1.x, mouse_snapped.y - draggingPart.mouse1.y);
      if(isMovingMultipleObject && currentSelectedGr[0]) {
        for(g of obj.group) {
          if(g == currentSelectedGr[0].name) movingObjectInGroup(obj, mouse_snapped.x - draggingPart.mouse1.x, mouse_snapped.y - draggingPart.mouse1.y);
        }
      }
      draggingPart.mouse1 = mouse_snapped;
    }
  },



  //===================Déterminez si une lumière atteindra cet objet (si c'est le cas, renvoyez le point d'intersection)=====================
  rayIntersection: function(obj, ray) {
    if (obj.notDone || obj.p <= 0)return;

    var s_lensq = Infinity;
    var s_lensq_temp;
    var s_point = null;
    var s_point_temp = null;
    //var a_rp;
    var rp_exist = [];
    var rp_lensq = [];
    var rp_temp;

    var p1;
    var p2;
    var p3;
    var center;
    var r;
    //var pathInvalid=false;

    for (var i = 0; i < obj.path.length; i++)
    {
      s_point_temp = null;
      if (obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
      {
        //圓弧i->i+1->i+2
        p1 = graphs.point(obj.path[i % obj.path.length].x, obj.path[i % obj.path.length].y);
        p2 = graphs.point(obj.path[(i + 2) % obj.path.length].x, obj.path[(i + 2) % obj.path.length].y);
        p3 = graphs.point(obj.path[(i + 1) % obj.path.length].x, obj.path[(i + 1) % obj.path.length].y);
        center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(p1, p3)), graphs.perpendicular_bisector(graphs.line(p2, p3)));
        if (isFinite(center.x) && isFinite(center.y))
        {
          r = graphs.length(center, p3);
          rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(center, p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et du miroir
          for (var ii = 1; ii <= 2; ii++)
          {
            rp_exist[ii] = !graphs.intersection_is_on_segment(graphs.intersection_2line(graphs.line(p1, p2), graphs.line(p3, rp_temp[ii])), graphs.segment(p3, rp_temp[ii])) && graphs.intersection_is_on_ray(rp_temp[ii], ray) && graphs.length_squared(rp_temp[ii], ray.p1) > minShotLength_squared;
            rp_lensq[ii] = graphs.length_squared(ray.p1, rp_temp[ii]); //La distance entre le rayon et la i-ème intersection
          }
          if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2]) && rp_lensq[1] > minShotLength_squared)
          {
            s_point_temp = rp_temp[1];
            s_lensq_temp = rp_lensq[1];
          }
          if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1]) && rp_lensq[2] > minShotLength_squared)
          {
            s_point_temp = rp_temp[2];
            s_lensq_temp = rp_lensq[2];
          }
        }
        else
        {
          //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
          //Segment de ligne i->i+2
          var rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點

          if (graphs.intersection_is_on_segment(rp_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length])) && graphs.intersection_is_on_ray(rp_temp, ray) && graphs.length_squared(ray.p1, rp_temp) > minShotLength_squared)
          {
            //↑Si rp_temp est sur ray et rp_temp est sur obj (c'est-à-dire que ray frappe vraiment obj, pas l'extension de ray ou l'extension de obj)
            s_lensq_temp = graphs.length_squared(ray.p1, rp_temp); //La distance entre l'intersection et [la tête du rayon]
            s_point_temp = rp_temp;
          }
        }
      }
      else if (!obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
      {
        //線段i->i+1
        var rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點

        if (graphs.intersection_is_on_segment(rp_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length])) && graphs.intersection_is_on_ray(rp_temp, ray) && graphs.length_squared(ray.p1, rp_temp) > minShotLength_squared)
        {
          //↑Si rp_temp est sur ray et rp_temp est sur obj (c'est-à-dire que ray frappe vraiment obj, pas l'extension de ray ou l'extension de obj)
          s_lensq_temp = graphs.length_squared(ray.p1, rp_temp); //La distance entre l'intersection et [la tête du rayon]
          s_point_temp = rp_temp;
        }
      }
      if (s_point_temp)
      {
        if (s_lensq_temp < s_lensq)
        {
          s_lensq = s_lensq_temp;
          s_point = s_point_temp;
        }
      }
    }
    if (s_point)
    {
      return s_point;
    }

  },

  //============================Lorsque l'objet est frappé par la lumière=================================
  shot: function(obj, ray, rayIndex, rp, surfaceMerging_objs) {
    if (obj.notDone) return
    var shotData = this.getShotData(obj, ray);
    var shotType = shotData.shotType;
    if (shotType == 1)
    {
      //Tourné de l'intérieur vers l'extérieur
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = obj.p;
      if(ray.cauchy_color == "red") n1 = cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = cauchy(blue_length);
    }
    else if (shotType == -1)
    {
      //Tourné de l'extérieur vers l'intérieur
      var n1; //L'indice de réfraction du milieu source (le milieu de destination est supposé être 1)
      if(!ray.cauchy_color) n1 = 1 / obj.p;
      if(ray.cauchy_color == "red") n1 = 1 / cauchy(red_length);
      if(ray.cauchy_color == "green") n1 = 1 / cauchy(green_length);
      if(ray.cauchy_color == "blue") n1 = 1 / cauchy(blue_length);
    }
    else if (shotType == 0)
    {
      //Cela équivaut à ne pas être tourné (par exemple, les deux interfaces se chevauchent)
      var n1 = 1;
      console.log(n1);
    }
    else
    {
      //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
      //Afin d'éviter les malentendus causés par la prise de vue de la lumière dans la mauvaise direction, la lumière est absorbée
      ray.exist = false;
      return;
    }

    //Fusion d'interface
    for (var i = 0; i < surfaceMerging_objs.length; i++)
    {
      shotType = objTypes[surfaceMerging_objs[i].type].getShotType(surfaceMerging_objs[i], ray);
      if (shotType == 1)
      {
        //Tourné de l'intérieur vers l'extérieur
        n1 *= surfaceMerging_objs[i].p;
      }
      else if (shotType == -1)
      {
        //Tourné de l'extérieur vers l'intérieur
        n1 /= surfaceMerging_objs[i].p;
      }
      else if (shotType == 0)
      {
        //Cela équivaut à ne pas être tourné (par exemple, les deux interfaces se chevauchent)
        //n1=n1;
      }
      else
      {
        //Conditions susceptibles de provoquer des bugs (par exemple, tir aux points limites)
        //Afin d'éviter les malentendus causés par la prise de vue de la lumière dans la mauvaise direction, la lumière est absorbée
        ray.exist = false;
        return;
      }
    }

    this.refract(ray, rayIndex, shotData.s_point, shotData.normal, n1);
  },

  //=======================Juger l'émission de lumière interne / externe================================
  getShotType: function(obj, ray) {
    return this.getShotData(obj, ray).shotType;
  },


  getShotData: function(obj, ray) {
    //=========Déterminez où la lumière frappe l'objet==========
    var s_lensq = Infinity;
    var s_lensq_temp;
    var s_point = null;
    var s_point_temp = null;
    var s_point_index;

    var surfaceMultiplicity = 1; //Nombre de chevauchements d'interface

    var rp_on_ray = [];
    var rp_exist = [];
    var rp_lensq = [];
    var rp_temp;

    var rp2_exist = [];
    var rp2_lensq = [];
    var rp2_temp;

    var normal_x;
    var normal_x_temp;

    var normal_y;
    var normal_y_temp;

    var rdots;
    var ssq;

    var nearEdge = false;
    var nearEdge_temp = false;

    var p1;
    var p2;
    var p3;
    var center;
    var ray2 = graphs.ray(ray.p1, graphs.point(ray.p2.x + Math.random() * 1e-5, ray.p2.y + Math.random() * 1e-5)); //Utilisé comme lumière pour le jugement interne et externe (lampe témoin)
    var ray_intersect_count = 0; //Testez le nombre d'intersections entre la lumière et l'objet (les nombres impairs indiquent que la lumière vient de l'intérieur)

    for (var i = 0; i < obj.path.length; i++)
    {
      s_point_temp = null;
      nearEdge_temp = false;
      if (obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
      {
        //Segment de ligne i->i+1->i+2
        p1 = graphs.point(obj.path[i % obj.path.length].x, obj.path[i % obj.path.length].y);
        p2 = graphs.point(obj.path[(i + 2) % obj.path.length].x, obj.path[(i + 2) % obj.path.length].y);
        p3 = graphs.point(obj.path[(i + 1) % obj.path.length].x, obj.path[(i + 1) % obj.path.length].y);
        center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(p1, p3)), graphs.perpendicular_bisector(graphs.line(p2, p3)));
        if (isFinite(center.x) && isFinite(center.y))
        {
          rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(center, p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et du miroir
          rp2_temp = graphs.intersection_line_circle(graphs.line(ray2.p1, ray2.p2), graphs.circle(center, p2));
          for (var ii = 1; ii <= 2; ii++)
          {


            rp_on_ray[ii] = graphs.intersection_is_on_ray(rp_temp[ii], ray);
            rp_exist[ii] = rp_on_ray[ii] && !graphs.intersection_is_on_segment(graphs.intersection_2line(graphs.line(p1, p2), graphs.line(p3, rp_temp[ii])), graphs.segment(p3, rp_temp[ii])) && graphs.length_squared(rp_temp[ii], ray.p1) > minShotLength_squared;
            rp_lensq[ii] = graphs.length_squared(ray.p1, rp_temp[ii]); //La distance entre le rayon et la i-ème intersection

            rp2_exist[ii] = !graphs.intersection_is_on_segment(graphs.intersection_2line(graphs.line(p1, p2), graphs.line(p3, rp2_temp[ii])), graphs.segment(p3, rp2_temp[ii])) && graphs.intersection_is_on_ray(rp2_temp[ii], ray2) && graphs.length_squared(rp2_temp[ii], ray2.p1) > minShotLength_squared;
            rp2_lensq[ii] = graphs.length_squared(ray2.p1, rp2_temp[ii]);
          }

          if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2]) && rp_lensq[1] > minShotLength_squared)
          {
            s_point_temp = rp_temp[1];
            s_lensq_temp = rp_lensq[1];
            if (rp_on_ray[2] && rp_lensq[1] < rp_lensq[2])
            {
              //Lumière de l'extérieur vers l'intérieur (pour l'arc lui-même)
              normal_x_temp = s_point_temp.x - center.x;
              normal_y_temp = s_point_temp.y - center.y;
            }
            else
            {
              normal_x_temp = center.x - s_point_temp.x;
              normal_y_temp = center.y - s_point_temp.y;
            }
          }
          if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1]) && rp_lensq[2] > minShotLength_squared)
          {
            s_point_temp = rp_temp[2];
            s_lensq_temp = rp_lensq[2];
            if (rp_on_ray[1] && rp_lensq[2] < rp_lensq[1])
            {
              //Lumière de l'extérieur vers l'intérieur (pour l'arc lui-même)
              normal_x_temp = s_point_temp.x - center.x;
              normal_y_temp = s_point_temp.y - center.y;
            }
            else
            {
              normal_x_temp = center.x - s_point_temp.x;
              normal_y_temp = center.y - s_point_temp.y;
            }
          }
          if (rp2_exist[1] && rp2_lensq[1] > minShotLength_squared)
          {
            ray_intersect_count++;
            //canvasPainter.draw(ray2,canvas,"white");
          }
          if (rp2_exist[2] && rp2_lensq[2] > minShotLength_squared)
          {
            ray_intersect_count++;
          }

          //Jugement trop près de la frontière
          if (s_point_temp && (graphs.length_squared(s_point_temp, p1) < minShotLength_squared || graphs.length_squared(s_point_temp, p2) < minShotLength_squared))
          {
            nearEdge_temp = true;
          }

        }
        else
        {
          //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
          //Segment de ligne i->i+2
          rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點

          rp2_temp = graphs.intersection_2line(graphs.line(ray2.p1, ray2.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點
          if (graphs.intersection_is_on_segment(rp_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length])) && graphs.intersection_is_on_ray(rp_temp, ray) && graphs.length_squared(ray.p1, rp_temp) > minShotLength_squared)
          {
            //↑Si rp_temp est sur ray et rp_temp est sur obj (c'est-à-dire que ray frappe vraiment obj, pas l'extension de ray ou l'extension de obj)
            //ray_intersect_count++;
            s_lensq_temp = graphs.length_squared(ray.p1, rp_temp); //La distance entre l'intersection et [la tête du rayon]
            s_point_temp = rp_temp;

            rdots = (ray.p2.x - ray.p1.x) * (obj.path[(i + 2) % obj.path.length].x - obj.path[i % obj.path.length].x) + (ray.p2.y - ray.p1.y) * (obj.path[(i + 2) % obj.path.length].y - obj.path[i % obj.path.length].y); //ray與此線段之內積
            ssq = (obj.path[(i + 2) % obj.path.length].x - obj.path[i % obj.path.length].x) * (obj.path[(i + 2) % obj.path.length].x - obj.path[i % obj.path.length].x) + (obj.path[(i + 2) % obj.path.length].y - obj.path[i % obj.path.length].y) * (obj.path[(i + 2) % obj.path.length].y - obj.path[i % obj.path.length].y); //此線段長度平方

            normal_x_temp = rdots * (obj.path[(i + 2) % obj.path.length].x - obj.path[i % obj.path.length].x) - ssq * (ray.p2.x - ray.p1.x);
            normal_y_temp = rdots * (obj.path[(i + 2) % obj.path.length].y - obj.path[i % obj.path.length].y) - ssq * (ray.p2.y - ray.p1.y);


          }

          if (graphs.intersection_is_on_segment(rp2_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 2) % obj.path.length])) && graphs.intersection_is_on_ray(rp2_temp, ray2) && graphs.length_squared(ray2.p1, rp2_temp) > minShotLength_squared)
          {
            ray_intersect_count++;
          }

          //Jugement trop près de la frontière
          if (s_point_temp && (graphs.length_squared(s_point_temp, obj.path[i % obj.path.length]) < minShotLength_squared || graphs.length_squared(s_point_temp, obj.path[(i + 2) % obj.path.length]) < minShotLength_squared))
          {
            nearEdge_temp = true;
          }
          //ctx.lineTo(obj.path[(i+2)%obj.path.length].x,obj.path[(i+2)%obj.path.length].y);
        }
      }
      else if (!obj.path[(i + 1) % obj.path.length].arc && !obj.path[i % obj.path.length].arc)
      {
        //Segment de lignei->i+1
        rp_temp = graphs.intersection_2line(graphs.line(ray.p1, ray.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點

        rp2_temp = graphs.intersection_2line(graphs.line(ray2.p1, ray2.p2), graphs.line(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length]));   //求光(的延長線)與物件(的延長線)的交點
        if (graphs.intersection_is_on_segment(rp_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length])) && graphs.intersection_is_on_ray(rp_temp, ray) && graphs.length_squared(ray.p1, rp_temp) > minShotLength_squared)
        {
          //↑Si rp_temp est sur ray et rp_temp est sur obj (c'est-à-dire que ray frappe vraiment obj, pas l'extension de ray ou l'extension de obj)
          //ray_intersect_count++;
          s_lensq_temp = graphs.length_squared(ray.p1, rp_temp); //La distance entre l'intersection et [la tête du rayon]
          s_point_temp = rp_temp;

          rdots = (ray.p2.x - ray.p1.x) * (obj.path[(i + 1) % obj.path.length].x - obj.path[i % obj.path.length].x) + (ray.p2.y - ray.p1.y) * (obj.path[(i + 1) % obj.path.length].y - obj.path[i % obj.path.length].y); //ray與此線段之內積
          ssq = (obj.path[(i + 1) % obj.path.length].x - obj.path[i % obj.path.length].x) * (obj.path[(i + 1) % obj.path.length].x - obj.path[i % obj.path.length].x) + (obj.path[(i + 1) % obj.path.length].y - obj.path[i % obj.path.length].y) * (obj.path[(i + 1) % obj.path.length].y - obj.path[i % obj.path.length].y); //此線段長度平方

          normal_x_temp = rdots * (obj.path[(i + 1) % obj.path.length].x - obj.path[i % obj.path.length].x) - ssq * (ray.p2.x - ray.p1.x);
          normal_y_temp = rdots * (obj.path[(i + 1) % obj.path.length].y - obj.path[i % obj.path.length].y) - ssq * (ray.p2.y - ray.p1.y);


        }

        if (graphs.intersection_is_on_segment(rp2_temp, graphs.segment(obj.path[i % obj.path.length], obj.path[(i + 1) % obj.path.length])) && graphs.intersection_is_on_ray(rp2_temp, ray2) && graphs.length_squared(ray2.p1, rp2_temp) > minShotLength_squared)
        {
          ray_intersect_count++;
        }

        //Jugement trop près de la frontière
        if (s_point_temp && (graphs.length_squared(s_point_temp, obj.path[i % obj.path.length]) < minShotLength_squared || graphs.length_squared(s_point_temp, obj.path[(i + 1) % obj.path.length]) < minShotLength_squared))
        {
          nearEdge_temp = true;
        }
      }
      if (s_point_temp)
      {
        if (s_point && graphs.length_squared(s_point_temp, s_point) < minShotLength_squared)
        {
          //Fusion d'auto-interface
          surfaceMultiplicity++;
        }
        else if (s_lensq_temp < s_lensq)
        {
          s_lensq = s_lensq_temp;
          s_point = s_point_temp;
          s_point_index = i;
          normal_x = normal_x_temp;
          normal_y = normal_y_temp;
          nearEdge = nearEdge_temp;
          surfaceMultiplicity = 1;
        }
      }
    }


    if (nearEdge)
    {
      var shotType = 2; //Tourné vers le point limite
    }
    else if (surfaceMultiplicity % 2 == 0)
    {
      var shotType = 0; //Équivaut à ne pas frapper
    }
    else if (ray_intersect_count % 2 == 1)
    {
      var shotType = 1; //Tourné de l'intérieur vers l'extérieur
    }
    else
    {
      var shotType = -1; //Tourné de l'extérieur vers l'intérieur
    }

    return {s_point: s_point, normal: {x: normal_x, y: normal_y},shotType: shotType};
  },

  //========================Traitement de la réfraction===============================
  refract: function(ray, rayIndex, s_point, normal, n1)
  {
    //TODO: Change n1 to edit refraction index (Cauchy)
    var normal_len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
    var normal_x = normal.x / normal_len;
    var normal_y = normal.y / normal_len;

    var ray_len = Math.sqrt((ray.p2.x - ray.p1.x) * (ray.p2.x - ray.p1.x) + (ray.p2.y - ray.p1.y) * (ray.p2.y - ray.p1.y));

    var ray_x = (ray.p2.x - ray.p1.x) / ray_len;
    var ray_y = (ray.p2.y - ray.p1.y) / ray_len;


    //參考http://en.wikipedia.org/wiki/Snell%27s_law#Vector_form

    var cos1 = -normal_x * ray_x - normal_y * ray_y;
    var sq1 = 1 - n1 * n1 * (1 - cos1 * cos1);


    if (sq1 < 0)
    {
      //Réflexion totale
      ray.p1 = s_point;
      ray.p2 = graphs.point(s_point.x + ray_x + 2 * cos1 * normal_x, s_point.y + ray_y + 2 * cos1 * normal_y);


    }
    else
    {
      //réfraction
      var cos2 = Math.sqrt(sq1);

      var R_s = Math.pow((n1 * cos1 - cos2) / (n1 * cos1 + cos2), 2);
      var R_p = Math.pow((n1 * cos2 - cos1) / (n1 * cos2 + cos1), 2);
      var R = 0.5 * (R_s + R_p);
      //參考http://en.wikipedia.org/wiki/Fresnel_equations#Definitions_and_power_equations

      var ray2 = graphs.ray(s_point, graphs.point(s_point.x + ray_x + 2 * cos1 * normal_x, s_point.y + ray_y + 2 * cos1 * normal_y));
      //TODO: Multiply to highlight parasite rays
      if(showParasiticRays) ray2.parasitic = true;
      ray2.brightness = ray.brightness * R;
      ray2.gap = ray.gap;
      if (ray2.brightness > 0.01)
      {
        //Ajoutez de la lumière réfléchie dans la zone d'attente
        addRay(ray2);
      }
      else if (!ray.gap)
      {
        var amp = Math.floor(0.01 / ray2.brightness) + 1;
        if (rayIndex % amp == 0)
        {
          ray2.brightness = ray2.brightness * amp;
          addRay(ray2);
        }
      }

      //Manipulation de la lumière réfractée
      ray.p1 = s_point;
      ray.p2 = graphs.point(s_point.x + n1 * ray_x + (n1 * cos1 - cos2) * normal_x, s_point.y + n1 * ray_y + (n1 * cos1 - cos2) * normal_y);
      ray.brightness = ray.brightness * (1 - R);

    }
  }


  };

  //"laser"物件 -> Coord are p1, p2
  objTypes['laser'] = {

  //=======================================Créer un objet========================================
  create: function(mouse) {
    return {type: 'laser', p1: mouse, p2: mouse, group: [], selected: false};
  },

  //使用lineobj原型
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,

  //=================================Dessiner des objets sur le canevas====================================
  draw: function(obj, canvas) {
  ctx.fillStyle = 'rgb(255,0,0)';
  if(obj.selected) ctx.fillStyle = 'blue';
  ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 5, 5);
  ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
  },


  //========================================Tirez sur la lumière======================================
  shoot: function(obj) {
  if(isCauchyActive) {
    let rgb_ray = ["red_ray", "green_ray", "blue_ray"];
    for(r of rgb_ray) {
      let ray = graphs.ray(obj.p1, obj.p2);
      ray.brightness = 1;
      ray.gap = true;
      ray.isNew = true;
      ray.last_intersection = [];
      ray.cauchy_color = r.substring(0, r.length - 4);
      addRay(ray);
    }
  } else {
    var ray1 = graphs.ray(obj.p1, obj.p2);
    ray1.brightness = 1;
    ray1.gap = true;
    ray1.isNew = true;
    ray1.last_intersection = [];
    addRay(ray1);
  }
  }
  };

  //objet "miroir" (miroir) -> Coord are p1, p2
  objTypes['mirror'] = {

  //=====================================Créer un objet==========================================
  create: function(mouse) {
    return {type: 'mirror', p1: mouse, p2: mouse, group: [], selected: false};
  },

  //Utiliser le prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,
  rayIntersection: objTypes['lineobj'].rayIntersection,

  //===============================Dessiner des objets sur le canevas======================================
  draw: function(obj, canvas) {
    ctx.strokeStyle = 'rgb(168,168,168)';
    if(obj.selected) ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(obj.p1.x, obj.p1.y);
    ctx.lineTo(obj.p2.x, obj.p2.y);
    ctx.stroke();
  },



  //==============================Lorsque l'objet est frappé par la lumière===============================
  shot: function(mirror, ray, rayIndex, rp) {
    //À ce stade, cela signifie que la lumière doit frapper le miroir, 
    //il suffit de trouver le point d'intersection, pas besoin de juger si elle frappe vraiment le miroir
    var rx = ray.p1.x - rp.x;
    var ry = ray.p1.y - rp.y;
    var mx = mirror.p2.x - mirror.p1.x;
    var my = mirror.p2.y - mirror.p1.y;
    ray.p1 = rp;
    ray.p2 = graphs.point(rp.x + rx * (my * my - mx * mx) - 2 * ry * mx * my, rp.y + ry * (mx * mx - my * my) - 2 * rx * mx * my);
  }





  };

  //objet "lentille" (lentille) -> Coord are p1, p2
  objTypes['lens'] = {

  p_name: 'Focal length', //Nom d'attribut
  p_min: -1000,
  p_max: 1000,
  p_step: 1,

  //========================================Créer un objet=======================================
  create: function(mouse) {
    return {type: 'lens', p1: mouse, p2: mouse, p: 100, group: [], selected: false};
  },

  //Utiliser le prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,
  rayIntersection: objTypes['lineobj'].rayIntersection,

  //=================================Dessiner des objets sur le canevas====================================
  draw: function(obj, canvas) {
  var len = Math.sqrt((obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y));
  var par_x = (obj.p2.x - obj.p1.x) / len;
  var par_y = (obj.p2.y - obj.p1.y) / len;
  var per_x = par_y;
  var per_y = -par_x;

  var arrow_size_per = 5;
  var arrow_size_par = 5;
  var center_size = 2;

  //Tracer une ligne
  ctx.strokeStyle = 'rgb(128,128,128)';
  if(obj.selected) ctx.strokeStyle = 'white';
  ctx.globalAlpha = 1 / ((Math.abs(obj.p) / 100) + 1);
  //ctx.globalAlpha=0.3;
  ctx.lineWidth = 4;
  //ctx.lineCap = "round"
  ctx.beginPath();
  ctx.moveTo(obj.p1.x, obj.p1.y);
  ctx.lineTo(obj.p2.x, obj.p2.y);
  ctx.stroke();
  ctx.lineWidth = 1;
  //ctx.lineCap = "butt"


  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgb(255,0,0)';

  //Dessinez le point central de l'objectif
  var center = graphs.midpoint(obj);
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.beginPath();
  ctx.moveTo(center.x - per_x * center_size, center.y - per_y * center_size);
  ctx.lineTo(center.x + per_x * center_size, center.y + per_y * center_size);
  ctx.stroke();

  if (obj.p > 0)
  {
    //Dessine une flèche (p1)
    ctx.beginPath();
    ctx.moveTo(obj.p1.x - par_x * arrow_size_par, obj.p1.y - par_y * arrow_size_par);
    ctx.lineTo(obj.p1.x + par_x * arrow_size_par + per_x * arrow_size_per, obj.p1.y + par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p1.x + par_x * arrow_size_par - per_x * arrow_size_per, obj.p1.y + par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();

    //Dessine une flèche (p2)
    ctx.beginPath();
    ctx.moveTo(obj.p2.x + par_x * arrow_size_par, obj.p2.y + par_y * arrow_size_par);
    ctx.lineTo(obj.p2.x - par_x * arrow_size_par + per_x * arrow_size_per, obj.p2.y - par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p2.x - par_x * arrow_size_par - per_x * arrow_size_per, obj.p2.y - par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();
  }
  if (obj.p < 0)
  {
    //Dessine une flèche (p1)
    ctx.beginPath();
    ctx.moveTo(obj.p1.x + par_x * arrow_size_par, obj.p1.y + par_y * arrow_size_par);
    ctx.lineTo(obj.p1.x - par_x * arrow_size_par + per_x * arrow_size_per, obj.p1.y - par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p1.x - par_x * arrow_size_par - per_x * arrow_size_per, obj.p1.y - par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();

    //Dessine une flèche (p2)
    ctx.beginPath();
    ctx.moveTo(obj.p2.x - par_x * arrow_size_par, obj.p2.y - par_y * arrow_size_par);
    ctx.lineTo(obj.p2.x + par_x * arrow_size_par + per_x * arrow_size_per, obj.p2.y + par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p2.x + par_x * arrow_size_par - per_x * arrow_size_per, obj.p2.y + par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();
  }
  },



  //=============================Lorsque l'objet est frappé par la lumière================================
  shot: function(lens, ray, rayIndex, shootPoint) {
    var lens_length = graphs.length_segment(lens);
    var main_line_unitvector_x = (-lens.p1.y + lens.p2.y) / lens_length;
    var main_line_unitvector_y = (lens.p1.x - lens.p2.x) / lens_length;
    //(-l1.p1.y+l1.p2.y+l1.p1.x+l1.p2.x)*0.5,(l1.p1.x-l1.p2.x+l1.p1.y+l1.p2.y)*0.5
    var mid_point = graphs.midpoint(lens); //Point central de l'objectif

    var twoF_point_1 = graphs.point(mid_point.x + main_line_unitvector_x * 2 * lens.p, mid_point.y + main_line_unitvector_y * 2 * lens.p);  //兩倍焦距點1
    var twoF_point_2 = graphs.point(mid_point.x - main_line_unitvector_x * 2 * lens.p, mid_point.y - main_line_unitvector_y * 2 * lens.p);  //兩倍焦距點2

    var twoF_line_near, twoF_line_far;
    if (graphs.length_squared(ray.p1, twoF_point_1) < graphs.length_squared(ray.p1, twoF_point_2))
    {
      //Double focale 1 et la lumière du même côté
      twoF_line_near = graphs.parallel(lens, twoF_point_1);
      twoF_line_far = graphs.parallel(lens, twoF_point_2);
    }
    else
    {
      //Double focale 2 et la lumière du même côté
      twoF_line_near = graphs.parallel(lens, twoF_point_2);
      twoF_line_far = graphs.parallel(lens, twoF_point_1);
    }


    if (lens.p > 0)
    {
      //Lentille convergente
      ray.p2 = graphs.intersection_2line(twoF_line_far, graphs.line(mid_point, graphs.intersection_2line(twoF_line_near, ray)));
      ray.p1 = shootPoint;
    }
    else
    {
      //Lentille divergente
      ray.p2 = graphs.intersection_2line(twoF_line_far, graphs.line(shootPoint, graphs.intersection_2line(twoF_line_near, graphs.line(mid_point, graphs.intersection_2line(twoF_line_far, ray)))));
      ray.p1 = shootPoint;
    }
  }





  };

  //objets "idealmirror" -> Coord are p1, p2
  objTypes['idealmirror'] = {

  p_name: 'Focal length', //Nom d'attribut
  p_min: -1000,
  p_max: 1000,
  p_step: 1,

  //======================================Créer un objet=========================================
  create: function(mouse) {
    return {type: 'idealmirror', p1: mouse, p2: graphs.point(mouse.x + gridSize, mouse.y), p: 100, group: [], selected: false};
  },

  //使用lineobj原型
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,
  rayIntersection: objTypes['lineobj'].rayIntersection,

  //=================================Dessiner des objets sur le canevas====================================
  draw: function(obj, canvas) {
  //var ctx = canvas.getContext('2d');

  var len = Math.sqrt((obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y));
  var par_x = (obj.p2.x - obj.p1.x) / len;
  var par_y = (obj.p2.y - obj.p1.y) / len;
  var per_x = par_y;
  var per_y = -par_x;

  var arrow_size_per = 5;
  var arrow_size_par = 5;
  var center_size = 1;

  //Tracer une ligne
  ctx.strokeStyle = 'rgb(168,168,168)';
  if(obj.selected) ctx.strokeStyle = 'white';
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(obj.p1.x, obj.p1.y);
  ctx.lineTo(obj.p2.x, obj.p2.y);
  ctx.stroke();
  ctx.lineWidth = 1;


  //Le point central du miroir de l'écran
  var center = graphs.midpoint(obj);
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.beginPath();
  ctx.moveTo(center.x - per_x * center_size, center.y - per_y * center_size);
  ctx.lineTo(center.x + per_x * center_size, center.y + per_y * center_size);
  ctx.stroke();



  //ctx.globalAlpha=1;
  ctx.fillStyle = 'rgb(255,0,0)';

  //Flèche de gravure recto-verso
  if (obj.p < 0)
  {
    //Dessine une flèche (p1)
    ctx.beginPath();
    ctx.moveTo(obj.p1.x - par_x * arrow_size_par, obj.p1.y - par_y * arrow_size_par);
    ctx.lineTo(obj.p1.x + par_x * arrow_size_par + per_x * arrow_size_per, obj.p1.y + par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p1.x + par_x * arrow_size_par - per_x * arrow_size_per, obj.p1.y + par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();

    //Dessine une flèche (p2)
    ctx.beginPath();
    ctx.moveTo(obj.p2.x + par_x * arrow_size_par, obj.p2.y + par_y * arrow_size_par);
    ctx.lineTo(obj.p2.x - par_x * arrow_size_par + per_x * arrow_size_per, obj.p2.y - par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p2.x - par_x * arrow_size_par - per_x * arrow_size_per, obj.p2.y - par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();
  }
  if (obj.p > 0)
  {
    //Dessine une flèche (p1)
    ctx.beginPath();
    ctx.moveTo(obj.p1.x + par_x * arrow_size_par, obj.p1.y + par_y * arrow_size_par);
    ctx.lineTo(obj.p1.x - par_x * arrow_size_par + per_x * arrow_size_per, obj.p1.y - par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p1.x - par_x * arrow_size_par - per_x * arrow_size_per, obj.p1.y - par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();

    //Dessine une flèche (p2)
    ctx.beginPath();
    ctx.moveTo(obj.p2.x - par_x * arrow_size_par, obj.p2.y - par_y * arrow_size_par);
    ctx.lineTo(obj.p2.x + par_x * arrow_size_par + per_x * arrow_size_per, obj.p2.y + par_y * arrow_size_par + per_y * arrow_size_per);
    ctx.lineTo(obj.p2.x + par_x * arrow_size_par - per_x * arrow_size_per, obj.p2.y + par_y * arrow_size_par - per_y * arrow_size_per);
    ctx.fill();
  }

  },



  //==============================Lorsque l'objet est frappé par la lumière===============================
  shot: function(obj, ray, rayIndex, shootPoint) {
    //En tant que combinaison de lentille idéale et de miroir plat
    objTypes['lens'].shot(obj, ray, rayIndex, graphs.point(shootPoint.x, shootPoint.y));


    //Tirez la lumière vers l'arrière
    ray.p1.x = 2 * ray.p1.x - ray.p2.x;
    ray.p1.y = 2 * ray.p1.y - ray.p2.y;



    objTypes['mirror'].shot(obj, ray, rayIndex, shootPoint);
  }





  };

  //objet "blackline" -> Coord are p1, p2
  objTypes['blackline'] = {

  //======================================Créer un objet=========================================
  create: function(mouse) {
    return {type: 'blackline', p1: mouse, p2: mouse, group: [], selected: false};
  },

  //使用lineobj原型
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,
  rayIntersection: objTypes['lineobj'].rayIntersection,

  //================================Dessiner des objets sur le canevas=====================================
  draw: function(obj, canvas) {
  //var ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgb(70,35,10)';
  if(obj.selected) ctx.strokeStyle = 'rgb(100,65,40)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(obj.p1.x, obj.p1.y);
  ctx.lineTo(obj.p2.x, obj.p2.y);
  ctx.stroke();
  ctx.lineWidth = 1;
  },

  //=============================Lorsque l'objet est frappé par la lumière================================
  shot: function(obj, ray, rayIndex, rp) {
    ray.exist = false;
  }

  };

  //objet "rayonnant" -> Coord are x, y HERE
  objTypes['radiant'] = {

  p_name: 'Brightness', //Nom d'attribut
  p_min: 0,
  p_max: 1,
  p_step: 0.01,

  //==================================Créer un objet=============================================
  create: function(mouse) {
  return {type: 'radiant', x: mouse.x, y: mouse.y, p: 0.5, group: [], selected: false};
  },

  //==============================Clic de souris lors de la création de l'objet=======================================
  c_mousedown: function(obj, mouse)
  {
    draw();
  },
  //=================================Mouvement de la souris lors de la création d'objet====================================
  c_mousemove: function(obj, mouse, ctrl, shift)
  {
  },
  //==================================Relâchez la souris lors de la création de l'objet===================================
  c_mouseup: function(obj, mouse)
  {
    isConstructing = false;
  },

  //=================================Dessiner des objets sur le canevas====================================
  draw: function(obj, canvas) {
  //var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(0,255,0)';
  if(obj.selected) ctx.fillStyle = 'blue';
  ctx.fillRect(obj.x - 2, obj.y - 2, 5, 5);

  },

  //=================================Traduire l'objet====================================
  move: function(obj, diffX, diffY) {
    obj.x = obj.x + diffX;
    obj.y = obj.y + diffY;
    return obj;
  },


  //=========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)============================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj))
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = graphs.point(obj.x, obj.y);
      draggingPart.targetPoint = graphs.point(obj.x, obj.y);
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //==================================Lorsque vous faites glisser un objet===================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    if (shift)
    {
      var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1}], draggingPart.snapData);
    }
    else
    {
      var mouse_snapped = mouse;
      draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez Maj
    }
    let diffX = mouse_snapped.x - obj.x;
    let diffY = mouse_snapped.y - obj.y;
    obj.x = mouse_snapped.x;
    obj.y = mouse_snapped.y;
    if(isMovingMultipleObject && currentSelectedGr[0]) {
      for(g of obj.group) {
        if(g == currentSelectedGr[0].name) movingObjectInGroup(obj, diffX, diffY);
      }
    }
    
    return {obj: obj};
  },


  //===================================Tirez sur la lumière===========================================
  shoot: function(obj) {
  var s = Math.PI * 2 / parseInt(getRayDensity() * 500);
  var i0 = (mode == 'observer') ? (-s * 2 + 1e-6) : 0; //Pour éviter les compartiments noirs lors de l'utilisation d'observateurs
  for (var i = i0; i < (Math.PI * 2 - 1e-5); i = i + s)
  {
    if(isCauchyActive) {
      let rgb_ray = ["red_ray", "green_ray", "blue_ray"];
      for(r of rgb_ray) {
        let ray = graphs.ray(graphs.point(obj.x, obj.y), graphs.point(obj.x + Math.sin(i), obj.y + Math.cos(i)));
        ray.brightness = 1;
        ray.gap = true;
        ray.isNew = true;
        ray.last_intersection = [];
        ray.cauchy_color = r.substring(0, r.length - 4);
        addRay(ray);
      }
    } else {
      var ray1 = graphs.ray(graphs.point(obj.x, obj.y), graphs.point(obj.x + Math.sin(i), obj.y + Math.cos(i)));
      ray1.brightness = Math.min(obj.p / getRayDensity(), 1);
      ray1.last_intersection = [];
      ray1.isNew = true;
      if (i == i0)
      {
        ray1.gap = true;
      }
      addRay(ray1);
    }
  }
  }




  };

  //"parallel"(平行光)物件 -> Coord are p1, p2
  objTypes['parallel'] = {

  p_name: 'Brightness', //Nom d'attribut
  p_min: 0,
  p_max: 1,
  p_step: 0.01,

  //====================================Créer un objet===========================================
  create: function(mouse) {
    return {type: 'parallel', p1: mouse, p2: mouse, p: 0.5, group: [], selected: false};
  },

  //使用lineobj原型
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  clicked: objTypes['lineobj'].clicked,
  dragging: objTypes['lineobj'].dragging,

  //===================================Dessiner des objets sur le canevas==================================
  draw: function(obj, canvas) {
    var a_l = Math.atan2(obj.p1.x - obj.p2.x, obj.p1.y - obj.p2.y) - Math.PI / 2;
    ctx.strokeStyle = 'rgb(0,255,0)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(obj.p1.x + Math.sin(a_l) * 2, obj.p1.y + Math.cos(a_l) * 2);
    ctx.lineTo(obj.p2.x + Math.sin(a_l) * 2, obj.p2.y + Math.cos(a_l) * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(128,128,128,255)';
    if(obj.selected) ctx.strokeStyle = 'rgba(0,0,255,255)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obj.p1.x, obj.p1.y);
    ctx.lineTo(obj.p2.x, obj.p2.y);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';
  },




  //====================================Tirez sur la lumière==========================================
  shoot: function(obj) {
    var n = graphs.length_segment(obj) * getRayDensity();
    var stepX = (obj.p2.x - obj.p1.x) / n;
    var stepY = (obj.p2.y - obj.p1.y) / n;
    var rayp2_x = obj.p1.x + obj.p2.y - obj.p1.y;
    var rayp2_y = obj.p1.y - obj.p2.x + obj.p1.x;


    for (var i = 0.5; i <= n; i++)
    {
      if(isCauchyActive) {
        let rgb_ray = ["red_ray", "green_ray", "blue_ray"];
        for(r of rgb_ray) {
          let ray = graphs.ray(graphs.point(obj.p1.x + i * stepX, obj.p1.y + i * stepY), graphs.point(rayp2_x + i * stepX, rayp2_y + i * stepY));
          ray.brightness = 1;
          if (i == 0)
          {
            ray1.gap = true;
          }
          ray.isNew = true;
          ray.last_intersection = [];
          ray.cauchy_color = r.substring(0, r.length - 4);
          addRay(ray);
        }
      } else {
        var ray1 = graphs.ray(graphs.point(obj.p1.x + i * stepX, obj.p1.y + i * stepY), graphs.point(rayp2_x + i * stepX, rayp2_y + i * stepY));
        ray1.brightness = Math.min(obj.p / getRayDensity(), 1);
        ray1.last_intersection = [];
        ray1.isNew = true;
        if (i == 0)
        {
          ray1.gap = true;
        }
        addRay(ray1);
      }
    }

  }





  };

  //"arcmirror"(弧形鏡子)物件 -> Coord are p1
  objTypes['arcmirror'] = {

  //=========================================Créer un objet======================================
  create: function(mouse) {
    return {type: 'arcmirror', p1: mouse, group: [], selected: false};
  },

  //=================================Clic de souris lors de la création de l'objet====================================
  c_mousedown: function(obj, mouse)
  {
    if (!obj.p2 && !obj.p3)
    {
      draw();
      obj.p2 = mouse;
      return;
    }
    if (obj.p2 && !obj.p3 && !mouseOnPoint_construct(mouse, obj.p1))
    {
      obj.p2 = mouse;
      draw();
      obj.p3 = mouse;
      return;
    }
  },
  //==================================Mouvement de la souris lors de la création d'objet===================================
  c_mousemove: function(obj, mouse, ctrl, shift)
  {
    if (!obj.p3 && !mouseOnPoint_construct(mouse, obj.p1))
    {
      if (shift)
      {
        obj.p2 = snapToDirection(mouse, constructionPoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1}]);
      }
      else
      {
        obj.p2 = mouse;
      }

      obj.p1 = ctrl ? graphs.point(2 * constructionPoint.x - obj.p2.x, 2 * constructionPoint.y - obj.p2.y) : constructionPoint;

      //obj.p2=mouse;
      draw();
      return;
    }
    if (obj.p3 && !mouseOnPoint_construct(mouse, obj.p2))
    {
      obj.p3 = mouse;
      draw();
      return;
    }
  },
  //=================================Relâchez la souris lors de la création de l'objet====================================
  c_mouseup: function(obj, mouse)
  {
    if (obj.p2 && !obj.p3 && !mouseOnPoint_construct(mouse, obj.p1))
    {
      obj.p3 = mouse;
      return;
    }
    if (obj.p3 && !mouseOnPoint_construct(mouse, obj.p2))
    {
      obj.p3 = mouse;
      draw();
      isConstructing = false;
      return;
    }
  },

  //===============================Dessiner des objets sur le canevas======================================
  draw: function(obj, canvas) {
    //var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(255,0,255)';
    //ctx.lineWidth=1.5;
    if (obj.p3 && obj.p2)
    {
      var center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(obj.p1, obj.p3)), graphs.perpendicular_bisector(graphs.line(obj.p2, obj.p3)));
      if (isFinite(center.x) && isFinite(center.y))
      {
        var r = graphs.length(center, obj.p3);
        var a1 = Math.atan2(obj.p1.y - center.y, obj.p1.x - center.x);
        var a2 = Math.atan2(obj.p2.y - center.y, obj.p2.x - center.x);
        var a3 = Math.atan2(obj.p3.y - center.y, obj.p3.x - center.x);
        ctx.strokeStyle = 'rgb(168,168,168)';
        if(obj.selected) ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, a1, a2, (a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2));
        ctx.stroke();
        ctx.fillRect(obj.p3.x - 2, obj.p3.y - 2, 3, 3);
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
        ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
      }
      else
      {
        //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
        ctx.strokeStyle = 'rgb(168,168,168)';
        ctx.beginPath();
        ctx.moveTo(obj.p1.x, obj.p1.y);
        ctx.lineTo(obj.p2.x, obj.p2.y);
        ctx.stroke();

        ctx.fillRect(obj.p3.x - 2, obj.p3.y - 2, 3, 3);
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
        ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
      }
    }
    else if (obj.p2)
    {
      ctx.fillStyle = 'rgb(255,0,0)';
      ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
      ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
    }
    else
    {
      ctx.fillStyle = 'rgb(255,0,0)';
      ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
    }
  },

  //==============================Traduire l'objet=======================================
  move: function(obj, diffX, diffY) {
    //Déplacer le premier point du segment de ligne
    obj.p1.x = obj.p1.x + diffX;
    obj.p1.y = obj.p1.y + diffY;
    //Déplacer le deuxième point du segment de ligne
    obj.p2.x = obj.p2.x + diffX;
    obj.p2.y = obj.p2.y + diffY;

    obj.p3.x = obj.p3.x + diffX;
    obj.p3.y = obj.p3.y + diffY;
    return obj;
  },


  //=========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)============================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p3))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2) && graphs.length_squared(mouse_nogrid, obj.p2) <= graphs.length_squared(mouse_nogrid, obj.p3))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p3))
    {
      draggingPart.part = 3;
      draggingPart.targetPoint = graphs.point(obj.p3.x, obj.p3.y);
      return true;
    }

    var center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(obj.p1, obj.p3)), graphs.perpendicular_bisector(graphs.line(obj.p2, obj.p3)));
    if (isFinite(center.x) && isFinite(center.y))
    {
      var r = graphs.length(center, obj.p3);
      var a1 = Math.atan2(obj.p1.y - center.y, obj.p1.x - center.x);
      var a2 = Math.atan2(obj.p2.y - center.y, obj.p2.x - center.x);
      var a3 = Math.atan2(obj.p3.y - center.y, obj.p3.x - center.x);
      var a_m = Math.atan2(mouse_nogrid.y - center.y, mouse_nogrid.x - center.x);
      if (Math.abs(graphs.length(center, mouse_nogrid) - r) < clickExtent_line && (((a2 < a3 && a3 < a1) || (a1 < a2 && a2 < a3) || (a3 < a1 && a1 < a2)) == ((a2 < a_m && a_m < a1) || (a1 < a2 && a2 < a_m) || (a_m < a1 && a1 < a2))))
      {
        //Faites glisser l'objet entier
        draggingPart.part = 0;
        draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
        draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
        draggingPart.snapData = {};
        return true;
      }
    }
    else
    {
      //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
      if (mouseOnSegment(mouse_nogrid, obj))
      {
        draggingPart.part = 0;
        draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
        draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
        draggingPart.snapData = {};
        return true;
      }
    }
    return false;
  },

  //===============================Lorsque vous faites glisser un objet======================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {
    var basePoint;
    if (draggingPart.part == 1)
    {
      //Faire glisser le premier point de terminaison
      basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p2;

      obj.p1 = shift ? snapToDirection(mouse, basePoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)}]) : mouse;
      obj.p2 = ctrl ? graphs.point(2 * basePoint.x - obj.p1.x, 2 * basePoint.y - obj.p1.y) : basePoint;

      //obj.p1=mouse;
    }
    if (draggingPart.part == 2)
    {
      //Faire glisser le deuxième point de terminaison

      basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p1;

      obj.p2 = shift ? snapToDirection(mouse, basePoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)}]) : mouse;
      obj.p1 = ctrl ? graphs.point(2 * basePoint.x - obj.p2.x, 2 * basePoint.y - obj.p2.y) : basePoint;

      //obj.p2=mouse;
    }
    if (draggingPart.part == 3)
    {
      //Déplacement des points de contrôle d'arc
      obj.p3 = mouse;
    }

    if (draggingPart.part == 0)
    {
      //Faire glisser l'objet entier

      if (shift)
      {
        var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{x: 1, y: 0},{x: 0, y: 1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)},{x: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y), y: -(draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x)}], draggingPart.snapData);
      }
      else
      {
        var mouse_snapped = mouse;
        draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez Maj
      }

      var mouseDiffX = draggingPart.mouse1.x - mouse_snapped.x; //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
      var mouseDiffY = draggingPart.mouse1.y - mouse_snapped.y; //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris
      //Déplacer le premier point du segment de ligne
      obj.p1.x = obj.p1.x - mouseDiffX;
      obj.p1.y = obj.p1.y - mouseDiffY;
      //Déplacer le deuxième point du segment de ligne
      obj.p2.x = obj.p2.x - mouseDiffX;
      obj.p2.y = obj.p2.y - mouseDiffY;

      obj.p3.x = obj.p3.x - mouseDiffX;
      obj.p3.y = obj.p3.y - mouseDiffY;
      //Mettre à jour la position de la souris
      draggingPart.mouse1 = mouse_snapped;
      
    }
  },



  //=================Déterminez si une lumière atteindra cet objet (si c'est le cas, renvoyez le point d'intersection)=======================
  rayIntersection: function(obj, ray) {
    if (!obj.p3) {return;}
    var center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(obj.p1, obj.p3)), graphs.perpendicular_bisector(graphs.line(obj.p2, obj.p3)));
    if (isFinite(center.x) && isFinite(center.y))
    {

      var rp_temp = graphs.intersection_line_circle(graphs.line(ray.p1, ray.p2), graphs.circle(center, obj.p2));   //Trouvez l'intersection de (la ligne d'extension) de la lumière et du miroir
      //canvasPainter.draw(rp_temp[1],canvas);
      //var a_rp
      var rp_exist = [];
      var rp_lensq = [];
      for (var i = 1; i <= 2; i++)
      {

        rp_exist[i] = !graphs.intersection_is_on_segment(graphs.intersection_2line(graphs.line(obj.p1, obj.p2), graphs.line(obj.p3, rp_temp[i])), graphs.segment(obj.p3, rp_temp[i])) && graphs.intersection_is_on_ray(rp_temp[i], ray) && graphs.length_squared(rp_temp[i], ray.p1) > minShotLength_squared;


        rp_lensq[i] = graphs.length_squared(ray.p1, rp_temp[i]); //La distance entre le rayon et la i-ème intersection
      }


      if (rp_exist[1] && ((!rp_exist[2]) || rp_lensq[1] < rp_lensq[2])) {return rp_temp[1];}
      if (rp_exist[2] && ((!rp_exist[1]) || rp_lensq[2] < rp_lensq[1])) {return rp_temp[2];}
    }
    else
    {
      //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
      return objTypes['mirror'].rayIntersection(obj, ray);
    }
  },

  //===========================Lorsque l'objet est frappé par la lumière==================================
  shot: function(obj, ray, rayIndex, rp) {
    var center = graphs.intersection_2line(graphs.perpendicular_bisector(graphs.line(obj.p1, obj.p3)), graphs.perpendicular_bisector(graphs.line(obj.p2, obj.p3)));
    if (isFinite(center.x) && isFinite(center.y))
    {

      var rx = ray.p1.x - rp.x;
      var ry = ray.p1.y - rp.y;
      var cx = center.x - rp.x;
      var cy = center.y - rp.y;
      var c_sq = cx * cx + cy * cy;
      var r_dot_c = rx * cx + ry * cy;
      ray.p1 = rp;

      ray.p2 = graphs.point(rp.x - c_sq * rx + 2 * r_dot_c * cx, rp.y - c_sq * ry + 2 * r_dot_c * cy);
    }
    else
    {
      //Les trois points de l'arc sont colinéaires et traités comme un segment de ligne
      return objTypes['mirror'].shot(obj, ray, rayIndex, rp);
    }

  }





  };

  //objet "règle" -> Coord are p1, p2
  objTypes['ruler'] = {

    //======================================建立物件=========================================
    create: function(mouse) {
      return {type: 'ruler', p1: mouse, p2: mouse, group: [], selected: false};
    },
  
    //使用lineobj原型
    c_mousedown: objTypes['lineobj'].c_mousedown,
    c_mousemove: objTypes['lineobj'].c_mousemove,
    c_mouseup: objTypes['lineobj'].c_mouseup,
    move: objTypes['lineobj'].move,
    clicked: objTypes['lineobj'].clicked,
    dragging: objTypes['lineobj'].dragging,
  
    //=================================將物件畫到Canvas上====================================
    draw: function(obj, canvas, aboveLight) {
    //var ctx = canvas.getContext('2d');
    if (aboveLight)return;
    ctx.globalCompositeOperation = 'lighter';
    var len = Math.sqrt((obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y));
    var par_x = (obj.p2.x - obj.p1.x) / len;
    var par_y = (obj.p2.y - obj.p1.y) / len;
    var per_x = par_y;
    var per_y = -par_x;
    var ang = Math.atan2(obj.p2.y - obj.p1.y, obj.p2.x - obj.p1.x);
  
    var scale_step = 5;
    var scale_step_ten = 20;
    var scale_step_mid = 100;
    var scale_step_long = 100;
    var scale_len = 10;
    var scale_len_mid = 15;
  
  
    ctx.strokeStyle = 'rgb(128,128,128)';
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgb(128,128,128)';
    if(obj.selected) ctx.fillStyle = 'white';
  
    if (ang > Math.PI * (-0.25) && ang <= Math.PI * 0.25)
    {
      //↘~↗
      //console.log("↘~↗");
      var scale_direction = -1;
      var scale_len_long = 20;
      var text_ang = ang;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
    }
    else if (ang > Math.PI * (-0.75) && ang <= Math.PI * (-0.25))
    {
      //↗~↖
      //console.log("↗~↖");
      var scale_direction = 1;
      var scale_len_long = 15;
      var text_ang = ang - Math.PI * (-0.5);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
    }
    else if (ang > Math.PI * 0.75 || ang <= Math.PI * (-0.75))
    {
      //↖~↙
      //console.log("↖~↙");
      var scale_direction = 1;
      var scale_len_long = 20;
      var text_ang = ang - Math.PI;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
    }
    else
    {
      //↙~↘
      //console.log("↙~↘");
      var scale_direction = -1;
      var scale_len_long = 15;
      var text_ang = ang - Math.PI * 0.5;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
    }
  
    ctx.beginPath();
    ctx.moveTo(obj.p1.x, obj.p1.y);
    ctx.lineTo(obj.p2.x, obj.p2.y);
    var x, y;
    for (var i = 0; i <= len; i += scale_step)
    {
      ctx.moveTo(obj.p1.x + i * par_x, obj.p1.y + i * par_y);
      if (i % scale_step_long == 0)
      {
        x = obj.p1.x + i * par_x + scale_direction * scale_len_long * per_x;
        y = obj.p1.y + i * par_y + scale_direction * scale_len_long * per_y;
        ctx.lineTo(x, y);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(text_ang);
        ctx.fillText(i, 0, 0);
        ctx.restore();
      }
      else if (i % scale_step_mid == 0)
      {
        ctx.lineTo(obj.p1.x + i * par_x + scale_direction * scale_len_mid * per_x, obj.p1.y + i * par_y + scale_direction * scale_len_mid * per_y);
      }
      else if(i % scale_step_ten == 0)
      {
        ctx.lineTo(obj.p1.x + i * par_x + scale_direction * scale_len * per_x, obj.p1.y + i * par_y + scale_direction * scale_len * per_y);
      }
      else{
        ctx.lineTo(obj.p1.x + i * par_x + (scale_direction * scale_len * per_x)/2, obj.p1.y + i * par_y + (scale_direction * scale_len * per_y)/2);
      }
    }
    ctx.stroke();
    //ctx.stroke();
  
    ctx.globalCompositeOperation = 'source-over';
    }
  
    };

  //"protractor"物件 -> Coord are p1, p2
  objTypes['protractor'] = {

  //==========================================Créer un objet=====================================
  create: function(mouse) {
    return {type: 'protractor', p1: mouse, p2: mouse, group: [], selected: false};
  },

  //Utiliser le prototype lineobj
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: function(obj, mouse, ctrl, shift) {objTypes['lineobj'].c_mousemove(obj, mouse, false, shift)},
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,

  //=========================Lorsque la zone de dessin est enfoncée (déterminer la partie pressée de l'objet)============================
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if (mouseOnPoint(mouse_nogrid, obj.p1) && graphs.length_squared(mouse_nogrid, obj.p1) <= graphs.length_squared(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 1;
      draggingPart.targetPoint = graphs.point(obj.p1.x, obj.p1.y);
      return true;
    }
    if (mouseOnPoint(mouse_nogrid, obj.p2))
    {
      draggingPart.part = 2;
      draggingPart.targetPoint = graphs.point(obj.p2.x, obj.p2.y);
      return true;
    }
    if (Math.abs(graphs.length(obj.p1, mouse_nogrid) - graphs.length_segment(obj)) < clickExtent_line)
    {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //==================================Lorsque vous faites glisser un objet===================================
  dragging: function(obj, mouse, draggingPart, ctrl, shift) {objTypes['lineobj'].dragging(obj, mouse, draggingPart, false, shift)},

  //================================Dessiner des objets sur le canevas=====================================
  draw: function(obj, canvas, aboveLight) {
  if (!aboveLight)
  {
    ctx.globalCompositeOperation = 'lighter';
    var r = Math.sqrt((obj.p2.x - obj.p1.x) * (obj.p2.x - obj.p1.x) + (obj.p2.y - obj.p1.y) * (obj.p2.y - obj.p1.y));
    var scale_width_limit = 5;

    var scale_step = 1;
    var scale_step_mid = 5;
    var scale_step_long = 10;
    var scale_len = 10;
    var scale_len_mid = 15;
    var scale_len_long = 20;

    ctx.strokeStyle = 'rgb(128,128,128)';
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgb(128,128,128)';
    if(obj.selected) ctx.fillStyle = 'white';

    if (r * scale_step * Math.PI / 180 < scale_width_limit)
    {
      //L'échelle est trop petite
      scale_step = 2;
      scale_step_mid = 10;
      scale_step_long = 30;
    }
    if (r * scale_step * Math.PI / 180 < scale_width_limit)
    {
      //L'échelle est trop petite
      scale_step = 5;
      scale_step_mid = 10;
      scale_step_long = 30;
      scale_len = 5;
      scale_len_mid = 8;
      scale_len_long = 10;
      ctx.font = 'bold 10px Arial';
    }
    if (r * scale_step * Math.PI / 180 < scale_width_limit)
    {
      //L'échelle est trop petite
      scale_step = 10;
      scale_step_mid = 30;
      scale_step_long = 90;
    }


    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.beginPath();
    ctx.arc(obj.p1.x, obj.p1.y, r, 0, Math.PI * 2, false);
    //ctx.stroke();

    var ang, x, y;
    for (var i = 0; i < 360; i += scale_step)
    {
      ang = i * Math.PI / 180 + Math.atan2(obj.p2.y - obj.p1.y, obj.p2.x - obj.p1.x);
      ctx.moveTo(obj.p1.x + r * Math.cos(ang), obj.p1.y + r * Math.sin(ang));
      if (i % scale_step_long == 0)
      {
        x = obj.p1.x + (r - scale_len_long) * Math.cos(ang);
        y = obj.p1.y + (r - scale_len_long) * Math.sin(ang);
        ctx.lineTo(x, y);
        //ctx.stroke();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang + Math.PI * 0.5);
        ctx.fillText((i > 180) ? (360 - i) : i, 0, 0);
        ctx.restore();
      }
      else if (i % scale_step_mid == 0)
      {
        ctx.lineTo(obj.p1.x + (r - scale_len_mid) * Math.cos(ang), obj.p1.y + (r - scale_len_mid) * Math.sin(ang));
        //ctx.stroke();
      }
      else
      {
        ctx.lineTo(obj.p1.x + (r - scale_len) * Math.cos(ang), obj.p1.y + (r - scale_len) * Math.sin(ang));
        //ctx.stroke();
      }
    }
    ctx.stroke();
    //ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.fillStyle = 'red';
  ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3);
  ctx.fillStyle = 'rgb(255,0,255)';
  //ctx.fillStyle="indigo";
  ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);

  }

  };

  //"regular"
  objTypes['regular'] = {

    //=======================================Créer un objet========================================
    create: function(mouse) {
      return {type: 'regular', p1: mouse, p2: mouse, group: [], selected: false};
    },

    //使用lineobj原型
    c_mousedown: objTypes['lineobj'].c_mousedown,
    c_mousemove: objTypes['lineobj'].c_mousemove,
    c_mouseup: objTypes['lineobj'].c_mouseup,
    move: objTypes['lineobj'].move,
    clicked: objTypes['lineobj'].clicked,
    dragging: objTypes['lineobj'].dragging,

    //=================================Dessiner des objets sur le canevas====================================
    draw: function(obj, canvas) {
    ctx.fillStyle = 'rgb(255,0,0)';
    if(obj.selected) ctx.fillStyle = 'blue';
    ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 5, 5);
    ctx.fillRect(obj.p2.x - 2, obj.p2.y - 2, 3, 3);
    },


    //========================================Tirez sur la lumière======================================
    shoot: function(obj) {
    var ray1 = graphs.ray(obj.p1, obj.p2);
    ray1.brightness = 1;
    ray1.regular = true;
    addRay(ray1);
    }
  };

  //"text"
  objTypes['text'] = {

  //=======================================Créer un objet========================================
  create: function(mouse) {
    return {type: 'text', text: text, p1: mouse, p2: graphs.point((mouse.x + text.length*10), mouse.y), group: [], selected: false};
  },

  //使用lineobj原型
  c_mousedown: objTypes['lineobj'].c_mousedown,
  c_mousemove: objTypes['lineobj'].c_mousemove,
  c_mouseup: objTypes['lineobj'].c_mouseup,
  move: objTypes['lineobj'].move,
  dragging: objTypes['lineobj'].dragging,
  clicked: function(obj, mouse_nogrid, mouse, draggingPart) {
    if(mouseOnPoint(mouse_nogrid, graphs.point(obj.p1.x, obj.p1.y))) {
      draggingPart.part = 0;
      draggingPart.mouse0 = mouse; //Position de la souris au début du glissement
      draggingPart.mouse1 = mouse; //La position de la souris du point précédent lors du glissement
      draggingPart.snapData = {};
      return true;
    }
    return false;
  },

  //=================================Dessiner des objets sur le canevas====================================
  draw: function(obj, canvas) {
  ctx.font = "16px Verdana";
  ctx.fillStyle = "red";
  ctx.fillText(obj.text, obj.p1.x, obj.p1.y);
  ctx.fillRect(obj.p1.x - 2, obj.p1.y - 2, 3, 3)
  ctx.fillStyle = 'rgb(255,0,0)';
  },
  };


function slidingWholeLineHalfplane(shift, mouse, draggingPart, obj) {
  if (shift) {
    var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{ x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y) }, { x: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y), y: -(draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x) }], draggingPart.snapData);
  }

  else {
    var mouse_snapped = mouse;
    draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
  }

  updateMousePositionOnDragging(draggingPart, mouse_snapped, obj);
}

function updateMousePositionOnDragging(draggingPart, mouse_snapped, obj) {
  var mouseDiffX = draggingPart.mouse1.x - mouse_snapped.x; //La différence sur l'axe X entre la position actuelle de la souris et la dernière position de la souris
  var mouseDiffY = draggingPart.mouse1.y - mouse_snapped.y; //La différence de l'axe Y entre la position actuelle de la souris et la dernière position de la souris
  
  //Déplacer le premier point du segment de ligne
  obj.p1.x = obj.p1.x - mouseDiffX;
  obj.p1.y = obj.p1.y - mouseDiffY;
  //Déplacer le deuxième point du segment de ligne
  obj.p2.x = obj.p2.x - mouseDiffX;
  obj.p2.y = obj.p2.y - mouseDiffY;
  //Mettre à jour la position de la souris
  draggingPart.mouse1 = mouse_snapped;
  if(isMovingMultipleObject && currentSelectedGr[0]) {
    for(g of obj.group) {
      if(g == currentSelectedGr[0].name) movingObjectInGroup(obj, -mouseDiffX, -mouseDiffY);
    }
  }
  
}

function slidingTerminaisonPoint(basePoint, ctrl, draggingPart, obj, shift, mouse, termPt) {
  if(termPt == 1) {
    basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p2;
    obj.p1 = shift ? snapToDirection(mouse, basePoint, [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y) }]) : mouse;
    obj.p2 = ctrl ? graphs.point(2 * basePoint.x - obj.p1.x, 2 * basePoint.y - obj.p1.y) : basePoint;
  }
  if(termPt == 2) {
    basePoint = ctrl ? graphs.midpoint(draggingPart.originalObj) : draggingPart.originalObj.p1;
    obj.p2 = shift ? snapToDirection(mouse, basePoint, [{x: 1, y: 0},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: -1},{x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y)}]) : mouse;
    obj.p1 = ctrl ? graphs.point(2 * basePoint.x - obj.p2.x, 2 * basePoint.y - obj.p2.y) : basePoint;
  }
  return basePoint;
}

function slidingWholeLine(shift, mouse, draggingPart, obj) {
  if (shift) {
    var mouse_snapped = snapToDirection(mouse, draggingPart.mouse0, [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: (draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x), y: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y) }, { x: (draggingPart.originalObj.p2.y - draggingPart.originalObj.p1.y), y: -(draggingPart.originalObj.p2.x - draggingPart.originalObj.p1.x) }], draggingPart.snapData);
  }

  else {
    var mouse_snapped = mouse;
    draggingPart.snapData = {}; //Déverrouillez la direction de glissement d'origine lorsque vous relâchez la touche Maj
  }
  updateMousePositionOnDragging(draggingPart, mouse_snapped, obj);
}

function movingObjectInGroup(obj, diffX, diffY) {
  for(object of currentSelectedGr[0].elements) {
    if(object == obj) continue
    if(object.type == "refractor") {
      for(p of object.path) {
        p.x += diffX;
        p.y += diffY;
      }
    } else
    if(object.type == "radiant") {
        object.x += diffX;
        object.y += diffY;
    } else
    {
        object.p1.x += diffX;
        object.p1.y += diffY;
        object.p2.x += diffX;
        object.p2.y += diffY;
        if(object.p3) {
          object.p3.x += diffX;
          object.p3.y += diffY;
        }
    }
  }
}

function getTwoExtreme(coordTab) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for(c of coordTab) {
      if(c.x < minX) minX = c.x;
      if(c.x > maxX) maxX = c.x;
      if(c.y < minY) minY = c.y;
      if(c.y > maxY) maxY = c.y;
  }
  return {"minX":minX, "minY":minY, "maxX":maxX, "maxY":maxY};
}

function getIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  let affine_1 = graphs.affineFunctionOfTwoPoints(x1, x2, y1, y2);
  let affine_2 = graphs.affineFunctionOfTwoPoints(x3, x4, y3, y4);
  let intersect_x = (affine_2.p - affine_1.p)/(affine_1.m - affine_2.m);
  let intersect_y = affine_1.m * intersect_x + affine_1.p;
  if(([Infinity, -Infinity].includes(affine_1.m) && [0, -0].includes(affine_2.m)) ||
  ([0, -0].includes(affine_1.m) && [Infinity, -Infinity].includes(affine_2.m))) {
      intersect_x = x1;
      intersect_y = affine_2.p;
  }
  if([0, -0].includes(affine_1.m) && [0, -0].includes(affine_2.m)) {
      intersect_x = null;
      intersect_y = null;
  }
  return {x: intersect_x, y: intersect_y};
}

function isInRefractor(pt, path) {
  let isIn = false;
  let count = 0;
  let extreme = getTwoExtreme(path);
  for(let e = 0; e < path.length; e++) {
      let seg_fpt = path[e];
      let seg_spt = e == path.length - 1 ? path[0] : path[(e+1)];
      let inter = getIntersection(seg_fpt.x, seg_fpt.y, seg_spt.x, seg_spt.y, extreme.minX, pt.y, pt.x, pt.y);
      isOk = true;
      if(inter.x == null) isOk = false 
      else {
          if(!((inter.x > extreme.minX && inter.x < extreme.maxX) || (inter.y > extreme.minY && inter.y < extreme.maxY))) isOk = false;
          if((inter.x < seg_fpt.x && inter.x < seg_spt.x) || (inter.x > seg_fpt.x && inter.x > seg_spt.x)) isOk = false;
          if((inter.y < seg_fpt.y && inter.y < seg_spt.y) || (inter.y > seg_fpt.y && inter.y > seg_spt.y)) isOk = false;
          if(inter.x >= pt.x) isOk = false;
      }
      if(isOk) count++;
  }
  for(c of path) if(c.y == pt.y) count--;
  if(count%2 != 0) isIn = true;
  return isIn;
}

function isInHalplane(pt, p1, p2) {
  let p1isAbove = p1.y > p2.y;
  let aff = graphs.affineFunctionOfTwoPoints(p1.x, p2.x, p1.y, p2.y)
  let isClick = false;
  if(aff.m < 0) {
    if(p1isAbove && (aff.m * pt.x + aff.p) < pt.y) isClick = true;
    if(!p1isAbove && (aff.m * pt.x + aff.p) > pt.y) isClick = true;
  }
  if(aff.m > 0) {
    if(p1isAbove && (aff.m * pt.x + aff.p) > pt.y) isClick = true;
    if(!p1isAbove && (aff.m * pt.x + aff.p) < pt.y) isClick = true;
  }
  if(aff.m == 0) {
      if(p1.x < p2.x && ((aff.m * pt.x + aff.p) < pt.y)) isClick = true;
      if(p1.x > p2.x && ((aff.m * pt.x + aff.p) > pt.y)) isClick = true;
  }
  return isClick;
}

function getArrow(from, to) {
  let length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  let aff = graphs.affineFunctionOfTwoPoints(from.x, to.x, from.y, to.y);
  let perp = graphs.perpendicularOfLine(aff.m, from.x, from.y);
  let ret = intersectionLineAndCircle(length, from, perp)
  return ret;
}

function intersectionLineAndCircle(radius, center, aff) {
  let a = Math.pow(aff.m, 2) + 1;
  let b = (-2) * center.x + 2 * aff.m * (aff.p - center.y);
  let c = Math.pow(center.x, 2) + Math.pow(aff.p - center.y, 2) - Math.pow(radius, 2);
  let delta = Math.pow(b, 2) - 4 * a * c;
  let x1 = (-b - Math.sqrt(delta)) / (2 * a);
  let x2 = (-b + Math.sqrt(delta)) / (2 * a);
  let y1 = x1 * aff.m + aff.p;
  let y2 = x2 * aff.m + aff.p;
  return [{x: x1,y: y1}, {x: x2,y: y2}];
}

function drawArrow(cvsLimit, graph) {
  let arrowStep = 100;
  let arrowSize = 5;
  let count = Math.round(cvsLimit / arrowStep);
  let aff = graphs.affineFunctionOfTwoPoints(graph.p1.x, graph.p2.x, graph.p1.y, graph.p2.y);
  let index = 0;
  while(index < count) {
    let isOk = true;
    //Side is 1 when right, -1 when left
    let side;
    graph.p1.x > graph.p2.x ? side = -1 : side = 1;
    let to = {
      "x": side * index * arrowStep * Math.cos(Math.atan(aff.m)) + graph.p1.x,
      "y": aff.m * (side * index * arrowStep * Math.cos(Math.atan(aff.m)) + graph.p1.x) + aff.p
    };
    let arrSize = intersectionLineAndCircle(arrowSize, to, aff);
    let from = {"x": arrSize[0].x,"y": arrSize[0].y};
    if(graph.p1.x < graph.p2.x && from.x < graph.p1.x) isOk = false;
    if(graph.p1.x > graph.p2.x && (from.x > graph.p1.x || index == 0)) isOk = false;
    if(graph.p1.x < graph.p2.x && graph.p2.x < from.x && !graph.last_intersection) isOk = false;
    if(graph.p1.x > graph.p2.x && graph.p2.x > from.x && !graph.last_intersection) isOk = false;
    if(isOk) {
      if(graph.p1.x > graph.p2.x) from = {"x": arrSize[1].x,"y": arrSize[1].y};
      let arrow = getArrow(from, to);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(arrow[0].x, arrow[0].y);
      ctx.lineTo(arrow[1].x, arrow[1].y);
      ctx.lineTo(to.x, to.y);
      ctx.fill()
    }
  index++;
  }
}

function cauchy(lambda) {
  return A_cauchy_coefficient + (B_cauchy_coefficient / Math.pow(lambda, 2))
}