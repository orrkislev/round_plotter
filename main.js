stepsInFrame = 10
function setup() {
    initP5(true)
    initPaper(false)

    penPosition = 100
    penDown = true
    paperRot = 0
    running = true

    paper = createGraphics(width, height)
    paper.background(255)
    paper.translate(width / 2, height / 2)
    paper.angleMode(DEGREES)
    paper.imageMode(CENTER)
    paper.stroke(0, 100)

    var GUI = lil.GUI;
    gui = new GUI()
    gui.domElement.style.width = '400px'
    document.head.innerHTML += '<style>.lil-gui .controller>.name{min-width: unset !important; width: 100px;}</style>'

    

    guiData = {
        run: true,
        rotFunction: 'time / 5',
        penFunction: 'sin( time / 6)',
        update: updateGui
    }
    updateGui()
    
    runController = gui.add( guiData, 'run' ).onChange( value => {
        if (value) {
            running = true
            loop()
        } else {
            running = false
            noLoop()
        }
    } );
    gui.add( guiData, 'rotFunction' )
    gui.add( guiData, 'penFunction' )
    gui.add( guiData, 'update' )    

    circleSize = min(width, height) * .9
}

function updateGui(){
    eval('paperRotFunc = () => ' + guiData.rotFunction)
    eval('penFunc = () => ' + guiData.penFunction)
    paper.background(255)
    allPoints = []
    time = 0
    lastPos = null
}

allPoints = []

function keyPressed() {
    if (key == ' ') {
        running = !running
        if (running) loop()
        else noLoop()
        guiData.run = running
        runController.updateDisplay()
    }
    if (key == 's') {
        // save svg
        const w = round(width)
        const h = round(height)
        allPoints = allPoints.map(p => [p[0] + w / 2, p[1] + h / 2])
        let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`
        svg += '<path d="M ' + allPoints[0].join(' ')
        for (let i = 0; i < allPoints.length; i++) {
            svg += 'L ' + allPoints[i].join(' ')
        }
        svg += '" stroke="black" fill="none"/></svg>'
        saveStrings([svg], 'plotter.svg')
    }
}

let time = 0
function draw() {
    background(220)
    for (i = 0; i < stepsInFrame; i++) drawOnPaper()
    drawPaper()
    drawPen()
}

let lastPos
function drawOnPaper() {
    time++
    // penPosition = ((sin(step / 5) + 1) / 2) ** 3 / 2 + ((cos(step / 3) + 1) / 2) ** 3 / 2
    // penPosition *= height * .1
    // penPosition += height / 2
    // penPosition += noise(step / 1000) * 5

    penPosition = penFunc() * circleSize / 2 + height / 2
    paperRot = paperRotFunc()


    // paperRot += Math.sign(noise(frameCount / 10)-.5) * .5
    // paperRot += (sin(step / 10) - cos(step / 9)) * .1
    // paperRot += .2
    // paperRot = sin(step) * (12 + step / 1000)


    if (penDown) {
        paper.resetMatrix()
        paper.translate(width / 2, height / 2)
        const offset = -height / 2 + penPosition
        const newPos = createVector(0, offset)
        newPos.rotate(-paperRot)
        if (lastPos) {
            // paper.strokeWeight(noise(frameCount / 30) * 2)
            paper.line(newPos.x, newPos.y, lastPos.x, lastPos.y)
        }
        lastPos = newPos
        allPoints.push([newPos.x, newPos.y])
    }
}


function drawPaper() {
    push()
    beginClip()
    circle(width / 2, height / 2, circleSize)
    endClip()


    translate(width / 2, height / 2)
    rotate(paperRot)
    imageMode(CENTER)
    image(paper, 0, 0)

    pop()
}

function drawPen() {
    // stroke(0,30)
    // for (let y=0;y<height;y+=30){
    //     line(width/2,y,width/2,y+10)
    // }
    push()
    fill(100)
    noStroke()
    translate(width / 2, penPosition)
    rotate(20 + penPosition / 10)
    rect(-5, -10, 10, -1000)
    triangle(-5, -10, 0, 0, 5, -10)
    pop()
}