
document.querySelectorAll('.node').forEach(initialise)

function initialise(node) {
    node.addEventListener("click", highlight);
}

var leftSelected = false;
var rightSelected = false;
var elemSelected = null;
const connections = [];

function addConnection(node1,node2,line_obj) {
    connections.push({
        node1 : node1,
        node2 : node2,
        line : line_obj
    })
}

function removeConnection(node1,node2) {
  const index = connections.findIndex(c =>
    (c.node1 === node1 && c.node2 === node2) || (c.node1 === node2 && c.node2 === node1)
  );

  if (index !== -1) {
    const connection = connections[index];
    connection.line.remove(); 
    connections.splice(index, 1);
  }
}

function checkIfConnection(node1,node2) {
    return connections.some(c =>
    (c.node1 === node1 && c.node2 === node2) || (c.node1 === node2 && c.node2 === node1)
  )
}

function alreadyUsed(node) {
    return connections.some(c => (c.node1 === node) || c.node2 === node)
}

function insertLine(first_dot,second_dot) {
let parent = elemSelected.parentNode
let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

line.setAttribute("x1", parseFloat(first_dot.getAttribute("cx")));
line.setAttribute("y1", parseFloat(first_dot.getAttribute("cy")));
line.setAttribute("x2", parseFloat(second_dot.getAttribute("cx")));
line.setAttribute("y2", parseFloat(second_dot.getAttribute("cy")));
line.setAttribute("stroke", "black");
line.setAttribute("stroke-width", "3");

parent.insertBefore(line, parent.firstChild);
addConnection(first_dot,second_dot,line);
}


function controlLine(target,className) {
    if ((leftSelected === true && rightSelected === false && className === "node rhs")
        || (rightSelected === true && leftSelected === false && className === "node lhs")) {
            if (checkIfConnection(elemSelected,target) === true) {
                removeConnection(elemSelected,target) 
        } else if (!alreadyUsed(elemSelected) && !alreadyUsed(target)) {
                insertLine(elemSelected,target);
        }
    }
}


function highlight(event) {

    let className = event.target.className.baseVal;

    // nothing has been selected yet
    if (leftSelected === false && rightSelected === false) {
        event.target.setAttribute("stroke-width", "3")
        elemSelected = event.target
        if (className === "node lhs") {
            leftSelected = true;
        } else {
                rightSelected = true;
        }

    // second node has now been selected
    } else {
            controlLine(event.target,className)
            rightSelected = false;
            leftSelected = false;
            elemSelected.setAttribute("stroke-width","0")
            elemSelected = null;
    }

}
