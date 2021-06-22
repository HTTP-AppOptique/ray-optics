var canvasPainter = {
    draw: function(graph, color) {
      // point
      if (graph.type == 1) {
        ctx.fillStyle = color ? color : 'red';
        ctx.fillRect(graph.x - 2, graph.y - 2, 5, 5); //Dessinez un rectangle rempli
      }
      // line
      else if (graph.type == 2) {
        ctx.strokeStyle = color ? color : 'black';
        ctx.beginPath();
        var ang1 = Math.atan2((graph.p2.x - graph.p1.x), (graph.p2.y - graph.p1.y)); //Prenez l'angle de la pente
        var cvsLimit = (Math.abs(graph.p1.x + origin.x) + Math.abs(graph.p1.y + origin.y) + canvas.height + canvas.width) / Math.min(1, scale);  //Prenez une distance qui dépassera la zone de dessin (comme la fin de la ligne)
        ctx.moveTo(graph.p1.x - Math.sin(ang1) * cvsLimit, graph.p1.y - Math.cos(ang1) * cvsLimit);
        ctx.lineTo(graph.p1.x + Math.sin(ang1) * cvsLimit, graph.p1.y + Math.cos(ang1) * cvsLimit);
        ctx.stroke();
      }
      // ray
      else if (graph.type == 3) {
        ctx.strokeStyle = color ? color : 'black';
        if(showParasiticRays) ctx.strokeStyle = "rgb(20, 150, 50)";
        var ang1, cvsLimit;
        if (Math.abs(graph.p2.x - graph.p1.x) > 1e-5 || Math.abs(graph.p2.y - graph.p1.y) > 1e-5)
        {
          ctx.beginPath();
          ang1 = Math.atan2((graph.p2.x - graph.p1.x), (graph.p2.y - graph.p1.y)); //Prenez l'angle de la pente
          cvsLimit = (Math.abs(graph.p1.x + origin.x) + Math.abs(graph.p1.y + origin.y) + canvas.height + canvas.width) / Math.min(1, scale);  //Prenez une distance qui dépassera la zone de dessin (comme la fin de la ligne)
          ctx.moveTo(graph.p1.x, graph.p1.y);
          ctx.lineTo(graph.p1.x + Math.sin(ang1) * cvsLimit, graph.p1.y + Math.cos(ang1) * cvsLimit);
          if(showArrows && !graph.regular) drawArrow(cvsLimit, graph);
          ctx.stroke();
        }
      }
      else if (graph.type == 4) {
        ctx.strokeStyle = color ? color : 'black';
        if(showParasiticRays) ctx.strokeStyle = "rgb(20, 150, 50)";
        ctx.beginPath();
        ctx.moveTo(graph.p1.x, graph.p1.y);
        ctx.lineTo(graph.p2.x, graph.p2.y);
        cvsLimit = (Math.abs(graph.p1.x + origin.x) + Math.abs(graph.p1.y + origin.y) + canvas.height + canvas.width) / Math.min(1, scale);  //Prenez une distance qui dépassera la zone de dessin (comme la fin de la ligne)
        if(showArrows && !graph.regular) drawArrow(cvsLimit, graph);
        ctx.stroke();
      }
      // circle
      else if (graph.type == 5) {
        ctx.strokeStyle = color ? color : 'black';
        ctx.beginPath();
        if (typeof graph.r == 'object') {
          var dx = graph.r.p1.x - graph.r.p2.x;
          var dy = graph.r.p1.y - graph.r.p2.y;
          ctx.arc(graph.c.x, graph.c.y, Math.sqrt(dx * dx + dy * dy), 0, Math.PI * 2, false);
        } else {
          ctx.arc(graph.c.x, graph.c.y, graph.r, 0, Math.PI * 2, false);
        }
        ctx.stroke();
      }
    },
    cls: function() {
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale,0,0,scale,origin.x, origin.y);
    }
  };