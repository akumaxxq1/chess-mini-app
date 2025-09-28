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
    winner: null
};

// Gemini AI для умных ходов
let geminiAI = null;

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
    
    // Инициализируем Gemini AI
    if (typeof GeminiChessAI !== 'undefined') {
        geminiAI = new GeminiChessAI();
        console.log('🧠 Gemini AI инициализирован для умных ходов!');
    } else {
        console.warn('⚠️ Gemini AI не загружен, используем простой AI');
    }
    
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

// Создание шахматной доски с разметкой - ИСПРАВЛЕННАЯ версия
function createChessBoard() {
    const board = document.getElementById('chessBoard');
    if (!board) {
        console.error('Элемент chessBoard не найден!');
        return;
    }
    
    // Очищаем доску
    board.innerHTML = '';
    
    // Создаем контейнер для доски с разметкой
    const boardContainer = document.createElement('div');
    boardContainer.className = 'chess-board-container';
    
    // Создаем саму доску
    const boardGrid = document.createElement('div');
    boardGrid.className = 'chess-board';
    
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
            
                   // Добавление фигуры с УНИФИЦИРОВАННЫМИ стилями
                   const piece = gameState.board[row][col];
                   if (piece) {
                       const pieceElement = document.createElement('div');
                       pieceElement.className = 'chess-piece';
                       pieceElement.textContent = getPieceSymbol(piece);
                       
                       // УНИФИЦИРОВАННЫЕ стили для всех устройств
                       pieceElement.style.fontSize = '2rem';
                       pieceElement.style.fontWeight = '900';
                       pieceElement.style.fontFamily = 'Arial, sans-serif';
                       pieceElement.style.lineHeight = '1';
                       pieceElement.style.display = 'flex';
                       pieceElement.style.alignItems = 'center';
                       pieceElement.style.justifyContent = 'center';
                       pieceElement.style.width = '100%';
                       pieceElement.style.height = '100%';
                       pieceElement.style.contain = 'layout';
                       pieceElement.style.transform = 'none';
                       pieceElement.style.willChange = 'auto';
                       pieceElement.style.backfaceVisibility = 'visible';
                       pieceElement.style.perspective = 'none';
                       pieceElement.style.transformStyle = 'flat';
                       pieceElement.style.isolation = 'isolate';
                       
                       // МАКСИМАЛЬНЫЙ контраст для фигур
                       if (piece === piece.toUpperCase()) {
                           // Белые фигуры - ЧИСТО БЕЛЫЕ с черной обводкой
                           pieceElement.style.color = '#ffffff';
                           pieceElement.style.textShadow = '2px 2px 0 #000000, -2px -2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000, 0 2px 0 #000000, 0 -2px 0 #000000, 2px 0 0 #000000, -2px 0 0 #000000';
                       } else {
                           // Черные фигуры - ЧИСТО ЧЕРНЫЕ с белой обводкой
                           pieceElement.style.color = '#000000';
                           pieceElement.style.textShadow = '2px 2px 0 #ffffff, -2px -2px 0 #ffffff, 2px -2px 0 #ffffff, -2px 2px 0 #ffffff, 0 2px 0 #ffffff, 0 -2px 0 #ffffff, 2px 0 0 #ffffff, -2px 0 0 #ffffff';
                       }
                       
                       square.appendChild(pieceElement);
                   }
            
            // Обработчик клика
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            boardGrid.appendChild(square);
        }
    }
    
    // Добавляем разметку поля
    addBoardCoordinates(boardGrid);
    
    // Собираем все вместе
    boardContainer.appendChild(boardGrid);
    board.appendChild(boardContainer);
}

