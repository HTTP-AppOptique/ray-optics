function constructRefractorFromInstructions() {
    createRefractorModal();
    displayRefractorModal();
}

function chooseText() {
    createText();
    displayText();
}

function customRefractor(instructions) {
    let path = [];
    if(!instructions[0].is_coord) return path;
    if(instructions.length < 3) return path;
    let translatedCoord = {};
    translatedCoord.x = instructions[0].coord.x;
    translatedCoord.y = instructions[0].coord.y;
    translatedCoord.arc = false;
    path.push(translatedCoord);
    for(let index = 1; index < instructions.length; index++) {
        let ins = instructions[index];
        if(ins.is_coord) {
            let coord = {};
            coord.x = ins.coord.x;
            coord.y = ins.coord.y;
            coord.arc = false;
            path.push(coord);
        } 
        else {
            let pente, totalangle;
            index == 1 ? pente = -ins.angle : pente = Math.atan2(path[index-1].y - path[index-2].y, path[index-1].x - path[index-2].x) * (180/Math.PI);
            index == 1 ? totalangle = pente : totalangle = pente - ins.angle;
            let newCoord = {};
            newCoord.x = path[index-1].x + ins.length * Math.cos((Math.PI * totalangle)/180);
            newCoord.y = path[index-1].y + ins.length * Math.sin((Math.PI * totalangle)/180);
            newCoord.arc = false;
            path.push(newCoord);
        }
    }
    return path
}

function getDataFromCustomRefractorCreator() {
    let tr = $("#customRefractor tbody tr");
    let count = 0;
    let instructions = [];
    for(line of tr) {
        if(count != $("#customRefractor tbody tr").length - 1) {
            //Array with x = coord[0] and y = coord[1]
            let coord = $(line).find("td").eq(0).find("input").val().split(",");
            //NaN or Float
            let angle = Number.parseFloat($(line).find("td").eq(1).find("input").val().replace(",", "."));
            //NaN or Float
            let length = Number.parseFloat($(line).find("td").eq(2).find("input").val().replace(",", "."));

            if(coord[1] != undefined) instructions.push({"is_coord": true, "coord":{x: Number.parseFloat(coord[0]), y: Number.parseFloat(coord[1])}})
            else instructions.push({"is_coord":false, "length":!isNaN(length) ? length : 0, "angle":!isNaN(angle) ? angle : 0});
        }
        count++;
    }
    return instructions;
}

