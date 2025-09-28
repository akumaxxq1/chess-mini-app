// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Настройка Telegram Web App
    if (tg) {
        tg.ready();
        tg.expand();
        tg.enableClosingConfirmation();
    }
    
    initializeApp();
});

// Глобальные переменные
let currentScreen = 'mainMenu';
let currentDifficulty = 1;
let gameState = {
    board: [],
    currentPlayer: 'white',
    selectedSquare: null,
    possibleMoves: [],
    gameOver: false,
    winner: null,
    isProcessing: false // Флаг для предотвращения множественных кликов
};

// Инициализация приложения
function initializeApp() {
    setupEventListeners();
    showScreen('mainMenu');
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Главное меню
    document.getElementById('playButton').addEventListener('click', () => {
        showScreen('difficultyMenu');
    });
    
    document.getElementById('rulesButton').addEventListener('click', () => {
        showScreen('rulesScreen');
    });
    
    // Выбор сложности
    document.getElementById('backButton').addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentDifficulty = parseInt(e.currentTarget.dataset.level);
            startNewGame();
        });
    });
    
    // Правила
    document.getElementById('rulesBackButton').addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    // Игровые контролы
    document.getElementById('menuButton').addEventListener('click', () => {
        showScreen('mainMenu');
    });
    
    document.getElementById('newGameButton').addEventListener('click', () => {
        startNewGame();
    });
    
    document.getElementById('hintButton').addEventListener('click', () => {
        showHint();
    });
    
    // Экран окончания игры
    document.getElementById('playAgainButton').addEventListener('click', () => {
        startNewGame();
    });
    
    document.getElementById('changeDifficultyButton').addEventListener('click', () => {
        showScreen('difficultyMenu');
    });
    
    document.getElementById('mainMenuButton').addEventListener('click', () => {
        showScreen('mainMenu');
    });
}

// Показать экран
function showScreen(screenName) {
    // Скрыть все экраны
    document.querySelectorAll('.menu-screen, .game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Показать нужный экран
    const screen = document.getElementById(screenName);
    if (screen) {
        screen.classList.remove('hidden');
        currentScreen = screenName;
    }
}

// Начать новую игру
function startNewGame() {
    initializeBoard();
    createChessBoard();
    gameState.currentPlayer = 'white';
    gameState.selectedSquare = null;
    gameState.possibleMoves = [];
    gameState.gameOver = false;
    gameState.winner = null;
    
    updateGameInfo();
    showScreen('gameScreen');
}

// Инициализация шахматной доски
function initializeBoard() {
    gameState.board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
}

// Создание шахматной доски
function createChessBoard() {
    const board = document.getElementById('chessBoard');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'chess-square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            // Чередование цветов
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            // Добавление фигуры
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'chess-piece';
                pieceElement.textContent = getPieceSymbol(piece);
                square.appendChild(pieceElement);
            }
            
            // Обработчик клика
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            board.appendChild(square);
        }
    }
}

// Получить символ фигуры
function getPieceSymbol(piece) {
    const symbols = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece] || '';
}

// Обработка клика по клетке - Оптимизированная версия
function handleSquareClick(row, col) {
    if (gameState.gameOver || gameState.currentPlayer !== 'white' || gameState.isProcessing) {
        return;
    }
    
    const piece = gameState.board[row][col];
    
    // Если выбрана клетка с фигурой игрока
    if (piece && piece === piece.toUpperCase()) {
        selectSquare(row, col);
    }
    // Если выбрана пустая клетка или клетка противника
    else if (gameState.selectedSquare) {
        const [selectedRow, selectedCol] = gameState.selectedSquare;
        const isPossibleMove = gameState.possibleMoves.some(move => 
            move[0] === row && move[1] === col
        );
        
        if (isPossibleMove) {
            makeMove(selectedRow, selectedCol, row, col);
        }
        
        clearSelection();
    }
}

// Выбрать клетку - Оптимизированная версия
function selectSquare(row, col) {
    // Предотвращаем множественные клики
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    
    clearSelection();
    
    gameState.selectedSquare = [row, col];
    
    // Используем setTimeout для предотвращения блокировки UI
    setTimeout(() => {
        gameState.possibleMoves = getPossibleMoves(row, col);
        
        // Визуальное выделение
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
        
        // Показать возможные ходы
        gameState.possibleMoves.forEach(([moveRow, moveCol]) => {
            const moveSquare = document.querySelector(`[data-row="${moveRow}"][data-col="${moveCol}"]`);
            if (moveSquare) {
                if (gameState.board[moveRow][moveCol]) {
                    moveSquare.classList.add('possible-capture');
                } else {
                    moveSquare.classList.add('possible-move');
                }
            }
        });
        
        gameState.isProcessing = false;
    }, 10);
}