// Добавление координат на доску - ИСПРАВЛЕННАЯ версия
function addBoardCoordinates(boardGrid) {
    // Буквы (a-h) снизу
    const letters = document.createElement('div');
    letters.className = 'chess-coordinates letters';
    letters.style.position = 'absolute';
    letters.style.bottom = '-40px';
    letters.style.left = '0';
    letters.style.right = '0';
    letters.style.display = 'flex';
    letters.style.justifyContent = 'space-between';
    letters.style.padding = '0 15px';
    letters.style.height = '30px';
    letters.style.zIndex = '9999';
    letters.style.fontSize = '20px';
    letters.style.fontWeight = '900';
    letters.style.color = '#000000';
    letters.style.background = '#ffffff';
    letters.style.border = '3px solid #000000';
    letters.style.borderRadius = '8px';
    letters.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.7)';
    letters.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    letters.style.fontFamily = 'Arial, sans-serif';
    
    for (let i = 0; i < 8; i++) {
        const letter = document.createElement('span');
        letter.textContent = String.fromCharCode(97 + i); // a-h
        letter.style.padding = '4px 6px';
        letters.appendChild(letter);
    }
    boardGrid.appendChild(letters);
    
    // Цифры (1-8) слева
    const numbers = document.createElement('div');
    numbers.className = 'chess-coordinates numbers';
    numbers.style.position = 'absolute';
    numbers.style.top = '0';
    numbers.style.bottom = '0';
    numbers.style.left = '-40px';
    numbers.style.display = 'flex';
    numbers.style.flexDirection = 'column';
    numbers.style.justifyContent = 'space-between';
    numbers.style.padding = '15px 0';
    numbers.style.width = '30px';
    numbers.style.zIndex = '9999';
    numbers.style.fontSize = '20px';
    numbers.style.fontWeight = '900';
    numbers.style.color = '#000000';
    numbers.style.background = '#ffffff';
    numbers.style.border = '3px solid #000000';
    numbers.style.borderRadius = '8px';
    numbers.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.7)';
    numbers.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    numbers.style.fontFamily = 'Arial, sans-serif';
    
    for (let i = 8; i >= 1; i--) {
        const number = document.createElement('span');
        number.textContent = i.toString();
        number.style.padding = '4px 6px';
        numbers.appendChild(number);
    }
    boardGrid.appendChild(numbers);
}

// Получить символ фигуры - УНИФИЦИРОВАННАЯ версия
function getPieceSymbol(piece) {
    // УНИФИЦИРОВАННЫЕ символы для всех устройств
    const symbols = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return symbols[piece] || '';
}