function addPointLine(button) {
    let tr = $(button).parent().parent();
    
    /*
    <tr>
        <th scope="row"><div class="form-group"><input type="text" class="form-control" placeholder="Point" id="inputDefault"></div></th>
        <td><div class="form-group"><input type="text" class="form-control" placeholder="Coordonnées" id="inputDefault"></div></td>
        <td><div class="form-group"><input type="text" class="form-control" placeholder="Angle" id="inputDefault" disabled></div></td>
        <td><div class="form-group"><input type="text" class="form-control" placeholder="Longueur" id="inputDefault" disabled></div></td>
    </tr>
    */

    let line = document.createElement("tr");
    
    //Point
    let pointTH = document.createElement("th");
    $(pointTH).attr("scope", "row");
    $(line).append(pointTH);

    let pointDIV = document.createElement("div");
    $(pointDIV).addClass("form-group");
    $(pointTH).append(pointDIV);

    let pointINPUT = document.createElement("input");
    $(pointINPUT).addClass("form-control");
    $(pointINPUT).attr("type", "text");
    $(pointINPUT).attr("placeholder", getMsg("point"));
    $(pointINPUT).attr("id", "inputDefault");
    $(pointDIV).append(pointINPUT);

    //Coords
    let coordTD = document.createElement("td");
    $(line).append(coordTD);

    let coordDIV = document.createElement("div");
    $(coordDIV).addClass("form-group");
    $(coordTD).append(coordDIV);

    let coordINPUT = $(document.createElement("input"))
    .on("input", function() {
        let val = $(coordINPUT).val().trim();
        if(Boolean(val)) {
            $(angleINPUT).attr("disabled", "");
            $(lengthINPUT).attr("disabled", "");
        }
        else {
            $(angleINPUT).removeAttr("disabled");
            $(lengthINPUT).removeAttr("disabled");
        }
    })
    .on("change", function() {
        let val = $(coordINPUT).val(); 
        $(coordINPUT).val(val.trim())
    })
    $(coordINPUT).addClass("form-control");
    $(coordINPUT).attr("type", "text");
    $(coordINPUT).attr("placeholder", getMsg("coords"));
    $(coordINPUT).attr("id", "inputDefault");
    $(coordDIV).append(coordINPUT);

    //Angle
    let angleTD = document.createElement("td");
    $(line).append(angleTD);

    let angleDIV = document.createElement("div");
    $(angleDIV).addClass("form-group");
    $(angleTD).append(angleDIV);

    let angleINPUT = $(document.createElement("input"))
    .on("input", function() {
        let val = $(angleINPUT).val().trim();
        let lenVal = $(lengthINPUT).val().trim();
        if(Boolean(val)) $(coordINPUT).attr("disabled", "");
        if(!Boolean(val) && !Boolean(lenVal)) $(coordINPUT).removeAttr("disabled");
    })
    .on("change", function() {
        let val = $(angleINPUT).val(); 
        $(angleINPUT).val(val.trim());
    })
    $(angleINPUT).addClass("form-control");
    $(angleINPUT).attr("type", "text");
    $(angleINPUT).attr("placeholder", getMsg("angle"));
    $(angleINPUT).attr("id", "inputDefault");
    $(angleDIV).append(angleINPUT);

    //Length
    let lengthTD = document.createElement("td");
    $(line).append(lengthTD);

    let lengthDIV = document.createElement("div");
    $(lengthDIV).addClass("form-group");
    $(lengthTD).append(lengthDIV);

    let lengthINPUT = $(document.createElement("input"))
    .on("input", function() {
        let val = $(lengthINPUT).val().trim();
        let angVal = $(angleINPUT).val().trim();
        if(Boolean(val)) $(coordINPUT).attr("disabled", "");
        if(!Boolean(val) && !Boolean(angVal)) $(coordINPUT).removeAttr("disabled");
    })
    .on("change", function() {
        let val = $(lengthINPUT).val(); 
        $(lengthINPUT).val(val.trim())
    })
    $(lengthINPUT).addClass("form-control");
    $(lengthINPUT).attr("type", "text");
    $(lengthINPUT).attr("placeholder", getMsg("length"));
    $(lengthINPUT).attr("id", "inputDefault");
    $(lengthDIV).append(lengthINPUT);

    $(line).insertBefore(tr);
}

function deletePointLine() {
    let length = $("#customRefractor tbody tr:last-child").index();
    let c = $("#customRefractor tbody tr:nth-child(" + length + ")");
    $(c).remove();
}

