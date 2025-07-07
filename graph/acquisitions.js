
function handleClick() {
    const degree = document.getElementById('degree').value;
    plotLeastSquares(degree)
    console.log(degree)
}

function plotLeastSquares(degree) {
    plotPolynomial(degree)
}


let input = document.getElementById('degree');
input.addEventListener('keydown', function (e) {
    // only allow strictly numeric input
  if (["e", "E", "+", "-"].includes(e.key)) {
    e.preventDefault();
  }
}
)

document.getElementById("submit_button").addEventListener("click", handleClick);

document.getElementById("plot").addEventListener("click",addDataPoint);

function addDataPoint() {
    console.log("clicked")
}



const data_scatter = [
    {x:4,y:3},
    {x:-2,y:7},
    {x:-5,y:9},
    {x:7,y:17},
    {x:5,y:4}
  ];

const chart = new Chart(
    document.getElementById('plot'),
    {
      type: 'scatter',
      data: {
        labels: data_scatter.map(row => row.x),
        datasets: [
          {
            label: 'data',
            data: data_scatter.map(row => row.y)
          }
        ]
      },
      options: {
        events: [],
        scales: {
             x: {
                type: 'linear',
                    min: -10,  
                    max: 10,   
            },
            y: {
                min: 0,    
                max: 20,    
            }
            
        }
    }
    }
  );

function smallQ(Q,degree) {
    let J = math.transpose(Q)
    J = J.slice(0,(Number(degree)+1))
    J = math.transpose(J)
    return J
}

function polyCalc(x,degree) {
    // need to make this not hardcoded, takes data from the graph
    let m = []
    let x_data = [4,-2,-5,7,5]

    for (let i =0; i<=4; i++){
        let number = x_data[i]
        var new_row = []
        for (let j = 0; j <= degree; j++) {
            new_row.push(number**j)
        }
        m.push(new_row)
    }

    const y = [3,7,8,17,4] 
    const result = math.qr(m) // returns full QR so we need to convert Q/R matrices
    const R = result.R.slice(0,(Number(degree)+1))
    let Q = smallQ(result.Q,degree)
    let coefficients = math.multiply(math.inv(R),math.multiply(math.transpose(Q),y))
    console.log(coefficients)
    let total = 0;
    let exponented = 1;
    for (let k = 0; k<=degree; k++) {
        total += coefficients[k] * exponented
        exponented *= x
    }
    return total
}

function plotPolynomial(degree) {
    const dataPoints = [];
    for (let x = -10; x <= 10; x+=0.05) {
    dataPoints.push({ x: x, y: polyCalc(x,degree) });
    }

    chart.data.datasets.push({
    showLine : true,
    data: dataPoints,
    borderColor: 'green',
    fill: false,
    pointRadius: 0,
    borderWidth: 2,
    });

    chart.update()
};


