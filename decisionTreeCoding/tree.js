///ddd = drag dropdown direct
const BLOCKTYPE_BODY= 0;
const BLOCKTYPE_END = 1;
const BLOCKTYPE_START = 2; 

const NODETYPE_PARENT = 3;
const NODETYPE_YES = 4;
const NODETYPE_NO = 5;

const HIGHLIGHT = "3px";
const NOHIGHLIGHT = "1px"

const OPTIONS = new Map([
  [BLOCKTYPE_START, ["are we there yet"]],
  [BLOCKTYPE_BODY, ["obstacle on left?", "obstacle on right?"]],
  [BLOCKTYPE_END, ["move left", "move right", "stop"]]
]);

let curWaiting = null;
let connections = [];

class Node{
  constructor(parent_id, type){
    this.type = type;

    this.parent_id = parent_id;
    this.line_id = null;
    if(type == NODETYPE_PARENT)this.id = (parent_id + "_parent");
    else if (type == NODETYPE_YES) this.id = (parent_id + "_yes");
    else this.id = (parent_id + "_no");

    this.element = document.getElementById(this.id);
    this.isSelected = false;

    this.partner = null;

    //this.value = null; TODO if code is used (store selected dropdown value qn)
  }
}

class block {
  constructor(id, type) {
    this.id = "";
    this.type = type;
    this.element = document.getElementById(id);
    this.moverElement = document.getElementById(id + "_mover");

    this.parentNode = new Node (id, NODETYPE_PARENT); 
    this.noNode = new Node (id, NODETYPE_NO); 
    this.yesNode = new Node (id, NODETYPE_YES); 

    if(type == BLOCKTYPE_BODY){
      this.optionsArray = [("Option1"+id), ("Option2" + id)];
    }else if (type == BLOCKTYPE_START){
      this.optionsArray = ["Option.Start1", "Option Start2"];
    }else if (type == BLOCKTYPE_END){
      this.optionsArray = ["Option End1", "Option End2"];
    }
    
  }
}


// let //can reval but not redeclare (var can be redeclared accidentally), const is ur normal let


function make_ddd(id, blocktype = BLOCKTYPE_BODY){;
  let optionsArray = OPTIONS.get(blocktype); //setting blocktype = default BLOCKTYPE_BODY makes this undefined?
;  let div = Object.assign(document.createElement("div"), { id, className: "draggable-select" });

  if(blocktype != BLOCKTYPE_START) {
    let d = Object.assign(document.createElement("div"), {id: id+"_parent", className: "parent-node" });
    d.textContent = "then"
    div.append(d);
  }

  d = Object.assign(document.createElement("div"), {id: id+"_mover", className: "mover" });
  d.textContent = "move"
  div.append(d);

  let div_dropdown = Object.assign(document.createElement("div"), {id:(id+"_dropdown")});
    let sel = document.createElement("select");
    for(var i = 0; i < optionsArray.length; i++){
      let opt = document.createElement("option");
      opt.value = optionsArray[i];
      opt.textContent = optionsArray[i];
      sel.appendChild(opt);
    }
  div_dropdown.append(sel) // select
  div.append(div_dropdown);

  if(blocktype != BLOCKTYPE_END){
    d = Object.assign(document.createElement("div"), {id: id+"_no", className: "no-node" });
    d.textContent = "no";
    div.append(d);
    d = Object.assign(document.createElement("div"), {id: id+"_yes", className: "yes-node" });
    d.textContent = "yes";
    div.append(d);
  }
  
  document.body.append(div);
}

// const $line = $("#line"); //ie. id "line"

function update_line(node){
  if(node.partner != null && node.line_id != null) { //update
    let $line = $("#" + node.line_id);

    parent_node = (node.type == NODETYPE_PARENT)? node : node.partner;
    child_node = (node.type == NODETYPE_PARENT)? (node.partner) : node;

    let rect = parent_node.element.getBoundingClientRect()
    let x1 = rect.left + rect.width / 2;
    let y1 = rect.top;

    rect =  child_node.element.getBoundingClientRect();
    let x2 = rect.left + rect.width / 2;
    let y2 = rect.top + rect.height; 

    var length = Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    var transform = 'rotate(' + angle + 'deg)';

    offsetX = (x1 > x2) ? x2 : x1;
    offsetY = (y1 > y2) ? y2 : y1;
    
    $line.css({
        'position': 'absolute',
        '-webkit-transform': transform,
        '-moz-transform': transform,
        'transform': transform
      })
      .width(length)
      .offset({
        left: offsetX,
        top: offsetY
    });
  }
  // else console.log("partner or line does not exist");
}