// Очистить выделение
function clearSelection() {
    gameState.selectedSquare = null;
    gameState.possibleMoves = [];
    
    // Убрать визуальные эффекты
    document.querySelectorAll('.chess-square').forEach(square => {
        square.classList.remove('selected', 'possible-move', 'possible-capture');
    });
}

// Получить возможные ходы для фигуры
function getPossibleMoves(row, col) {
    const piece = gameState.board[row][col];
    const moves = [];
    
    if (!piece) return moves;
    
    const isWhite = piece === piece.toUpperCase();
    
    switch (piece.toLowerCase()) {
        case 'p': // Пешка
            moves.push(...getPawnMoves(row, col, isWhite));
            break;
        case 'r': // Ладья
            moves.push(...getRookMoves(row, col, isWhite));
            break;
        case 'n': // Конь
            moves.push(...getKnightMoves(row, col, isWhite));
            break;
        case 'b': // Слон
            moves.push(...getBishopMoves(row, col, isWhite));
            break;
        case 'q': // Ферзь
            moves.push(...getQueenMoves(row, col, isWhite));
            break;
        case 'k': // Король
            moves.push(...getKingMoves(row, col, isWhite));
            break;
    }
    
    return moves;
}

// Ходы пешки
function getPawnMoves(row, col, isWhite) {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    
    // Ход вперед
    if (isValidSquare(row + direction, col) && !gameState.board[row + direction][col]) {
        moves.push([row + direction, col]);
        
        // Двойной ход с начальной позиции
        if (row === startRow && !gameState.board[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
        }
    }
    
    // Взятие по диагонали
    [-1, 1].forEach(dc => {
        const newRow = row + direction;
        const newCol = col + dc;
        if (isValidSquare(newRow, newCol)) {
            const targetPiece = gameState.board[newRow][newCol];
            if (targetPiece && (targetPiece === targetPiece.toUpperCase()) !== isWhite) {
                moves.push([newRow, newCol]);
            }
        }
    });
    
    return moves;
}

// Ходы ладьи
function getRookMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const piece = gameState.board[newRow][newCol];
            if (!piece) {
                moves.push([newRow, newCol]);
            } else {
                if ((piece === piece.toUpperCase()) !== isWhite) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
        }
    });
    
    return moves;
}

// Ходы коня
function getKnightMoves(row, col, isWhite) {
    const moves = [];
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    knightMoves.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValidSquare(newRow, newCol)) {
            const piece = gameState.board[newRow][newCol];
            if (!piece || (piece === piece.toUpperCase()) !== isWhite) {
                moves.push([newRow, newCol]);
            }
        }
    });
    
    return moves;
}

// Ходы слона
function getBishopMoves(row, col, isWhite) {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    directions.forEach(([dr, dc]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            
            if (!isValidSquare(newRow, newCol)) break;
            
            const piece = gameState.board[newRow][newCol];
            if (!piece) {
                moves.push([newRow, newCol]);
            } else {
                if ((piece === piece.toUpperCase()) !== isWhite) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
        }
    });
    
    return moves;
}

// Ходы ферзя
function getQueenMoves(row, col, isWhite) {
    return [
        ...getRookMoves(row, col, isWhite),
        ...getBishopMoves(row, col, isWhite)
    ];
}

// Ходы короля
function getKingMoves(row, col, isWhite) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (isValidSquare(newRow, newCol)) {
            const piece = gameState.board[newRow][newCol];
            if (!piece || (piece === piece.toUpperCase()) !== isWhite) {
                moves.push([newRow, newCol]);
            }
        }
    });
    
    return moves;
}

// Проверить валидность клетки
function isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Сделать ход - Оптимизированная версия
function makeMove(fromRow, fromCol, toRow, toCol) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    
    const piece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = '';
    
    // Обновить доску
    createChessBoard();
    
    // Проверить окончание игры
    if (checkGameOver()) {
        showGameOver();
        gameState.isProcessing = false;
        return;
    }
    
    // Передать ход AI
    gameState.currentPlayer = 'black';
    updateGameInfo();
    
    // Ход AI с задержкой
    setTimeout(() => {
        if (!gameState.gameOver) {
            makeAIMove();
        }
    }, 300); // Уменьшаем задержку
}