function createRefractorModal() {
    /*
    <div id="customRefractor">
        <table class="table table-hover">
            <thead>
                <tr>
                    <th scope="col">Point</th>
                    <th scope="col">Coordonnées</th>
                    <th scope="col">Angle</th>
                    <th scope="col">Longueur</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><div class="form-group"><input type="text" class="form-control" placeholder="Point" id="inputDefault"></div></th>
                    <td><div class="form-group"><input type="text" class="form-control" placeholder="Coordonnées" id="inputDefault"></div></td>
                    <td><div class="form-group"><input type="text" class="form-control" placeholder="Angle" id="inputDefault" disabled></div></td>
                    <td><div class="form-group"><input type="text" class="form-control" placeholder="Longueur" id="inputDefault" disabled></div></td>
                </tr>
                <tr>
                    <th scope="row"></th>
                    <td><button type="button" class="btn btn-primary">Ajouter un point</button></td>
                    <td><button type="button" class="btn btn-primary">Supprimer un point</button></td>
                    <td><button type="button" class="btn btn-primary">Créer la forme</button></td>
                </tr>
            </tbody>
        </table>
    </div>
    */

    let div = document.createElement("div");
    $(div).attr("id", "customRefractor");
    cancelKeyEvent(div);

    let table = document.createElement("table");
    $(table).addClass("table table-hover");

    let thead = document.createElement("thead");
    let trHead = document.createElement("tr");

    for(let i = 0; i < 4; i++) {
        let arr = [getMsg("point"), getMsg("coords"), getMsg("angle"), getMsg("length")];
        let th = document.createElement("th");
        $(th).attr("scope", "col");
        $(th).text(arr[i]);
        $(trHead).append(th);
    }

    $(thead).append(trHead);
    $(table).append(thead);

    let tbody = document.createElement("tbody");

    let line = document.createElement("tr");
    
    //Point
    let pointTH = document.createElement("th");
    $(pointTH).attr("scope", "row");
    $(line).append(pointTH);

    let pointDIV = document.createElement("div");
    $(pointDIV).addClass("form-group");
    $(pointTH).append(pointDIV);

    let pointINPUT = document.createElement("input");
    $(pointINPUT).addClass("form-control");
    $(pointINPUT).attr("type", "text");
    $(pointINPUT).attr("placeholder", getMsg("point"));
    $(pointINPUT).attr("id", "inputDefault");
    $(pointDIV).append(pointINPUT);

    //Coords
    let coordTD = document.createElement("td");
    $(line).append(coordTD);

    let coordDIV = document.createElement("div");
    $(coordDIV).addClass("form-group");
    $(coordTD).append(coordDIV);

    let coordINPUT = document.createElement("input");
    $(coordINPUT).addClass("form-control");
    $(coordINPUT).attr("type", "text");
    $(coordINPUT).attr("placeholder", getMsg("coords"));
    $(coordINPUT).attr("id", "inputDefault");
    $(coordINPUT).val(Math.round(mouse.x) + "," + Math.round(mouse.y));
    $(coordINPUT).attr("disabled", "");
    $(coordDIV).append(coordINPUT);

    //Angle
    let angleTD = document.createElement("td");
    $(line).append(angleTD);

    let angleDIV = document.createElement("div");
    $(angleDIV).addClass("form-group");
    $(angleTD).append(angleDIV);

    let angleINPUT = document.createElement("input");
    $(angleINPUT).addClass("form-control");
    $(angleINPUT).attr("type", "text");
    $(angleINPUT).attr("placeholder", getMsg("angle"));
    $(angleINPUT).attr("id", "inputDefault");
    $(angleINPUT).attr("disabled", "");
    $(angleDIV).append(angleINPUT);

    //Length
    let lengthTD = document.createElement("td");
    $(line).append(lengthTD);

    let lengthDIV = document.createElement("div");
    $(lengthDIV).addClass("form-group");
    $(lengthTD).append(lengthDIV);

    let lengthINPUT = document.createElement("input");
    $(lengthINPUT).addClass("form-control");
    $(lengthINPUT).attr("type", "text");
    $(lengthINPUT).attr("placeholder", getMsg("length"));
    $(lengthINPUT).attr("id", "inputDefault");
    $(lengthINPUT).attr("disabled", "");
    $(lengthDIV).append(lengthINPUT);

    $(tbody).append(line);

    let trBody = document.createElement("tr");
    let thBody = document.createElement("th");
    $(thBody).attr("scope", "row");
    $(trBody).append(thBody);

    for(let i = 0; i < 3; i++) {
        let arr = [getMsg("add_point"), getMsg("delete_point"), getMsg("create_shape")];
        let td = document.createElement("th");
        let button = $(document.createElement("button")).on("click", function() {
            if(i == 0) addPointLine(this);
            if(i == 1) deletePointLine();
            if(i == 2) {
                let instr = getDataFromCustomRefractorCreator();
                let path = customRefractor(instr);
                if(path.length != 0) {
                    objs.push({type: 'refractor', path: path, notDone: false, p: 1.5, group: [], selected: false});
                    draw();
                    $("#customRefractor").remove();
                } 
            }
        });
        $(button).attr("type", "button");
        $(button).addClass("btn btn-primary");
        $(button).text(arr[i]);
        $(td).append(button);
        $(trBody).append(td);
    }

    $(tbody).append(trBody);
    $(table).append(tbody);

    $(div).append(table);
    $("body").append(div);
}

