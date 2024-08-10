//credits:
    // piece images source: https://opengameart.org/content/8x13-chess-pieces
    // skull image source: https://opengameart.org/content/pixel-art-skull

// Global Constants
//#region constants
const upgradeData = [
    {
        id: "pawnTwoSteps",
        name: 'Charging Pawns',
        description: "Pawn's can always march 2 squares",
        cost: 10
    },
    {
        id: "pawnMoveDiagonal",
        name: 'Weaving Pawns',
        description: "Pawn's can move Diagonally without attacking",
        cost: 10
    },
    {
        id: "pawnAttackFowards",
        name: 'Stronger Pawns',
        description: "Pawn's can now attack forwards",
        cost: 10
    },
    {
        id: "piecesCanJump",
        name: "Jumping Pieces",
        description: "Pieces won't block your path",
        cost: 20
    },
    {
        id: "kingMovesLikeQueen",
        name: "Drag Queen",
        description: "Your king will move like a queen",
        cost: 20
    },
    {
        id: "restockGoodPieces",
        name: "Trained Reinforcements",
        description: "50% Chance reinforcements will be a promoted piecetype",
        cost: 10
    },
    {
        id: "noKingNeeded",
        name: "Constitutional Monarchy",
        description: "No King needed. Keep playing until you run out of pieces.",
        cost: 20
    },
    {   id: "protectiveSight",
        name: "Protective Tower",
        description: "Your unsafe pieces will be highlighted.",
        cost: 5
    },
    {   id: "safetySight",
        name: "Safety of the Church",
        description: "Unsafe tiles will be highlighted.",
        cost: 5
    },
    {   id: "killerSight",
        name: "Watchful Cavalry",
        description: "Enemy's unsafe pieces will be highlighted.",
        cost: 5
    },
    {   id: "extraTeamSlot",
        name: "Reinforcements",
        description: "Play with 1 extra piece",
        cost: 10
    },
    {   id: "largerChessboard",
        name: "Wider Battlefield",
        description: "Makes the chessboard 1 tile wider/taller",
        cost: 10
    }
    //player.upgrades.includes('upgradeID')
]
const repeatableUpgrades = {
    //TODO
}
//#endregion constants

// Global Variables
let currentTurn;
let pieces = [];
let forfeitCounter = 0;
let player = new Player();

function Initialize() {
    player.loadFromLocalStorage();
    newMatch();
}

function endTurn() {
    //detect pawns that need promotion
    pieces.forEach(piece => {
        if (piece.pieceType == 'pawn') {
            if (piece.pos.y === 0 && piece.player == 'player') {
                promptPromotion(piece);
                return;
            } else if ((piece.pos.y === player.boardSize - 1 && piece.player == 'enemy')) {
                piece.promote('random');
            }
        }
    });

    if (currentTurn == "PAUSED") return;

    //change turn
    currentTurn = currentTurn === 'player' ? 'enemy' : 'player';
    printUI(`${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s turn`);
    pieces.forEach(piece => piece.availableMoves =  piece.calculateAvailableMoves());
    generalHighlights();

    // Check if the game is over
    if (isGameOver()) {
        endGame();
        return;
    }

    if (currentTurn === 'enemy') {
        setTimeout(enemyTurn, player.turnTime);
    }
}

// Utility function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Calculate the total points for a player
function calculatePoints(player) {
    let totalPoints = 0;
    const pieces = getPlayersPieces(player);
    pieces.forEach(piece => {
        totalPoints += pieceValues[piece.pieceType] || 0;
    });
    return totalPoints;
}

// Check if a player can make any valid moves
function canPlayerMove(player) {
    const pieces = getPlayersPieces(player);
    for (const piece of pieces) {
        if (piece.availableMoves.length > 0) return true;
    }
    return false;
}