// Ход AI - Оптимизированная версия
function makeAIMove() {
    if (gameState.gameOver) return;
    
    // Показываем индикатор загрузки
    showAILoading();
    
    // Используем setTimeout для предотвращения блокировки UI
    setTimeout(() => {
        const bestMove = getBestMove();
        if (bestMove) {
            const [fromRow, fromCol, toRow, toCol] = bestMove;
            makeMove(fromRow, fromCol, toRow, toCol);
        }
        
        gameState.currentPlayer = 'white';
        updateGameInfo();
        hideAILoading();
        gameState.isProcessing = false; // Сбрасываем флаг обработки
    }, 100); // Небольшая задержка для плавности
}

// Показать индикатор загрузки AI
function showAILoading() {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = '🤖 AI думает...';
        statusElement.style.color = '#ff6b6b';
    }
}

// Скрыть индикатор загрузки AI
function hideAILoading() {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = 'Игра идет';
        statusElement.style.color = '#4ecdc4';
    }
}

// Получить лучший ход AI
function getBestMove() {
    const moves = getAllPossibleMoves('black');
    if (moves.length === 0) return null;
    
    // Простой алгоритм в зависимости от сложности
    switch (currentDifficulty) {
        case 1: // Новичок - случайный ход
            return moves[Math.floor(Math.random() * moves.length)];
        case 2: // Легкий - случайный, но избегает потери фигур
            return getRandomSafeMove(moves);
        case 3: // Простой - предпочитает взятие
            return getCaptureMove(moves) || moves[Math.floor(Math.random() * moves.length)];
        case 4: // Средний - базовая оценка позиции
            return getBestMoveByEvaluation(moves, 1);
        case 5: // Нормальный
            return getBestMoveByEvaluation(moves, 1);
        case 6: // Сложный
            return getBestMoveByEvaluation(moves, 2);
        case 7: // Трудный
            return getBestMoveByEvaluation(moves, 2);
        case 8: // Эксперт
            return getBestMoveByEvaluation(moves, 3);
        case 9: // Мастер
            return getBestMoveByEvaluation(moves, 3);
        case 10: // Гроссмейстер
            return getBestMoveByEvaluation(moves, 4);
        default:
            return moves[Math.floor(Math.random() * moves.length)];
    }
}

// Получить все возможные ходы для цвета
function getAllPossibleMoves(color) {
    const moves = [];
    const isWhite = color === 'white';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && (piece === piece.toUpperCase()) === isWhite) {
                const pieceMoves = getPossibleMoves(row, col);
                pieceMoves.forEach(([toRow, toCol]) => {
                    moves.push([row, col, toRow, toCol]);
                });
            }
        }
    }
    
    return moves;
}

// Получить случайный безопасный ход
function getRandomSafeMove(moves) {
    const safeMoves = moves.filter(move => {
        const [fromRow, fromCol, toRow, toCol] = move;
        const piece = gameState.board[fromRow][fromCol];
        const targetPiece = gameState.board[toRow][toCol];
        
        // Предпочитаем ходы, которые не ведут к потере фигуры
        return !targetPiece || getPieceValue(targetPiece) >= getPieceValue(piece);
    });
    
    return safeMoves.length > 0 ? 
        safeMoves[Math.floor(Math.random() * safeMoves.length)] : 
        moves[Math.floor(Math.random() * moves.length)];
}

// Получить ход с взятием
function getCaptureMove(moves) {
    const captureMoves = moves.filter(move => {
        const [fromRow, fromCol, toRow, toCol] = move;
        return gameState.board[toRow][toCol] !== '';
    });
    
    if (captureMoves.length > 0) {
        // Выбираем лучшее взятие
        return captureMoves.reduce((best, current) => {
            const [, , toRow, toCol] = current;
            const [, , bestToRow, bestToCol] = best;
            const currentValue = getPieceValue(gameState.board[toRow][toCol]);
            const bestValue = getPieceValue(gameState.board[bestToRow][bestToCol]);
            return currentValue > bestValue ? current : best;
        });
    }
    
    return null;
}