function displayRefractorModal() {
    $("#customRefractor").dialog({
        width: 650,
        title: getMsg("create_refractor"),
        modal: true,
        close: function(e, ui) {
            $("#customRefractor").remove();
        },
        buttons: {"Ok": function(t) {
                let instr = getDataFromCustomRefractorCreator();
                let path = customRefractor(instr);
                if(path.length != 0) {
                    objs.push({type: 'refractor', path: path, notDone: false, p: 1.5, group: [], selected: false});
                    draw();
                    $("#customRefractor").remove();
                } 
            }, "Cancel": function(t) {
                $("#customRefractor").remove();
            }
        }
    });
}

function createText() {
    /*
    <div id="createText">
        <label for="textInput">Entrez votre texte : </label>
        <div class="form-group"><input type="text" class="form-control" placeholder="Coordonnées" id="inputDefault"></div>
        <button id="deleteFieldText">Effacer</button>
    </div>
    */

    let div = document.createElement("div");
    cancelKeyEvent(div);
    $(div).attr("id", "createText");
    let label = document.createElement("label");
    $(label).attr("for", "textInput");
    $(label).text(getMsg("enter_text"));

    let divInput = document.createElement("div");
    $(divInput).addClass("form-group");
    let input = document.createElement("input")
    $(input).addClass("form-control");
    $(input).attr("type", "text");
    $(input).attr("id", "choosetextInput");
    $(divInput).append(input);

    $(div).append(label);
    $(div).append(divInput);
    $("body").append(div);
}

function displayText() {
    $("#createText").dialog({
        width: 500,
        maxHeight: 300,
        title: getMsg("choose_text"),
        modal: true,
        close: function(e, ui) {
            $("#createText").remove();
        },
        buttons: {"Ok": function(t) {
            let choosenText = $("#choosetextInput").val();
            if(Boolean(choosenText)) {
                text = choosenText;
                $("#createText").remove();
            }
        }, "Cancel": function(t) {
            $("#createText").remove();
        }
        }
      });
}

function createModalProperties(element) {
  /* 
      <div id="elementInGr">
          <table>
              <thead>
                  <tr>
                      <td>Type</td><td>Indice de refraction</td>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Halfplane</td><td>1,5</td>
                  </tr>
              </tbody>
          </table>
      </div>
  */

  let div = document.createElement('div');
  cancelKeyEvent(div);
  $(div).attr("id", "elementInGr");
  $(div).css("display","none");
  let table = document.createElement('table');
  let thead = document.createElement('thead');
  let trH = document.createElement('tr');
  $(trH).addClass("table-primary");

  let type = document.createElement('td');
  $(type).text(getMsg("type"));
  let indice = document.createElement('td');
  $(indice).text(getMsg("properties"));
  $(trH).append(type); $(trH).append(indice);

  $(thead).append(trH);
  $(table).append(thead);

  let tbody = document.createElement('tbody');
  if(element[0] != undefined) {
    for(let i = 0; i < element[0].length; i++) {
        let tr = document.createElement('tr');
        for(let j = 0; j < 2; j++) {
            let td = document.createElement('td');
            if(j == 0) $(td).text(getMsg("tool_" + element[0][i].type));
            if(j == 1) $(td).text(element[0][i].p);
            $(tr).append(td);
        }
        $(tbody).append(tr);
    }
  }
  $(table).append(tbody);
  $(div).append(table);
  $("body").append(div);
}

