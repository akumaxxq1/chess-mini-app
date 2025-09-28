#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import logging
import os
import sqlite3
from datetime import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8386496978:AAGwF7boUT130zV97FrJKhj_lU2jrl12bQQ"  # Твой токен бота
WEB_APP_URL = "https://YOUR_USERNAME.github.io/chess-mini-app"  # Замени YOUR_USERNAME на свой GitHub username

# Настройка для Windows
asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

class ChessBot:
    def __init__(self):
        self.setup_database()
        
    def setup_database(self):
        """Настройка базы данных для статистики"""
        self.conn = sqlite3.connect('chess_stats.db', check_same_thread=False)
        cursor = self.conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                games_played INTEGER DEFAULT 0,
                games_won INTEGER DEFAULT 0,
                total_moves INTEGER DEFAULT 0,
                last_played TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                difficulty INTEGER,
                result TEXT,
                moves_count INTEGER,
                duration_seconds INTEGER,
                played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        self.conn.commit()
        logger.info("✅ База данных настроена")

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        user = update.effective_user
        user_id = user.id
        
        # Добавляем пользователя в базу данных
        self.add_user_to_db(user_id, user.username, user.first_name)
        
        # Создаем клавиатуру с Mini App
        keyboard = [
            [InlineKeyboardButton(
                "♟️ Играть в шахматы", 
                web_app=WebAppInfo(url=WEB_APP_URL)
            )],
            [InlineKeyboardButton("📊 Статистика", callback_data="stats")],
            [InlineKeyboardButton("📖 Правила", callback_data="rules")],
            [InlineKeyboardButton("ℹ️ О боте", callback_data="about")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        welcome_text = f"""
🎮 **Добро пожаловать в шахматы!**

Привет, {user.first_name}! 👋

♟️ **Что умеет бот:**
• 10 уровней сложности AI
• Красивый интерфейс в Telegram
• Статистика игр
• Подсказки и анализ

🚀 **Нажми кнопку ниже, чтобы начать играть!**
        """
        
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
        
        logger.info(f"📨 Пользователь {user_id} ({user.username}) запустил бота")

    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик callback запросов"""
        query = update.callback_query
        await query.answer()
        
        user_id = query.from_user.id
        data = query.data
        
        if data == "stats":
            await self.show_stats(query, user_id)
        elif data == "rules":
            await self.show_rules(query)
        elif data == "about":
            await self.show_about(query)
        elif data.startswith("difficulty_"):
            difficulty = int(data.split("_")[1])
            await self.start_game_with_difficulty(query, difficulty)

    async def show_stats(self, query, user_id):
        """Показать статистику пользователя"""
        stats = self.get_user_stats(user_id)
        
        if not stats:
            text = "📊 У вас пока нет игр. Начните играть!"
        else:
            win_rate = (stats['games_won'] / stats['games_played'] * 100) if stats['games_played'] > 0 else 0
            
            text = f"""
📊 **Ваша статистика:**

🎮 Игр сыграно: {stats['games_played']}
🏆 Побед: {stats['games_won']}
📈 Процент побед: {win_rate:.1f}%
♟️ Всего ходов: {stats['total_moves']}

⏰ Последняя игра: {stats['last_played'] or 'Никогда'}
            """
        
        keyboard = [
            [InlineKeyboardButton("♟️ Играть", web_app=WebAppInfo(url=WEB_APP_URL))],
            [InlineKeyboardButton("🏠 Главное меню", callback_data="main_menu")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )

    async def show_rules(self, query):
        """Показать правила шахмат"""
        text = """
📖 **Правила шахмат:**

🎯 **Цель игры:**
Поставить мат королю противника

♟️ **Как ходят фигуры:**
• Пешка: на 1 клетку вперед, бьет по диагонали
• Ладья: по горизонтали и вертикали
• Конь: буквой "Г"
• Слон: по диагонали
• Ферзь: во всех направлениях
• Король: на 1 клетку в любую сторону

⚡ **Особые правила:**
• Рокировка: король + ладья
• Взятие на проходе
• Превращение пешки в ферзя

🎮 **В боте:**
• 10 уровней сложности AI
• Подсказки во время игры
• Статистика ваших игр
        """
        
        keyboard = [
            [InlineKeyboardButton("♟️ Играть", web_app=WebAppInfo(url=WEB_APP_URL))],
            [InlineKeyboardButton("🏠 Главное меню", callback_data="main_menu")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )

    async def show_about(self, query):
        """Показать информацию о боте"""
        text = """
ℹ️ **О боте:**

🤖 **Chess Mini App Bot**
Версия: 1.0.0

✨ **Возможности:**
• Полноценная игра в шахматы
• 10 уровней сложности AI
• Красивый интерфейс
• Статистика игр
• Подсказки и анализ

🔧 **Технологии:**
• Telegram Mini App API
• JavaScript + HTML5
• Python + python-telegram-bot
• SQLite база данных

👨‍💻 **Разработчик:** AI Assistant
📅 **Дата создания:** 2025

🚀 **Наслаждайтесь игрой!**
        """
        
        keyboard = [
            [InlineKeyboardButton("♟️ Играть", web_app=WebAppInfo(url=WEB_APP_URL))],
            [InlineKeyboardButton("🏠 Главное меню", callback_data="main_menu")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )

    async def handle_web_app_data(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка данных от Mini App"""
        try:
            data = update.effective_message.web_app_data.data
            game_data = json.loads(data)
            
            user_id = update.effective_user.id
            
            # Сохраняем данные игры
            self.save_game_data(user_id, game_data)
            
            # Отправляем подтверждение
            await update.message.reply_text(
                "✅ Данные игры сохранены! Спасибо за игру! 🎮",
                reply_markup=InlineKeyboardMarkup([[
                    InlineKeyboardButton("♟️ Играть снова", web_app=WebAppInfo(url=WEB_APP_URL))
                ]])
            )
            
        except Exception as e:
            logger.error(f"Ошибка обработки данных Mini App: {e}")
            await update.message.reply_text("❌ Ошибка обработки данных игры")

    def add_user_to_db(self, user_id, username, first_name):
        """Добавить пользователя в базу данных"""
        cursor = self.conn.cursor()
        cursor.execute('''
            INSERT OR IGNORE INTO users (user_id, username, first_name)
            VALUES (?, ?, ?)
        ''', (user_id, username, first_name))
        self.conn.commit()

    def get_user_stats(self, user_id):
        """Получить статистику пользователя"""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT games_played, games_won, total_moves, last_played
            FROM users WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        if result:
            return {
                'games_played': result[0],
                'games_won': result[1],
                'total_moves': result[2],
                'last_played': result[3]
            }
        return None

    def save_game_data(self, user_id, game_data):
        """Сохранить данные игры"""
        cursor = self.conn.cursor()
        
        # Обновляем статистику пользователя
        cursor.execute('''
            UPDATE users 
            SET games_played = games_played + 1,
                games_won = games_won + ?,
                total_moves = total_moves + ?,
                last_played = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (
            1 if game_data.get('result') == 'win' else 0,
            game_data.get('moves_count', 0),
            user_id
        ))
        
        # Добавляем запись о игре
        cursor.execute('''
            INSERT INTO games (user_id, difficulty, result, moves_count, duration_seconds)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            game_data.get('difficulty', 1),
            game_data.get('result', 'unknown'),
            game_data.get('moves_count', 0),
            game_data.get('duration', 0)
        ))
        
        self.conn.commit()

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /help"""
        help_text = """
🆘 **Помощь по боту:**

📋 **Доступные команды:**
/start - Запустить бота
/help - Показать эту справку
/stats - Показать статистику

🎮 **Как играть:**
1. Нажмите кнопку "♟️ Играть в шахматы"
2. Выберите уровень сложности (1-10)
3. Играйте против AI!

💡 **Советы:**
• Начните с уровня 1-3
• Используйте подсказки
• Изучайте свои ошибки

❓ **Проблемы?**
Обратитесь к разработчику
        """
        
        await update.message.reply_text(help_text, parse_mode='Markdown')

    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /stats"""
        user_id = update.effective_user.id
        stats = self.get_user_stats(user_id)
        
        if not stats:
            text = "📊 У вас пока нет игр. Начните играть!"
        else:
            win_rate = (stats['games_won'] / stats['games_played'] * 100) if stats['games_played'] > 0 else 0
            
            text = f"""
📊 **Ваша статистика:**

🎮 Игр сыграно: {stats['games_played']}
🏆 Побед: {stats['games_won']}
📈 Процент побед: {win_rate:.1f}%
♟️ Всего ходов: {stats['total_moves']}

⏰ Последняя игра: {stats['last_played'] or 'Никогда'}
            """
        
        keyboard = [
            [InlineKeyboardButton("♟️ Играть", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )

    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик ошибок"""
        logger.error(f"Ошибка при обработке обновления: {context.error}")
        
        if update and update.effective_message:
            try:
                await update.effective_message.reply_text(
                    "❌ Произошла ошибка. Попробуйте позже."
                )
            except Exception as e:
                logger.error(f"Ошибка при отправке сообщения об ошибке: {e}")

def main():
    """Главная функция"""
    logger.info("🚀 Запуск Chess Mini App Bot...")
    
    # Создаем экземпляр бота
    chess_bot = ChessBot()
    
    # Создаем приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Добавляем обработчики
    application.add_handler(CommandHandler("start", chess_bot.start))
    application.add_handler(CommandHandler("help", chess_bot.help_command))
    application.add_handler(CommandHandler("stats", chess_bot.stats_command))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, chess_bot.handle_web_app_data))
    
    # Обработчик callback запросов
    from telegram.ext import CallbackQueryHandler
    application.add_handler(CallbackQueryHandler(chess_bot.handle_callback))
    
    # Обработчик ошибок
    application.add_error_handler(chess_bot.error_handler)
    
    logger.info("✅ Chess Mini App Bot успешно запущен!")
    logger.info("📱 Отправь /start боту для начала работы")
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    import json
    main()