// Получить лучший ход по оценке позиции
function getBestMoveByEvaluation(moves, depth) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    moves.forEach(move => {
        const score = evaluateMove(move, depth);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    return bestMove || moves[Math.floor(Math.random() * moves.length)];
}

// Оценить ход
function evaluateMove(move, depth) {
    const [fromRow, fromCol, toRow, toCol] = move;
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];
    
    let score = 0;
    
    // Базовые оценки
    if (targetPiece) {
        score += getPieceValue(targetPiece) * 10; // Взятие
    }
    
    score += getPieceValue(piece); // Ценность фигуры
    
    // Позиционные бонусы
    score += getPositionalBonus(toRow, toCol, piece);
    
    // Простая мини-макс оценка для высоких уровней
    if (depth > 1) {
        // Симуляция хода
        const originalPiece = gameState.board[toRow][toCol];
        gameState.board[toRow][toCol] = piece;
        gameState.board[fromRow][fromCol] = '';
        
        // Оценка ответного хода игрока
        const playerMoves = getAllPossibleMoves('white');
        let minPlayerScore = Infinity;
        
        playerMoves.forEach(playerMove => {
            const playerScore = evaluateMove(playerMove, depth - 1);
            minPlayerScore = Math.min(minPlayerScore, playerScore);
        });
        
        score -= minPlayerScore * 0.5;
        
        // Восстановление позиции
        gameState.board[fromRow][fromCol] = piece;
        gameState.board[toRow][toCol] = originalPiece;
    }
    
    return score;
}

// Получить ценность фигуры
function getPieceValue(piece) {
    const values = {
        'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100,
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100
    };
    return values[piece] || 0;
}

// Получить позиционный бонус
function getPositionalBonus(row, col, piece) {
    // Простые позиционные оценки
    const centerBonus = (row >= 3 && row <= 4 && col >= 3 && col <= 4) ? 1 : 0;
    const pieceType = piece.toLowerCase();
    
    switch (pieceType) {
        case 'p': // Пешки в центре
            return centerBonus;
        case 'n': // Кони в центре
            return centerBonus * 2;
        case 'b': // Слоны по диагоналям
            return centerBonus;
        case 'r': // Ладьи на открытых линиях
            return 0;
        case 'q': // Ферзь в центре
            return centerBonus;
        case 'k': // Король в безопасности
            return 0;
        default:
            return 0;
    }
}

// Проверить окончание игры
function checkGameOver() {
    // Проверка мата и пата
    const whiteMoves = getAllPossibleMoves('white');
    const blackMoves = getAllPossibleMoves('black');
    
    if (whiteMoves.length === 0) {
        gameState.gameOver = true;
        gameState.winner = 'black';
        return true;
    }
    
    if (blackMoves.length === 0) {
        gameState.gameOver = true;
        gameState.winner = 'white';
        return true;
    }
    
    return false;
}

// Показать экран окончания игры
function showGameOver() {
    const resultElement = document.getElementById('gameResult');
    const resultTextElement = document.getElementById('gameResultText');
    
    if (gameState.winner === 'white') {
        resultElement.textContent = '🎉 Победа!';
        resultTextElement.textContent = 'Вы выиграли!';
    } else {
        resultElement.textContent = '😔 Поражение';
        resultTextElement.textContent = 'AI выиграл!';
    }
    
    showScreen('gameOverScreen');
}

// Обновить информацию об игре
function updateGameInfo() {
    const currentPlayerElement = document.getElementById('currentPlayer');
    const difficultyElement = document.getElementById('difficultyLevel');
    
    if (currentPlayerElement) {
        currentPlayerElement.textContent = gameState.currentPlayer === 'white' ? 'Ваш ход' : 'Ход AI';
    }
    
    if (difficultyElement) {
        difficultyElement.textContent = `Уровень: ${currentDifficulty}`;
    }
}

// Показать подсказку
function showHint() {
    if (gameState.currentPlayer !== 'white' || gameState.gameOver) {
        return;
    }
    
    const moves = getAllPossibleMoves('white');
    if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const [fromRow, fromCol, toRow, toCol] = randomMove;
        
        // Подсветить рекомендуемый ход
        const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        
        fromSquare.style.background = 'rgba(255, 193, 7, 0.5)';
        toSquare.style.background = 'rgba(255, 193, 7, 0.5)';
        
        setTimeout(() => {
            fromSquare.style.background = '';
            toSquare.style.background = '';
        }, 2000);
    }
}

// Отправить данные в Telegram (если нужно)
function sendDataToTelegram(data) {
    if (tg) {
        tg.sendData(JSON.stringify(data));
    }
}
