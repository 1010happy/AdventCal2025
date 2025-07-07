///ddd = drag dropdown direct
const BLOCKTYPE_BODY= 0;
const BLOCKTYPE_END = 1;
const BLOCKTYPE_START = 2; 

const NODETYPE_PARENT = 3;
const NODETYPE_YES = 4;
const NODETYPE_NO = 5;

const HIGHLIGHT = "3px";
const NOHIGHLIGHT = "1px"

let curWaiting = null;
let connections = [];

class Node{
  constructor(parent_id, type){
    this.type = type;

    this.parent_id = parent_id;
    if(type == NODETYPE_PARENT)this.id = (parent_id + "_parent");
    else if (type == NODETYPE_YES) this.id = (parent_id + "_yes");
    else this.id = (parent_id + "_no");

    this.element = document.getElementById(this.id);
    this.isSelected = false;

    this.partner = null;
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

// function make_ddd(id, optionsArray){
//   let div = document.createElement("div")
//   div.id = id;
//   div.setAttribute("class", "draggable-select");
//   // dispatchEvent.classList.add("draggable-select"); //class

//   let sel = document.createElement("select");
//   div.appendChild(sel) // select
//   for(var i = 0; i < optionsArray.length; i++){
//     let opt = document.createElement("option");
//     opt.value = optionsArray[i];
//     opt.textContent = optionsArray[i];
//     sel.appendChild(opt);
//   }

//   document.body.appendChild(div);
// }


function highlight_init(node){

  //block.nodetype is selected = false and true
  (node.element).addEventListener("mousedown", (e) => {
    if(!node.isSelected){
      if(curWaiting === null){
        console.log("curWaiting set" + node.id);
        curWaiting = node;
        node.isSelected = true;
        node.element.style.borderWidth = "10px";//HIGHLIGHT;

      }else{ 
        console.log(curWaiting.parent_id + " " + node.parent_id);
        console.log(curWaiting.type + " " + node.type);
        if((curWaiting.parent_id != node.parent_id) && //can match 
         (((curWaiting.type === NODETYPE_PARENT) && (node.type === NODETYPE_NO || node.type === NODETYPE_YES)) || 
          ((curWaiting.type === NODETYPE_NO || curWaiting.type === NODETYPE_YES) && node.type === NODETYPE_PARENT))){
            console.log("paired" + node.id);
            //valid match
            node.isSelected = true;
            node.partner = curWaiting;
            node.element.style.borderWidth = HIGHLIGHT;

            curWaiting.partner = node;
            curWaiting = null;
        }
      }
    } else { //node was selected
      if(curWaiting == node){ //it is the waiting node
        console.log("waiting undone" + node.id);
        node.isSelected = false;
        curWaiting = null;
        node.element.style.borderWidth = NOHIGHLIGHT;

      } else { //it was paired
        console.log("paired" + node.id + node.partner.element.id);
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
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "auto";
  });

  //init yes no parent selection
  if(hasParent){
    highlight_init(block.parentNode);
  }

  if(hasKids){
    highlight_init(block.noNode);
    highlight_init(block.yesNode);
  }
}

//eg.
// make_ddd("block1", ["Apples", "Bananas", "Oranges"]);
// make_ddd("block2", ["Option A", "Option B", "Option C"]);
const block1 = new block("block1", BLOCKTYPE_BODY);
ddd_init(block1);
const block2 = new block("block2", BLOCKTYPE_BODY);
ddd_init(block2);