function create_line(node){
  const newLine = document.createElement("div");
  newLine.id = node.id + "_line";
  newLine.style.position = "absolute";
  newLine.style.height = "2px"; // Thin horizontal line
  newLine.style.backgroundColor = "black";
  newLine.style.transformOrigin = "0 0"; // So rotation pivots from top-left

  newLine.id = node.id+"_line";

  node.line_id = newLine.id;
  node.partner.line_id = newLine.id;

  document.body.appendChild(newLine); //line now exists

  console.log(node.line_id + node.partner);
  update_line(node)
}

function destroy_line(node){
  let line_id = node.id+"_line";
  if(document.getElementById(line_id) == null) line_id = node.partner.id +"_line";
  let line = document.getElementById(line_id);

  line.remove();
  node.partner.line_id = null;
  node.line_id = null;
}

function select_init(node){ 

  //block.nodetype is selected = false and true
  (node.element).addEventListener("mousedown", (e) => {
    if(!node.isSelected){
      if(curWaiting === null){
        curWaiting = node;
        node.isSelected = true;
        node.element.style.borderWidth = HIGHLIGHT;

      }else{ 
        if((curWaiting.parent_id != node.parent_id) && //can match 
         (((curWaiting.type === NODETYPE_PARENT) && (node.type === NODETYPE_NO || node.type === NODETYPE_YES)) || 
          ((curWaiting.type === NODETYPE_NO || curWaiting.type === NODETYPE_YES) && node.type === NODETYPE_PARENT))){
            //valid match
            node.isSelected = true;
            node.partner = curWaiting;
            node.element.style.borderWidth = HIGHLIGHT;

            curWaiting.partner = node;
            curWaiting = null;

            create_line(node);
        }
      }
    } else { //node was selected
      if(curWaiting == node){ //it is the waiting node
        // console.log("waiting undone" + node.id);
        node.isSelected = false;
        curWaiting = null;
        node.element.style.borderWidth = NOHIGHLIGHT;

      } else { //it was paired (unpair)
        // console.log("paired" + node.id + node.partner.element.id);
        
        destroy_line(node);
        node.element.style.borderWidth = NOHIGHLIGHT;
        node.partner.element.style.borderWidth = NOHIGHLIGHT;

        node.isSelected = false;
        node.partner.isSelected = false;

        node.partner.partner = null;
        node.partner = null;
      }
    }
  });
}



function ddd_init(block){
  let hasParent = (block.type == BLOCKTYPE_START)? false : true;
  let hasKids = (block.type == BLOCKTYPE_END)? false: true;

  // init dragging
  let moveTarget = block.element;//document.getElementById(id); // the whole thing
  let dragTarget = block.moverElement;// document.getElementById(id+"_mover");
  let isDragging = false;
  let offsetX, offsetY;

  dragTarget.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - moveTarget.offsetLeft;//dragTarget.offsetLeft;
    offsetY = e.clientY - moveTarget.offsetTop;//dragTarget.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      moveTarget.style.left = e.clientX - offsetX + "px";
      moveTarget.style.top = e.clientY - offsetY + "px";

      update_line(block.parentNode);
      update_line(block.noNode);
      update_line(block.yesNode);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  //init yes no parent selection
  if(hasParent){
    select_init(block.parentNode);
  }

  if(hasKids){
    select_init(block.noNode);
    select_init(block.yesNode);
  }
}

//eg.
function make_block(id, blocktype){
  make_ddd(id, blocktype);
  const blocke = new block(id, blocktype);
  ddd_init(blocke);
}

make_block("head", BLOCKTYPE_START);

make_block("block1", BLOCKTYPE_BODY);
make_block("block2", BLOCKTYPE_BODY);

make_block("end1", BLOCKTYPE_END);
make_block("end2", BLOCKTYPE_END);
make_block("end3", BLOCKTYPE_END);
make_block("end4", BLOCKTYPE_END);
