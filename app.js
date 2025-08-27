let boxes = document.querySelectorAll(".box");
let resetbtn = document.querySelector("#reset-btn");
let newgamebtn = document.querySelector("#new-btn");
let msgcontainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");


//for the game mode selection
let gameType = "quick"; // default mode
let oScore = 0;
let xScore = 0;

// let gameMode = "quick"; // default is quick mode
//handle mode switching
document.getElementById("Quick-Mode").addEventListener("click", () => {
    gameType = "quick";
    resetgame();
    document.getElementById("score-board").classList.add("hide"); // hide scoreboard in quick mode
});


// Display current mode message
const modeMsg = document.getElementById("mode-msg");

function updateModeMessage() {
    modeMsg.innerText = `Current mode: ${gameType.charAt(0).toUpperCase() + gameType.slice(1)}`;
}

// When switching modes
document.getElementById("Quick-Mode").addEventListener("click", () => {
    gameType = "quick";
    updateModeMessage();
    resetgame();
});

document.getElementById("Tournamnet").addEventListener("click", () => {
    gameType = "tournament";
    oScore = 0;
    xScore = 0;
    updateModeMessage();
    resetgame();
});

// Initialize message on page load
updateModeMessage();
// Event listener for tournament mode

document.getElementById("Tournamnet").addEventListener("click", () => {
    gameType = "tournament";
    oScore = 0;
    xScore = 0;
    resetgame();
    document.getElementById("score-board").classList.remove("hide"); // show scoreboard in tournament mode
    document.getElementById("score-o").innerText = oScore;
    document.getElementById("score-x").innerText = xScore;
});






// let gameMode = "bot"; // default is bot mode
let gameMode = "2player"; // default is two-player

let turn0 = true;
let count = 0;

// Event listener for mode selection
const modeSelect = document.querySelector("#mode-select");
if (modeSelect) {
    modeSelect.addEventListener("change", () => {
        gameMode = modeSelect.value;
        resetgame();
    });
}

const winpatterns=[
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,5,8],
    [2,4,6],
    [3,4,5],
    [6,7,8],

];

//quick mode access

//***************************************
// Function to reset the game
const resetgame = () => {
    turn0 = true;
    count = 0;
    enableboxes();
    msgcontainer.classList.add("hide");

    // Remove cutting line if exists
    let oldLine = document.querySelector(".cutting-line");
    if (oldLine) oldLine.remove();

    // Show/hide scoreboard based on mode
    if (gameType === "tournament") {
        document.getElementById("score-board").classList.remove("hide");
        document.getElementById("score-o").innerText = oScore;
        document.getElementById("score-x").innerText = xScore;
    } else {
        document.getElementById("score-board").classList.add("hide");
    }

    document.querySelector(".top-controls").classList.remove("hide");
};


// Add event listeners to each box
// This allows players to click on boxes to make their moves
boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText !== "") return;

        if (turn0) {
            box.innerText = "O";
            box.disabled = true;
            count++;
            turn0 = false;

            if (checkwinner()) return;
            if (count === 9) {
                gamedraw();
                return;
            }

            // If playing with bot, let bot move now
            if (gameMode === "bot") {
               setTimeout(bestMove, 300);// small delay for realism
            }
        } else if (gameMode === "2player") {
            box.innerText = "X";
            box.classList.add("x-move");
            box.disabled = true;
            count++;
            turn0 = true;

            if (checkwinner()) return;
            if (count === 9) gamedraw();
        }
    });
});

const gamedraw = () => {
    if (gameType === "tournament") {
        msg.innerText = "Round Draw!\nNo points awarded.\nScore: O = " + oScore + " | X = " + xScore;
    } else {
        msg.innerText = "Game is Draw";
    }

    msgcontainer.classList.remove("hide");
    disableboxes();
    document.querySelector(".top-controls")?.classList.add("hide");
};

const disableboxes=()=>{
    for(let box of boxes){
        box.disabled=true;
    }
}

const enableboxes = () => {
    for(let box of boxes){
        box.disabled = false;
        box.innerText = "";
        box.classList.remove("x-move"); // Remove X move class for 2-player mode
    }
};



// Function to show the winner message
// This displays a congratulatory message when a player wins
function showwinner(winner){
    msg.innerText=`Congratulations, winner is ${winner}`;
    msgcontainer.classList.remove("hide");
    disableboxes();

    document.querySelector(".top-controls").classList.add("hide");
}