function createGroupPanel() {
  /*
  <div id="sideMultipleGroup">
      <table>
          <thead>
              <tr class="table-primary">
                  <td>Nom</td><td>Supprimer</td><td>Selectionner</td>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td colspan=3><button type="button" class="btn btn-outline-primary btn-sm">Jonquille</button></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Jonquille</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Rose</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Tulipe</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Hibiscus</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Sakura</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
              <tr>
                  <td><button type="button" class="btn btn-outline-primary btn-sm">Bouton d'or</button></td>
                  <td><button type="button" class="btn btn-primary btn-sm" id="deleteGr">Supprimer</button></td>
                  <td><input type="radio" name="multipleGr"></td>
              </tr>
          </tbody>
      </table>
  </div> 
  */

  let div = document.createElement("div");
  cancelKeyEvent(div);
  $(div).attr("id", "sideMultipleGroup");
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tr1 = document.createElement("tr");
  $(tr1).addClass("table-primary");
  for(let indexTR1 = 0; indexTR1 < 3; indexTR1++) {
      let td1 = document.createElement("td");
      if(indexTR1 == 0) $(td1).text(getMsg("name"));
      if(indexTR1 == 1) $(td1).text(getMsg("delete"));
      if(indexTR1 == 2) $(td1).text(getMsg("select"));
      $(tr1).append(td1);
  }
  $(thead).append(tr1);
  $(table).append(thead);

  let tbody = document.createElement("tbody");

  let ungroupTR = document.createElement("tr");
  let ungroupTD = document.createElement("td");
  let ungroupButton = document.createElement("button");
  $(ungroupButton).attr("type", "button");
  $(ungroupButton).addClass("btn btn-outline-primary btn-sm");
  $(ungroupButton).text(getMsg("unselect"));
  $(ungroupTD).append(ungroupButton);
  $(ungroupTD).attr("colspan", "3");
  $(ungroupTD).attr("id", "ungroup");
  $(ungroupTR).append(ungroupTD); $(tbody).append(ungroupTR);

  for(let indexTR2 = 0; indexTR2 < selectGr.length; indexTR2++) {
      let tr = document.createElement("tr");
      for(let indexTD1 = 0; indexTD1 < 3; indexTD1++) {
          let td = document.createElement("td");
          let el;
          if(indexTD1 == 0) {
              el = document.createElement("button");
              $(el).attr("type", "button");
              $(el).addClass("btn btn-outline-primary btn-sm");
              $(el).text(selectGr[indexTR2].name);
          }
          if(indexTD1 == 1) {
              el = document.createElement("button");
              $(el).attr("type", "button");
              $(el).attr("id", "deleteGr");
              $(el).addClass("btn btn-primary btn-sm");
              $(el).text(getMsg("delete"));
          }
          if(indexTD1 == 2) {
              el = document.createElement("input");
              $(el).attr("type", "radio");
              $(el).attr("name", "multipleGr");
              if(currentSelectedGr[0] != undefined)
              if(currentSelectedGr[0].name == selectGr[indexTR2].name)
              $(el).attr("checked", "true")
          }
          $(td).append(el);
          $(tr).append(td);
      }
      $(tbody).append(tr);
  }
  $(table).append(tbody);
  $(div).append(table);
  $("body").append(div);

  //Name button
  addDisplayElementsListenerForGroup();

  //Delete button
  addDeleteListenerForGroup();

  //Select radio button
  addSelectListenerForGroup();
}

function addDisplayElementsListenerForGroup() {
    $("#sideMultipleGroup tbody tr td:first-child button").on("click", function () {
        if ($(this).parent().attr("id") == "ungroup")
            return;
        let group = $(this).text();
        let currentElementArray = [];
        for (c of selectGr) {
            if (group == c.name)
                currentElementArray.push(c.elements);
        }

        createModalProperties(currentElementArray);
        $("#elementInGr").dialog({
            title: group,
            modal: true,
            close: function (e, ui) {
                $("#elementInGr").remove();
            }
        });

    });
}

function addSelectListenerForGroup() {
    $("#sideMultipleGroup tbody tr td:last-child").on("click", function () {
        if (this.id == "ungroup") {
            isMovingMultipleObject = false;
            isSettingRotationPoint = false;
            currentSelectedGr = [];
            for (r of $(this).parent().parent().find("tr")) {
                $(r).children().eq(2).children().prop("checked", false);
            }
            return;
        }
        $(this).children().prop("checked", true);
        let group = $(this).prev().prev().text();
        isMovingMultipleObject = true;
        currentSelectedGr = [];
        for (c of selectGr) {
            if (group == c.name) {
                currentSelectedGr.push(c);
            }
        }
    });
}

