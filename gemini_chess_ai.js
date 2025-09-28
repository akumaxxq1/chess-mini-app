// 🧠 GEMINI AI для шахмат - РЕВОЛЮЦИОННАЯ версия!
// Интеграция Google Gemini API для умных ходов и подсказок

class GeminiChessAI {
    constructor() {
        this.apiKey = 'AIzaSyCBBKA-j2q-P0DnOY3AnHoFmUrid31Pi0'; // Твой API ключ Gemini
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.difficultyPrompts = {
            1: "Ты новичок в шахматах. Делай простые ходы, иногда ошибайся.",
            2: "Ты начинающий игрок. Избегай очевидных ошибок, но не думай слишком сложно.",
            3: "Ты любитель. Делай разумные ходы, развивай фигуры.",
            4: "Ты средний игрок. Контролируй центр, защищай фигуры.",
            5: "Ты опытный игрок. Планируй на 2-3 хода вперед.",
            6: "Ты сильный игрок. Ищи тактические возможности.",
            7: "Ты эксперт. Анализируй позицию глубоко.",
            8: "Ты мастер. Используй продвинутые стратегии.",
            9: "Ты гроссмейстер. Играй на высшем уровне.",
            10: "Ты чемпион мира. Играй как лучший в мире."
        };
    }

    // Получить умный ход от Gemini
    async getSmartMove(board, difficulty, isWhite = false) {
        try {
            const prompt = this.createChessPrompt(board, difficulty, isWhite);
            const response = await this.callGeminiAPI(prompt);
            return this.parseChessMove(response);
        } catch (error) {
            console.error('Ошибка Gemini AI:', error);
            return this.getFallbackMove(board, isWhite);
        }
    }

    // Получить умную подсказку от Gemini
    async getSmartHint(board, difficulty, isWhite = true) {
        try {
            const prompt = this.createHintPrompt(board, difficulty, isWhite);
            const response = await this.callGeminiAPI(prompt);
            return this.parseChessMove(response);
        } catch (error) {
            console.error('Ошибка Gemini подсказки:', error);
            return this.getFallbackMove(board, isWhite);
        }
    }

    // Создать промпт для хода
    createChessPrompt(board, difficulty, isWhite) {
        const color = isWhite ? 'белые' : 'черные';
        const difficultyText = this.difficultyPrompts[difficulty] || this.difficultyPrompts[5];
        
        return `Ты ${color} игрок в шахматах. ${difficultyText}

Текущая позиция:
${this.boardToString(board)}

Дай лучший ход в формате: "откуда-куда" (например: "e2-e4").
Только ход, без объяснений.`;
    }

    // Создать промпт для подсказки
    createHintPrompt(board, difficulty, isWhite) {
        const difficultyText = this.difficultyPrompts[difficulty] || this.difficultyPrompts[5];
        
        return `Ты шахматный тренер. ${difficultyText}

Текущая позиция (белые ходят):
${this.boardToString(board)}

Дай лучшую подсказку в формате: "откуда-куда" (например: "e2-e4").
Только ход, без объяснений.`;
    }

    // Вызов Gemini API
    async callGeminiAPI(prompt) {
        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 50,
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API ошибка: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Неожиданная структура ответа Gemini');
        }
    }

    // Преобразовать доску в строку
    boardToString(board) {
        let result = '  a b c d e f g h\n';
        for (let row = 7; row >= 0; row--) {
            result += `${row + 1} `;
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece) {
                    result += piece + ' ';
                } else {
                    result += '. ';
                }
            }
            result += `${row + 1}\n`;
        }
        result += '  a b c d e f g h';
        return result;
    }

    // Парсить ход от Gemini
    parseChessMove(response) {
        // Ищем паттерн "e2-e4" или "e2e4"
        const moveMatch = response.match(/([a-h][1-8])[- ]?([a-h][1-8])/i);
        if (moveMatch) {
            const from = moveMatch[1];
            const to = moveMatch[2];
            return this.convertNotationToCoords(from, to);
        }
        
        // Если не нашли, возвращаем случайный ход
        return null;
    }

    // Конвертировать шахматную нотацию в координаты
    convertNotationToCoords(from, to) {
        const fromCoords = this.notationToCoords(from);
        const toCoords = this.notationToCoords(to);
        
        if (fromCoords && toCoords) {
            return [fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]];
        }
        return null;
    }

    // Конвертировать нотацию в координаты
    notationToCoords(notation) {
        const col = notation.charCodeAt(0) - 97; // a=0, b=1, etc.
        const row = parseInt(notation[1]) - 1; // 1=0, 2=1, etc.
        return [row, col];
    }

    // Резервный ход если Gemini не работает
    getFallbackMove(board, isWhite) {
        // Простая логика для резервного хода
        const moves = this.getAllPossibleMoves(board, isWhite);
        if (moves.length > 0) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        return null;
    }

    // Получить все возможные ходы
    getAllPossibleMoves(board, isWhite) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && (piece === piece.toUpperCase()) === isWhite) {
                    // Простая логика для всех фигур
                    const pieceMoves = this.getPieceMoves(board, row, col, isWhite);
                    moves.push(...pieceMoves);
                }
            }
        }
        return moves;
    }

    // Получить ходы фигуры
    getPieceMoves(board, row, col, isWhite) {
        const moves = [];
        const piece = board[row][col];
        
        // Простая логика для пешки
        if (piece.toLowerCase() === 'p') {
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            // Ход вперед
            if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
                moves.push([row, col, row + direction, col]);
            }
            
            // Взятие по диагонали
            for (const dc of [-1, 1]) {
                const newRow = row + direction;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = board[newRow][newCol];
                    if (target && (target === target.toUpperCase()) !== isWhite) {
                        moves.push([row, col, newRow, newCol]);
                    }
                }
            }
        }
        
        return moves;
    }
}

// Экспорт для использования
window.GeminiChessAI = GeminiChessAI;
