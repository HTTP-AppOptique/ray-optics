var graphs = {
    /**
    * Modèle de base
    **/
    point: function(x, y) {return {type: 1, x: x, y: y, exist: true}},
  
    line: function(p1, p2) {return {type: 2, p1: p1, p2: p2, exist: true}},
  
    ray: function(p1, p2) {return {type: 3, p1: p1, p2: p2, exist: true}},
  
    line_segment: function(p1, p2) {return {type: 4, p1: p1, p2: p2, exist: true}},
  
    segment: function(p1, p2) {return {type: 4, p1: p1, p2: p2, exist: true}},
  
    circle: function(c, r) {
      if (typeof r == 'object' && r.type == 1) {
        return {type: 5, c: c, r: this.line_segment(c, r), exist: true}
      } else {
        return {type: 5, c: c, r: r, exist: true}
      }
    },
    /**
    * inner product
    * @method dot
    * @param {graph.point} p1
    * @param {graph.point} p2
    * @return {Number}
    **/
    dot: function(p1, p2) {
      return p1.x * p2.x + p1.y * p2.y;
    },
    /**
    * outer product
    * @method cross
    * @param {graph.point} p1
    * @param {graph.point} p2
    * @return {Number}
    **/
    cross: function(p1, p2) {
      return p1.x * p2.y - p1.y * p2.x;
    },
    /**
    * Trouvez le point d'intersection
    * @method intersection
    * @param {graph} obj1
    * @param {graph} obj2
    * @return {graph.point}
    **/
    intersection: function(obj1, obj2) {
      // line & line
      if (obj1.type == 2 && obj2.type == 2) {
        return this.intersection_2line(obj1, obj2);
      }
      // line & circle
      else if (obj1.type == 2 && obj2.type == 5) {
        return this.intersection_line_circle(obj1, obj2);
      }
      // circle & line
      else if (obj1.type == 5 && obj2.type == 2) {
        return this.intersection_line_circle(obj2, obj1);
      }
    },
    /**
    * Intersection de deux lignes droites
    * @method intersection_2line
    * @param {graph.line} l1
    * @param {graph.line} l2
    * @return {graph.point}
    **/
    intersection_2line: function(l1, l2) {
      var A = l1.p2.x * l1.p1.y - l1.p1.x * l1.p2.y;
      var B = l2.p2.x * l2.p1.y - l2.p1.x * l2.p2.y;
      var xa = l1.p2.x - l1.p1.x;
      var xb = l2.p2.x - l2.p1.x;
      var ya = l1.p2.y - l1.p1.y;
      var yb = l2.p2.y - l2.p1.y;
      return graphs.point((A * xb - B * xa) / (xa * yb - xb * ya), (A * yb - B * ya) / (xa * yb - xb * ya));
    },
    /**
    * L'intersection d'une ligne droite et d'un cercle
    * @method intersection_2line
    * @param {graph.line} l1
    * @param {graph.circle} c2
    * @return {graph.point}
    **/
    intersection_line_circle: function(l1, c1) {
      var xa = l1.p2.x - l1.p1.x;
      var ya = l1.p2.y - l1.p1.y;
      var cx = c1.c.x;
      var cy = c1.c.y;
      var r_sq = (typeof c1.r == 'object') ? ((c1.r.p1.x - c1.r.p2.x) * (c1.r.p1.x - c1.r.p2.x) + (c1.r.p1.y - c1.r.p2.y) * (c1.r.p1.y - c1.r.p2.y)) : (c1.r * c1.r);
  
      var l = Math.sqrt(xa * xa + ya * ya);
      var ux = xa / l;
      var uy = ya / l;
  
      var cu = ((cx - l1.p1.x) * ux + (cy - l1.p1.y) * uy);
      var px = l1.p1.x + cu * ux;
      var py = l1.p1.y + cu * uy;
  
  
      var d = Math.sqrt(r_sq - (px - cx) * (px - cx) - (py - cy) * (py - cy));
  
      var ret = [];
      ret[1] = graphs.point(px + ux * d, py + uy * d);
      ret[2] = graphs.point(px - ux * d, py - uy * d);
  
      return ret;
    },
  
    /**
     * Get the affine function going through the two points
     * @param {number} x1 the coordonates in abscissa of the first point
     * @param {number} x2 the coordonates in coordinate of the first point
     * @param {number} y1 the coordonates in abscissa of the second point
     * @param {number} y2 the coordonates in coordinate of the second point
     * @returns the slope and the constant of the function that goes through the two points
     */
    affineFunctionOfTwoPoints : function(x1, x2, y1, y2) {
        let slope = (y2 - y1)/(x2 - x1);
        let constant = y1 - (slope * x1);
        return {m: slope, p: constant};
    },
  
    /**
     * Get the intersection of a line and a circle
     * @param {number} slopeLine the slope of the line that go through the circle
     * @param {JSON} circle the circle object under {o: {x: 0, y: 0}, r: 0}
     * @returns the x and y coordonates of the intersection of the line and the cercle
     */
    intersectionLineCircle : function(slopeLine, circle) {
      return {x: Math.sqrt(Math.pow(circle.r, 2) / (1 + Math.pow(slopeLine, 2))) + circle.o.x, y: slopeLine * Math.sqrt(Math.pow(circle.r, 2) / (1 + Math.pow(slopeLine, 2))) + circle.o.y};
    },
  
    /**
     * Get the affine function of the line that go through another line in a perpendicular way
     * @param {number} m the slope of the function of the line we want the calculated affine function go through the line
     * @param {number} x1 the coordonates in abscissa of the point we want the calculated affine function go through
     * @param {number} y1 the coordonates in ordinate of the point we want the calculated affine function go through
     * @returns the slope and the constant of the line passing through the line in a perpendicular way
     */
    perpendicularOfLine : function(m, x1, y1) {
        let bSlope = -(1 / m);
        let bConstant = y1 - (bSlope * x1);
        return {m: bSlope, p: bConstant};
    },
  
    /**
     * Get the coordonates of the point that is the intersection of the two lines
     * @param {JSON} fun1 the affine function we want the second one to go through
     * @param {JSON} fun2 the affine function we want the first one to go through
     * @returns the x and y coordonates of the intersection on both lines
     */
    intersection : function(fun1, fun2) {
        let abs = (-fun1.p + fun2.p) / (fun1.m - fun2.m);
        let ord = fun1.m * abs + fun1.p;
        return {x: abs, y: ord};
    },
  
    /**
     * Translate coord after rotation
     * @param {{x,y}} M coord of the point we want to rotate
     * @param {{x,y}} O coord of the point around which we want to rotate
     * @param {number} radian the actual rotation in radian
     * @returns 
     */
    rotateArround : function(M, O, radian) {
      var xM, yM, x, y;
      xM = M.x - O.x;
      yM = M.y - O.y;
      x = xM * Math.cos(radian) + yM * Math.sin(radian) + O.x;
      y = -xM * Math.sin(radian) + yM * Math.cos(radian) + O.y;
      if(!Boolean(x) || !Boolean(y)) return {"x": M.x, "y": M.y};
      return {"x": x, "y": y};
    },
  
  
    intersection_is_on_ray: function(p1, r1) {
      return (p1.x - r1.p1.x) * (r1.p2.x - r1.p1.x) + (p1.y - r1.p1.y) * (r1.p2.y - r1.p1.y) >= 0;
    },
  
  
    intersection_is_on_segment: function(p1, s1) {
      return (p1.x - s1.p1.x) * (s1.p2.x - s1.p1.x) + (p1.y - s1.p1.y) * (s1.p2.y - s1.p1.y) >= 0 && (p1.x - s1.p2.x) * (s1.p1.x - s1.p2.x) + (p1.y - s1.p2.y) * (s1.p1.y - s1.p2.y) >= 0;
    },
  
    /**
    * Longueur de la ligne
    * @method length_segment
    * @param {graph.segment} seg
    * @return {Number}
    **/
    length_segment: function(seg) {
      return Math.sqrt(this.length_segment_squared(seg));
    },
    /**
    * Longueur du segment de ligne au carré
    * @method length_segment_squared
    * @param {graph.segment} seg
    * @return {Number}
    **/
    length_segment_squared: function(seg) {
      return this.length_squared(seg.p1, seg.p2);
  
    },
    /**
    * Distance à deux points
    * @method length
    * @param {graph.point} p1
    * @param {graph.point} p2
    * @return {Number}
    **/
    length: function(p1, p2) {
      return Math.sqrt(this.length_squared(p1, p2));
    },
    /**
    * Carré de distance entre deux points
    * @method length_squared
    * @param {graph.point} p1
    * @param {graph.point} p2
    * @return {Number}
    **/
    length_squared: function(p1, p2) {
      var dx = p1.x - p2.x;
      var dy = p1.y - p2.y;
      return dx * dx + dy * dy;
    },
  
    /*
    * Fonctions graphiques de base
    */
    /**
    * Milieu du segment de ligne
    * @method midpoint
    * @param {graph.line} l1
    * @return {graph.point}
    **/
    midpoint: function(l1) {
      var nx = (l1.p1.x + l1.p2.x) * 0.5;
      var ny = (l1.p1.y + l1.p2.y) * 0.5;
      return graphs.point(nx, ny);
    },
    /**
    * Ligne perpendiculaire du segment de ligne
    * @method perpendicular_bisector
    * @param {graph.line} l1
    * @return {graph.line}
    **/
    perpendicular_bisector: function(l1) {
      return graphs.line(
          graphs.point(
            (-l1.p1.y + l1.p2.y + l1.p1.x + l1.p2.x) * 0.5,
            (l1.p1.x - l1.p2.x + l1.p1.y + l1.p2.y) * 0.5
          ),
          graphs.point(
            (l1.p1.y - l1.p2.y + l1.p1.x + l1.p2.x) * 0.5,
            (-l1.p1.x + l1.p2.x + l1.p1.y + l1.p2.y) * 0.5
          )
        );
    },
    /**
    * Tracez une ligne qui passe par un point et est parallèle à une ligne droite
    * @method parallel
    * @param {graph.line} l1
    * @param {graph.point} p1
    * @return {graph.line}
    **/
    parallel: function(l1, p1) {
      var dx = l1.p2.x - l1.p1.x;
      var dy = l1.p2.y - l1.p1.y;
      return graphs.line(p1, graphs.point(p1.x + dx, p1.y + dy));
    },
  };