function addDeleteListenerForGroup() {
    $("#sideMultipleGroup tbody button#deleteGr").on("click", function () {
        //Unselect
        isMovingMultipleObject = false;
        currentSelectedGr = [];
        for (r of $(this).parent().parent().find("tr")) {
            $(r).children().eq(2).children().prop("checked", false);
        }
        //Delete
        let groupTD = $(this).parent().prev();
        let group = $(groupTD).text();
        $(groupTD).parent().remove();
        for(c of selectGr) {
            if(c.name == group) {
                for(e of c.elements) {
                    for(let ig = 0; ig < e.group.length; ig++) {
                        if(e.group[ig] == group) e.group.splice(ig, 1);
                    }
                }
            }
        }
        for (let spliceEl = 0; spliceEl < selectGr.length; spliceEl++) {
            if(group == selectGr[spliceEl].name)
                selectGr.splice(spliceEl, 1);
        }
    });
}

function addSelectedToAll(group) {
    for(c of selectGr) if(c.name == group) {addGroupToGivenGroup(group); return}
    for(c of currentSelectedGr) c.group.push(group);
    selectGr.push({"name":group, "elements":currentSelectedGr});
    isMovingMultipleObject = true;
    currentSelectedGr = [];
    for(c of selectGr) if(group == c.name) currentSelectedGr.push(c);
}

function addGroupToGivenGroup(group) {
    for(g of selectGr) if(g.name == group) for(c of currentSelectedGr) if(!g.elements.includes(c)) g.elements.push(c);
    for(c of currentSelectedGr) if(!c.group.includes(group)) c.group.push(group);
    isMovingMultipleObject = true;
    currentSelectedGr = [];
    for(c of selectGr) if(group == c.name) currentSelectedGr.push(c);
}

function createGroupNamer() {
    /*
    <div id="groupName">
        <label for="inputName">Entrer le nom du groupe :</label>
        <div class="form-group"><input type="text" class="form-control" id="inputName"></div>

        <div class="form-group">
            <label for="inputGroup" class="form-label mt-4">Ajouter</label>
            <select class="form-select" id="inputGroup">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
            </select>
        </div>
    </div>
    */

    let group = document.createElement('div');
    cancelKeyEvent(group);
    $(group).attr("id", "groupName");

    let label = document.createElement('label');
    $(label).attr("for", "inputName");
    $(label).text(getMsg("enter_groupname"));
    $(group).append(label);

    let divInput = document.createElement("div");
    $(divInput).addClass("form-group");

    let input = document.createElement("input");
    $(input).addClass("form-control");
    $(input).attr("type", "text");
    $(input).attr("id", "inputName");
    $(divInput).append(input);
    $(group).append(divInput);

    let divSelect = document.createElement("div");
    $(divSelect).addClass("form-group");

    let labelS = document.createElement('label');
    $(labelS).attr("for", "inputGroup");
    $(labelS).addClass("form-label mt-4");
    $(labelS).text(getMsg("addto_existingfile"));
    $(divSelect).append(labelS);

    let select = document.createElement('select');
    $(select).attr("id", "inputGroup");
    $(select).addClass("form-select");
    let option = document.createElement("option");
    $(option).attr("value", "");
    $(option).text("--" + getMsg("choose") + "--");
    $(select).append(option);
    for(g of selectGr) {
        option = document.createElement("option");
        $(option).attr("value", g.name);
        $(option).text(g.name);
        $(select).append(option);
    }
    $(divSelect).append(select);
    $(group).append(labelS);
    $(group).append(divSelect);
    $("body").append(group);
}

function cauchyPanel() {
    createCauchyPanel();
    displayCauchyPanel();
}