// Check if the game is over
function isGameOver() {
    const playerHasKing = document.querySelectorAll(`.player.king`).length > 0 || player.upgrades.includes('noKingNeeded'); //TODO: do this better
    const enemyHasKing = document.querySelectorAll(`.enemy.king`).length > 0; //TODO: do this better

    const currentPlayerCanMove = canPlayerMove(currentTurn);

    return !playerHasKing || !enemyHasKing || !currentPlayerCanMove;
}

function determineWinner() {
    const playerHasKing = (document.querySelectorAll(`.player.king`).length > 0 || player.upgrades.includes('noKingNeeded')); //TODO: do this better
    const enemyHasKing = document.querySelectorAll(`.enemy.king`).length > 0; //TODO: do this better
    const playerPoints = calculatePoints('player');
    const enemyPoints = calculatePoints('enemy');

    let matchResult;

    // Determine the winner
    if (playerHasKing && !enemyHasKing) {
        matchResult = 'You won!';
    } else if (enemyHasKing && !playerHasKing) {
        matchResult = 'You lost!';
    } else if (playerPoints > enemyPoints) {
        matchResult = 'You won!';
    } else if (enemyPoints > playerPoints) {
        matchResult = 'You lost!';
    } else {
        matchResult = 'Stalemate'
    }

    return matchResult;
}

function endGame() {
    let goldEarned = 0;

    //determine & handle win/loss
    const matchResult = determineWinner();
    if ('You won!' == matchResult) {
        player.matchStreak += 1;

        //matchstreak + ( enemyscore / 5 )
        goldEarned = player.matchStreak + (Math.ceil((calculatePoints('enemy') / 5)));

        player.gold += goldEarned > 0 ? goldEarned : 0;
    } else if ('You lost!' == matchResult) {
        player.matchStreak = 0;
    }

    // Save Player Loadout
    player.loadOut = [];
    getPlayersPieces('player').forEach(piece => {
        player.loadOut.push(piece.pieceType);
    });

    endGameMessage(matchResult, `You earned ${goldEarned} gold - giving you a total of ${player.gold} gold.`);
    printUI('');
    currentTurn = 'PAUSED';
    clearHighlights();
    player.saveToLocalStorage();
}

function buildEnemyTeam() {
    const loadOut = [];

    loadOut.push('king');

    while(loadOut.length < player.boardSize) {
        if (loadOut.length < player.matchStreak) loadOut.push(getWeightedRandomPieceType());
        else loadOut.push('pawn');
    }

    const enemyPiecePositions = getRandomPositions(0, 2, 8);

    for (var i = 0; i < 8; i++) {
        pieces.push(new Piece(loadOut[i], enemyPiecePositions[i], 'enemy'));
    }
}

function newMatch() {
    //reset variables
    popupElement.innerHTML = '';
    popupElement.style.display = 'none';
    currentTurn = 'player'
    player.saveToLocalStorage();
    player.refreshUpgrades();

    //build chessboard
    chessboardElement.innerHTML = '';
    for (let row = 0; row < player.boardSize; row++) {
        for (let col = 0; col < player.boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
            cell.dataset.pos = JSON.stringify({ x: col, y: row });
            cell.addEventListener('click', handleCellClick);
            chessboardElement.appendChild(cell);
        }
    }

    pieces = [];
    player.buildTeam();
    buildEnemyTeam();

    // Allow dropping on cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('drop', handleDrop);
    });

    printUI("Player's Turn");

    pieces.forEach(piece => piece.availableMoves =  piece.calculateAvailableMoves());
    generalHighlights();
}

function printUI(message) {
    matchInfo.innerHTML = `
    <p>Player Score: ${calculatePoints('player')}</p>
    <p>Enemy Score: ${calculatePoints('enemy')}</p>
    `;

    turnIndicator.innerHTML = `
    <p>${message}</p>
    `;

    runInfo.innerHTML = `
    <p>Match Streak: ${player.matchStreak} </p>
    <p>Gold: $${player.gold}</p>
    `;
}

function toggleMenu() {
    menu.style.display = menu.style.display == 'none' ? 'flex' : 'none';
    printMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    Initialize();
});