// Обработка клика по клетке - Финальная версия
function handleSquareClick(row, col) {
    if (gameState.gameOver || gameState.currentPlayer !== 'white') {
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

// Выбрать клетку - Финальная версия
function selectSquare(row, col) {
    clearSelection();
    
    gameState.selectedSquare = [row, col];
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

// Сделать ход - Финальная версия
function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = '';
    
    // Обновить доску
    createChessBoard();
    
    // Проверить окончание игры
    if (checkGameOver()) {
        showGameOver();
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
    }, 500); // Увеличиваем задержку для стабильности
}

// Ход AI - GEMINI РЕВОЛЮЦИОННАЯ версия
async function makeAIMove() {
    if (gameState.gameOver) return;
    
    // Показываем индикатор загрузки
    showAILoading();
    
    try {
        let bestMove = null;
        
        // Используем Gemini AI если доступен
        if (geminiAI) {
            console.log('🧠 Получаем умный ход от Gemini AI...');
            bestMove = await geminiAI.getSmartMove(gameState.board, currentDifficulty, false);
            console.log('🎯 Gemini AI предложил ход:', bestMove);
        }
        
        // Если Gemini не сработал, используем простой AI
        if (!bestMove) {
            console.log('⚠️ Используем простой AI как резерв');
            bestMove = getBestMove();
        }
        
        if (bestMove) {
            const [fromRow, fromCol, toRow, toCol] = bestMove;
            
            // Выполняем ход AI
            const piece = gameState.board[fromRow][fromCol];
            gameState.board[toRow][toCol] = piece;
            gameState.board[fromRow][fromCol] = '';
            
            // Обновить доску
            createChessBoard();
            
            // Проверить окончание игры
            if (checkGameOver()) {
                showGameOver();
                hideAILoading();
                return;
            }
        }
        
        // Передать ход обратно игроку
        gameState.currentPlayer = 'white';
        updateGameInfo();
        
    } catch (error) {
        console.error('❌ Ошибка Gemini AI:', error);
        // Используем простой AI как резерв
        const bestMove = getBestMove();
        if (bestMove) {
            const [fromRow, fromCol, toRow, toCol] = bestMove;
            const piece = gameState.board[fromRow][fromCol];
            gameState.board[toRow][toCol] = piece;
            gameState.board[fromRow][fromCol] = '';
            createChessBoard();
            if (checkGameOver()) {
                showGameOver();
                hideAILoading();
                return;
            }
        }
        gameState.currentPlayer = 'white';
        updateGameInfo();
    }
    
    hideAILoading();
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

// Получить лучший ход AI - КАРДИНАЛЬНО УМНАЯ версия
function getBestMove() {
    const moves = getAllPossibleMoves('black');
    if (moves.length === 0) return null;
    
    // КАРДИНАЛЬНО умный алгоритм в зависимости от сложности
    switch (currentDifficulty) {
        case 1: // Новичок - случайный ход
            return moves[Math.floor(Math.random() * moves.length)];
        case 2: // Легкий - избегает потери фигур
            return getRandomSafeMove(moves);
        case 3: // Простой - предпочитает взятие
            return getCaptureMove(moves) || getRandomSafeMove(moves);
        case 4: // Средний - базовая стратегия
            return getSuperStrategicMove(moves, 1);
        case 5: // Нормальный - улучшенная стратегия
            return getSuperStrategicMove(moves, 2);
        case 6: // Сложный - продвинутая стратегия
            return getSuperStrategicMove(moves, 3);
        case 7: // Трудный - экспертная стратегия
            return getSuperStrategicMove(moves, 4);
        case 8: // Эксперт - мастерская стратегия
            return getSuperStrategicMove(moves, 5);
        case 9: // Мастер - гроссмейстерская стратегия
            return getSuperStrategicMove(moves, 6);
        case 10: // Гроссмейстер - максимальная стратегия
            return getSuperStrategicMove(moves, 7);
        default:
            return moves[Math.floor(Math.random() * moves.length)];
    }
}

// УМНАЯ стратегическая функция - КАРДИНАЛЬНО улучшенная
function getStrategicMove(moves, depth) {
    if (moves.length === 0) return null;
    
    // Приоритеты ходов
    const priorities = [];
    
    for (const move of moves) {
        let score = 0;
        const [fromRow, fromCol, toRow, toCol] = move;
        const piece = gameState.board[fromRow][fromCol];
        const targetPiece = gameState.board[toRow][toCol];
        
        // 1. Взятие фигур (высший приоритет)
        if (targetPiece) {
            score += getPieceValue(targetPiece) * 200; // Увеличиваем приоритет
        }
        
        // 2. Центральные поля (важнее)
        if ((toRow >= 3 && toRow <= 4) && (toCol >= 3 && toCol <= 4)) {
            score += 50; // Увеличиваем приоритет
        }
        
        // 3. Развитие фигур (умнее)
        if (piece === 'N' && toRow >= 2) { // Конь вперед
            score += 30;
        }
        if (piece === 'B' && toRow >= 2) { // Слон вперед
            score += 25;
        }
        if (piece === 'Q' && toRow >= 2) { // Ферзь вперед
            score += 20;
        }
        
        // 4. Рокировка (важнее)
        if (piece === 'K' && Math.abs(toCol - fromCol) === 2) {
            score += 100; // Увеличиваем приоритет
        }
        
        // 5. Атака на короля (критично)
        if (targetPiece === 'K') {
            score += 10000; // Максимальный приоритет
        }
        
        // 6. Защита своих фигур (важнее)
        if (isPieceUnderAttack(toRow, toCol, 'black')) {
            score += 100; // Увеличиваем приоритет
        }
        
        // 7. НОВОЕ: Атака на ферзя
        if (targetPiece === 'Q') {
            score += 2000;
        }
        
        // 8. НОВОЕ: Атака на ладью
        if (targetPiece === 'R') {
            score += 1000;
        }
        
        // 9. НОВОЕ: Атака на слона/коня
        if (targetPiece === 'B' || targetPiece === 'N') {
            score += 500;
        }
        
        // 10. НОВОЕ: Избегаем потери фигур
        if (isPieceUnderAttack(fromRow, fromCol, 'black')) {
            score += 150; // Спасаем фигуру
        }
        
        priorities.push({ move, score });
    }
    
    // Сортируем по приоритету
    priorities.sort((a, b) => b.score - a.score);
    
    // Возвращаем лучший ход или случайный из топ-2 (уменьшаем случайность)
    const topMoves = priorities.slice(0, Math.min(2, priorities.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
}

// СУПЕР умная стратегическая функция - КАРДИНАЛЬНО улучшенная
function getSuperStrategicMove(moves, depth) {
    if (moves.length === 0) return null;
    
    // Приоритеты ходов с МАКСИМАЛЬНЫМ интеллектом
    const priorities = [];
    
    for (const move of moves) {
        let score = 0;
        const [fromRow, fromCol, toRow, toCol] = move;
        const piece = gameState.board[fromRow][fromCol];
        const targetPiece = gameState.board[toRow][toCol];
        
        // 1. Взятие фигур (МАКСИМАЛЬНЫЙ приоритет)
        if (targetPiece) {
            score += getPieceValue(targetPiece) * 500; // УВЕЛИЧИВАЕМ в 2.5 раза
        }
        
        // 2. Центральные поля (КРИТИЧНО)
        if ((toRow >= 3 && toRow <= 4) && (toCol >= 3 && toCol <= 4)) {
            score += 100; // УВЕЛИЧИВАЕМ в 2 раза
        }
        
        // 3. Развитие фигур (УМНЕЕ)
        if (piece === 'N' && toRow >= 2) { // Конь вперед
            score += 50;
        }
        if (piece === 'B' && toRow >= 2) { // Слон вперед
            score += 45;
        }
        if (piece === 'Q' && toRow >= 2) { // Ферзь вперед
            score += 40;
        }
        if (piece === 'R' && toRow >= 2) { // Ладья вперед
            score += 35;
        }
        
        // 4. Рокировка (КРИТИЧНО)
        if (piece === 'K' && Math.abs(toCol - fromCol) === 2) {
            score += 200; // УВЕЛИЧИВАЕМ в 2 раза
        }
        
        // 5. Атака на короля (МАКСИМАЛЬНО)
        if (targetPiece === 'K') {
            score += 50000; // УВЕЛИЧИВАЕМ в 5 раз
        }
        
        // 6. Защита своих фигур (КРИТИЧНО)
        if (isPieceUnderAttack(toRow, toCol, 'black')) {
            score += 200; // УВЕЛИЧИВАЕМ в 2 раза
        }
        
        // 7. Атака на ферзя (КРИТИЧНО)
        if (targetPiece === 'Q') {
            score += 5000; // УВЕЛИЧИВАЕМ в 2.5 раза
        }
        
        // 8. Атака на ладью (ВАЖНО)
        if (targetPiece === 'R') {
            score += 2500; // УВЕЛИЧИВАЕМ в 2.5 раза
        }
        
        // 9. Атака на слона/коня (ВАЖНО)
        if (targetPiece === 'B' || targetPiece === 'N') {
            score += 1250; // УВЕЛИЧИВАЕМ в 2.5 раза
        }
        
        // 10. Спасение своих фигур (КРИТИЧНО)
        if (isPieceUnderAttack(fromRow, fromCol, 'black')) {
            score += 300; // УВЕЛИЧИВАЕМ в 2 раза
        }
        
        // 11. НОВОЕ: Контроль центра
        if ((toRow >= 2 && toRow <= 5) && (toCol >= 2 && toCol <= 5)) {
            score += 25;
        }
        
        // 12. НОВОЕ: Атака на пешки
        if (targetPiece === 'P') {
            score += 100;
        }
        
        // 13. НОВОЕ: Избегаем ходов в угол
        if ((toRow === 0 || toRow === 7) && (toCol === 0 || toCol === 7)) {
            score -= 50;
        }
        
        // 14. НОВОЕ: Предпочитаем ходы вперед
        if (toRow > fromRow) {
            score += 20;
        }
        
        priorities.push({ move, score });
    }
    
    // Сортируем по приоритету
    priorities.sort((a, b) => b.score - a.score);
    
    // Возвращаем ТОЛЬКО лучший ход (убираем случайность)
    return priorities[0].move;
}

// СУПЕР умная функция для подсказок белых
function getSuperBestMoveForWhite(moves) {
    if (moves.length === 0) return null;
    
    const priorities = [];
    
    for (const move of moves) {
        let score = 0;
        const [fromRow, fromCol, toRow, toCol] = move;
        const piece = gameState.board[fromRow][fromCol];
        const targetPiece = gameState.board[toRow][toCol];
        
        // 1. Взятие фигур (МАКСИМАЛЬНЫЙ приоритет)
        if (targetPiece) {
            score += getPieceValue(targetPiece) * 500;
        }
        
        // 2. Центральные поля (КРИТИЧНО)
        if ((toRow >= 3 && toRow <= 4) && (toCol >= 3 && toCol <= 4)) {
            score += 100;
        }
        
        // 3. Развитие фигур (УМНЕЕ)
        if (piece === 'N' && toRow <= 5) { // Конь вперед
            score += 50;
        }
        if (piece === 'B' && toRow <= 5) { // Слон вперед
            score += 45;
        }
        if (piece === 'Q' && toRow <= 5) { // Ферзь вперед
            score += 40;
        }
        if (piece === 'R' && toRow <= 5) { // Ладья вперед
            score += 35;
        }
        
        // 4. Рокировка (КРИТИЧНО)
        if (piece === 'K' && Math.abs(toCol - fromCol) === 2) {
            score += 200;
        }
        
        // 5. Атака на короля (МАКСИМАЛЬНО)
        if (targetPiece === 'k') {
            score += 50000;
        }
        
        // 6. Защита своих фигур (КРИТИЧНО)
        if (isPieceUnderAttack(toRow, toCol, 'white')) {
            score += 200;
        }
        
        // 7. Атака на ферзя (КРИТИЧНО)
        if (targetPiece === 'q') {
            score += 5000;
        }
        
        // 8. Атака на ладью (ВАЖНО)
        if (targetPiece === 'r') {
            score += 2500;
        }
        
        // 9. Атака на слона/коня (ВАЖНО)
        if (targetPiece === 'b' || targetPiece === 'n') {
            score += 1250;
        }
        
        // 10. Спасение своих фигур (КРИТИЧНО)
        if (isPieceUnderAttack(fromRow, fromCol, 'white')) {
            score += 300;
        }
        
        // 11. Контроль центра
        if ((toRow >= 2 && toRow <= 5) && (toCol >= 2 && toCol <= 5)) {
            score += 25;
        }
        
        // 12. Атака на пешки
        if (targetPiece === 'p') {
            score += 100;
        }
        
        // 13. Избегаем ходов в угол
        if ((toRow === 0 || toRow === 7) && (toCol === 0 || toCol === 7)) {
            score -= 50;
        }
        
        // 14. Предпочитаем ходы вперед
        if (toRow < fromRow) {
            score += 20;
        }
        
        priorities.push({ move, score });
    }
    
    // Сортируем по приоритету
    priorities.sort((a, b) => b.score - a.score);
    
    // Возвращаем ТОЛЬКО лучший ход
    return priorities[0].move;
}

// Получить ценность фигуры
function getPieceValue(piece) {
    const values = {
        'P': 1, 'p': 1,
        'N': 3, 'n': 3,
        'B': 3, 'b': 3,
        'R': 5, 'r': 5,
        'Q': 9, 'q': 9,
        'K': 100, 'k': 100
    };
    return values[piece] || 0;
}

// Проверить, атакована ли фигура
function isPieceUnderAttack(row, col, color) {
    const isWhite = color === 'white';
    const opponentColor = isWhite ? 'black' : 'white';
    
    // Проверяем атаки от всех фигур противника
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && (piece === piece.toUpperCase()) !== isWhite) {
                const moves = getPossibleMoves(r, c);
                if (moves.some(([toRow, toCol]) => toRow === row && toCol === col)) {
                    return true;
                }
            }
        }
    }
    return false;
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

// Показать GEMINI УМНУЮ подсказку
async function showHint() {
    if (gameState.currentPlayer !== 'white' || gameState.gameOver) {
        return;
    }
    
    try {
        let bestMove = null;
        
        // Используем Gemini AI для подсказки если доступен
        if (geminiAI) {
            console.log('💡 Получаем умную подсказку от Gemini AI...');
            bestMove = await geminiAI.getSmartHint(gameState.board, currentDifficulty, true);
            console.log('🎯 Gemini AI подсказал ход:', bestMove);
        }
        
        // Если Gemini не сработал, используем простую подсказку
        if (!bestMove) {
            console.log('⚠️ Используем простую подсказку как резерв');
            const moves = getAllPossibleMoves('white');
            if (moves.length > 0) {
                bestMove = getSuperBestMoveForWhite(moves);
            }
        }
        
        if (bestMove) {
            const [fromRow, fromCol, toRow, toCol] = bestMove;
            
            // Подсветить рекомендуемый ход
            const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
            const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
            
            if (fromSquare && toSquare) {
                fromSquare.style.background = 'rgba(255, 193, 7, 0.8)';
                toSquare.style.background = 'rgba(255, 193, 7, 0.8)';
                
                // Добавляем СУПЕР анимацию
                fromSquare.style.boxShadow = '0 0 15px rgba(255, 193, 7, 1)';
                toSquare.style.boxShadow = '0 0 15px rgba(255, 193, 7, 1)';
                fromSquare.style.border = '2px solid #ffc107';
                toSquare.style.border = '2px solid #ffc107';
                
                setTimeout(() => {
                    fromSquare.style.background = '';
                    toSquare.style.background = '';
                    fromSquare.style.boxShadow = '';
                    toSquare.style.boxShadow = '';
                    fromSquare.style.border = '';
                    toSquare.style.border = '';
                }, 4000); // Увеличиваем время показа
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка Gemini подсказки:', error);
        // Используем простую подсказку как резерв
        const moves = getAllPossibleMoves('white');
        if (moves.length > 0) {
            const bestMove = getSuperBestMoveForWhite(moves);
            if (bestMove) {
                const [fromRow, fromCol, toRow, toCol] = bestMove;
                const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
                const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
                
                if (fromSquare && toSquare) {
                    fromSquare.style.background = 'rgba(255, 193, 7, 0.8)';
                    toSquare.style.background = 'rgba(255, 193, 7, 0.8)';
                    
                    setTimeout(() => {
                        fromSquare.style.background = '';
                        toSquare.style.background = '';
                    }, 3000);
                }
            }
        }
    }
}

// Получить лучший ход для белых
function getBestMoveForWhite(moves) {
    if (moves.length === 0) return null;
    
    const priorities = [];
    
    for (const move of moves) {
        let score = 0;
        const [fromRow, fromCol, toRow, toCol] = move;
        const piece = gameState.board[fromRow][fromCol];
        const targetPiece = gameState.board[toRow][toCol];
        
        // 1. Взятие фигур
        if (targetPiece) {
            score += getPieceValue(targetPiece) * 100;
        }
        
        // 2. Центральные поля
        if ((toRow >= 3 && toRow <= 4) && (toCol >= 3 && toCol <= 4)) {
            score += 20;
        }
        
        // 3. Развитие фигур
        if (piece === 'N' && toRow <= 5) { // Конь вперед
            score += 15;
        }
        if (piece === 'B' && toRow <= 5) { // Слон вперед
            score += 10;
        }
        
        // 4. Рокировка
        if (piece === 'K' && Math.abs(toCol - fromCol) === 2) {
            score += 30;
        }
        
        // 5. Атака на короля
        if (targetPiece === 'k') {
            score += 1000;
        }
        
        // 6. Защита своих фигур
        if (isPieceUnderAttack(toRow, toCol, 'white')) {
            score += 50;
        }
        
        priorities.push({ move, score });
    }
    
    // Сортируем по приоритету
    priorities.sort((a, b) => b.score - a.score);
    
    // Возвращаем лучший ход
    return priorities[0].move;
}

// Отправить данные в Telegram (если нужно)
function sendDataToTelegram(data) {
    if (tg) {
        tg.sendData(JSON.stringify(data));
    }
}