// Function to draw a cutting line through the winning pattern
const drawCuttingLine = (winnerPattern) => {
    // Remove any existing line
    let oldLine = document.querySelector(".cutting-line");
    if (oldLine) oldLine.remove();

    // Get the positions of the winning boxes
    let rects = winnerPattern.map(idx => boxes[idx].getBoundingClientRect());
    let containerRect = boxes[0].parentElement.getBoundingClientRect();

    // Calculate start and end points (center of first and last box in pattern)
    let start = {
        x: rects[0].left + rects[0].width / 2 - containerRect.left,
        y: rects[0].top + rects[0].height / 2 - containerRect.top
    };
    let end = {
        x: rects[2].left + rects[2].width / 2 - containerRect.left,
        y: rects[2].top + rects[2].height / 2 - containerRect.top
    };

    // Create SVG line
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("cutting-line");
    svg.style.position = "absolute";
    svg.style.left = 0;
    svg.style.top = 0;
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = 10;

    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("stroke", "#f00");
    line.setAttribute("stroke-width", "6");
    line.setAttribute("stroke-linecap", "round");

    svg.appendChild(line);
    boxes[0].parentElement.style.position = "relative";
    boxes[0].parentElement.appendChild(svg);
};

// Patch showwinner to draw the line
function showwinnerWithLine(winner) {
   
    // Find the winning pattern
    let foundPattern = null;
    for (let pattern of winpatterns) {
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;
        if (pos1val !== "" && pos2val !== "" && pos3val !== "") {
            if (pos1val === pos2val && pos2val === pos3val) {
                foundPattern = pattern;
                break;
            }
        }
    }

    if (foundPattern) {
        drawCuttingLine(foundPattern);

        // Wait a moment to draw line before showing result
        setTimeout(() => {
            // In tournament mode, update score
            if (gameType === "tournament") {
                if (winner === "O") {
                    oScore++;
                } else {
                    xScore++;
                }
//update score display
 document.getElementById("score-o").innerText = oScore;
document.getElementById("score-x").innerText = xScore;
                // Check for tournament win
                if (oScore >= 5 || xScore >= 5) {
                    msg.innerText = `🏆 Tournament Winner: ${winner}`;
                    oScore = 0;
                    xScore = 0;
                } else {
                    msg.innerText = `${winner} wins this round! \nScore: O = ${oScore} | X = ${xScore}`;
                }

                msgcontainer.classList.remove("hide");
                disableboxes();
            } else {
                // Quick mode
                showwinner(winner);
            }
        }, 500);
    } else {
        showwinner(winner); // Fallback
    }
}

// Existing checkwinner function
const checkwinner = () => {
    for (let pattern of winpatterns) {
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;
        if (pos1val != "" && pos2val != "" && pos3val != "") {
            if (pos1val === pos2val && pos2val === pos3val) {
                setTimeout(() => {
                    showwinnerWithLine(pos1val);
                }, 300); // 300ms delay
                return true;
            }
        }
    }
};
//************************************************
//code for the bot's move using minimax algorithm
const bestMove = () => {
    // Optimization: if it's the bot's first move, play center or corner fast
    if (count <= 1) {
        let preferred = [4, 0, 2, 6, 8]; // center and corners
        for (let idx of preferred) {
            if (boxes[idx].innerText === "") {
                boxes[idx].innerText = "X";
                boxes[idx].disabled = true;
                count++;
                if (checkwinner()) return;
                if (count === 9) gamedraw();
                turn0 = true;
                return;
            }
        }
    }

    // Use minimax for hard decisions
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boxes.length; i++) {
        if (boxes[i].innerText === "") {
            boxes[i].innerText = "X";
            let score = minimax(boxes, 0, false);
            boxes[i].innerText = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== undefined) {
        boxes[move].innerText = "X";
        boxes[move].disabled = true;
        count++;
        if (checkwinner()) return;
        if (count === 9) gamedraw();
        turn0 = true;
    }
};


const minimax = (newBoxes, depth, isMaximizing) => {
    let result = getWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoxes.length; i++) {
            if (newBoxes[i].innerText === "") {
                newBoxes[i].innerText = "X";
                let score = minimax(newBoxes, depth + 1, false);
                newBoxes[i].innerText = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoxes.length; i++) {
            if (newBoxes[i].innerText === "") {
                newBoxes[i].innerText = "O";
                let score = minimax(newBoxes, depth + 1, true);
                newBoxes[i].innerText = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

const scores = {
    X: 1,    // bot wins
    O: -1,   // player wins
    draw: 0,
};
//**********************************************************
// Function to determine the winner or if it's a draw
const getWinner = () => {
    for (let pattern of winpatterns) {
        let a = boxes[pattern[0]].innerText;
        let b = boxes[pattern[1]].innerText;
        let c = boxes[pattern[2]].innerText;

        if (a && a === b && a === c) {
            return a;
        }
    }

    // Check for draw
    let filled = Array.from(boxes).every(box => box.innerText !== "");
    if (filled) return "draw";

    return null;
};




newgamebtn.addEventListener("click",resetgame);
resetbtn.addEventListener("click", resetgame);