function createCauchyPanel() {
    /* 
    <div id="cauchy">
        <table class="table table-hover">
            <thead>
            <tr>
                <td colspan="3"><button type="button" class="btn btn-primary">Loi de cauchy</button></td>
            </tr>
            <tr>
                <th scope="col">Milieu</th>
                <th scope="col">Coefficient A</th>
                <th scope="col">Coefficient B</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>
                    <div class="form-group">
                        <select class="form-select" id="environment">
                            <option>Personnalisé</option>
                            <option>Air</option>
                            <option>Eau</option>
                            <option>Plexiglas</option>
                        </select>
                    </div>
                </td>
                <td><div class="form-group"><input type="text" class="form-control" placeholder="A (sans dimension)" id="coefficient_A"></div></td>
                <td><div class="form-group"><input type="text" class="form-control" placeholder="B (en µm²)" id="coefficient_B"></div></td>
            </tr>
            </tbody>
        </table>
    </div>
    */

    let cauchy = document.createElement("div");
    cancelKeyEvent(cauchy);
    $(cauchy).attr("id", "cauchy");

    let table = document.createElement("table");
    $(table).addClass("table table-hover");

    let thead = document.createElement("thead");

    let trButton = document.createElement("tr");
    let tdButton = document.createElement("td");
    $(tdButton).attr("colspan", "3");
    $(tdButton).css("text-align", "center");
    let button = $(document.createElement("button")).on("click", function() {
        if(isCauchyActive) {
            isCauchyActive = false
            $(tbody).hide();
        }
        else {
            isCauchyActive = true;
            $(tbody).show();
        } 
    });
    $(button).attr("type", "button");
    $(button).addClass("btn btn-primary");
    $(button).text(getMsg("cauchy"));
    $(tdButton).append(button); $(trButton).append(tdButton); $(thead).append(trButton);
    
    let trHead = document.createElement("tr");

    let thMilieu = document.createElement("th");
    $(thMilieu).attr("scope", "col");
    $(thMilieu).text(getMsg("environment"));
    $(trHead).append(thMilieu);

    let thCoefA = document.createElement("th");
    $(thCoefA).attr("scope", "col");
    $(thCoefA).text(getMsg("A_coefficient"));
    $(trHead).append(thCoefA);

    let thCoefB = document.createElement("th");
    $(thCoefB).attr("scope", "col");
    $(thCoefB).text(getMsg("B_coefficient"));
    $(trHead).append(thCoefB);

    $(thead).append(trHead); $(table).append(thead);

    let tbody = document.createElement("tbody");
    if(isCauchyActive) $(tbody).show();
    else $(tbody).hide();

    let trBody = document.createElement("tr");

    let tdSelect = document.createElement("td");

    let divSelect = document.createElement("div");
    $(divSelect).addClass("form-group");

    let select = $(document.createElement("select")).on("change", function() {
        let value = $(this).val();
        if(value != environment[0]) {
            $(inputCoeffA).val(environment_coefficient[value]["A"]);
            $(inputCoeffB).val(environment_coefficient[value]["B"]);
            A_cauchy_coefficient = environment_coefficient[value]["A"];
            B_cauchy_coefficient = environment_coefficient[value]["B"];
        }
    });
    $(select).attr("environment");
    $(select).addClass("form-select");

    let environment = Object.keys(environment_coefficient);
    environment.splice(0, 0, "custom");
    //["custom", "air", "water", "flint glass", "crown glass", "plexiglas", "diamond"];
    for(e of environment) {
        let option = document.createElement("option");
        $(option).attr("value", e);
        $(option).text(getMsg(e));
        $(select).append(option);
    }

    $(divSelect).append(select); $(tdSelect).append(divSelect); $(trBody).append(tdSelect); 

    let tdCoeffA = document.createElement("td");

    let divCoeffA = document.createElement("div");
    $(divCoeffA).addClass("form-group");

    let inputCoeffA = $(document.createElement("input")).on("input", function() {
        let value = $(this).val();
        $(select).val("custom");
        A_cauchy_coefficient = Number.parseFloat(value);
    });
    $(inputCoeffA).attr("type", "text");
    $(inputCoeffA).attr("id", "coefficient_A");
    $(inputCoeffA).attr("placeholder", getMsg("A_coefficient_details"));
    $(inputCoeffA).val(A_cauchy_coefficient);
    $(inputCoeffA).addClass("form-control");

    $(divCoeffA).append(inputCoeffA); $(tdCoeffA).append(divCoeffA); $(trBody).append(tdCoeffA);

    let tdCoeffB = document.createElement("td");

    let divCoeffB = document.createElement("div");
    $(divCoeffB).addClass("form-group");

    let inputCoeffB = $(document.createElement("input")).on("input", function() {
        let value = $(this).val();
        $(select).val("custom");
        B_cauchy_coefficient = Number.parseFloat(value);
    });;
    $(inputCoeffB).attr("type", "text");
    $(inputCoeffB).attr("id", "coefficient_B");
    $(inputCoeffB).attr("placeholder", getMsg("B_coefficient_details"));
    $(inputCoeffB).val(B_cauchy_coefficient);
    $(inputCoeffB).addClass("form-control");

    for(e of environment) {
        if(e != "custom") if(environment_coefficient[e]["A"] == $(inputCoeffA).val() && environment_coefficient[e]["B"] == $(inputCoeffB).val())
        $(select).val(e);
    }

    $(divCoeffB).append(inputCoeffB); $(tdCoeffB).append(divCoeffB); $(trBody).append(tdCoeffB);

    $(tbody).append(trBody);

    $(table).append(thead); $(table).append(tbody);

    $(cauchy).append(table);

    $("body").append(cauchy);

}

function displayCauchyPanel() {
    $("#cauchy").dialog({
        width: 500,
        height: 300,
        title: getMsg("cauchy"),
        modal: true,
        close: function(e, ui) {
            $("#cauchy").remove();
        },
        buttons: {"Ok": function(t) {
            draw();
            if(isCauchyActive) {
                $("#objAttr_range").attr("disabled", "");
                $("#objAttr_range").val(1.5);
                $("#objAttr_text").attr("disabled", "");
                $("#objAttr_text").val("1.5");
            } 
            else {
                $("#objAttr_range").removeAttr("disabled");
                $("#objAttr_text").removeAttr("disabled");
            } 
            $("#cauchy").remove();
        }, "Cancel": function(t) {
            $("#cauchy").remove();
        }
        }
      });
}

$(document).ready(function(e) {
  $(document).on("keyup", function(e) {
      if(!isSelectingMultipleObject) return
      if(e.which != 17) return
      if(currentSelectedGr.length == 0) return
      //Here, CTRL is realeased and there is at least 2 objects in the group
      isSelectingMultipleObject = false;
      createGroupNamer();
      $("#groupName").dialog({
        width: 500,
        maxHeight: 300,
        title: getMsg("create_group"),
        modal: true,
        close: function(e, ui) {
            $("#groupName").remove();
            currentSelectedGr = [];
        },
        buttons: {"Ok": function(t) {
            let group = $("#inputName").val();
            if(Boolean(group)) addSelectedToAll(group);
            else {
                group = $("#inputGroup").val();
                if(Boolean(group)) addGroupToGivenGroup(group);
            }
            if(Boolean(group)) $("#groupName").remove();
        }, "Cancel": function(t) {
            currentSelectedGr = [];
            $("#groupName").remove();
        }
        }
      });
  });

  /* Open dropdown menu on mouse hover. */
  $(".dropdown-toggle").mouseenter(function () {
    $(this).find(".dropdown-menu").show();
  }).mouseleave(function () {
    $(this).find(".dropdown-menu").hide();
  });
  /* Simulate click on parent radio when dropdown menu item clicked. */
  $(".dropdown-menu > div > label").click(function (e) {
    $(this).parent().parent().prev().click();
    $(this).parent().parent().hide();
    e.stopPropagation();
  });

  /* Initialize Bootstrap Popover */
  $("[data-toggle=popover]").popover();

})