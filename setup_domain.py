#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Скрипт для автоматической настройки домена и деплоя шахмат
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Выполнить команду и показать результат"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - успешно!")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ {description} - ошибка!")
            print(result.stderr)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ {description} - исключение: {e}")
        return False

def setup_git():
    """Настройка Git репозитория"""
    print("🚀 Настройка Git репозитория...")
    
    # Проверяем, есть ли уже git
    if not os.path.exists('.git'):
        run_command('git init', 'Инициализация Git')
    
    # Добавляем все файлы
    run_command('git add .', 'Добавление файлов в Git')
    
    # Первый коммит
    run_command('git commit -m "Initial commit: Chess Mini App"', 'Первый коммит')
    
    print("✅ Git настроен!")
    print("📝 Следующие шаги:")
    print("1. Создай репозиторий на GitHub: https://github.com/new")
    print("2. Назови его: chess-mini-app")
    print("3. Сделай публичным")
    print("4. Выполни команды:")
    print("   git branch -M main")
    print("   git remote add origin https://github.com/YOUR_USERNAME/chess-mini-app.git")
    print("   git push -u origin main")

def setup_github_pages():
    """Инструкции по настройке GitHub Pages"""
    print("\n🌐 Настройка GitHub Pages:")
    print("1. Перейди в Settings твоего репозитория")
    print("2. Прокрути до 'Pages'")
    print("3. Source: Deploy from a branch")
    print("4. Branch: main")
    print("5. Folder: / (root)")
    print("6. Нажми Save")
    print("7. Твой сайт будет доступен по адресу:")
    print("   https://YOUR_USERNAME.github.io/chess-mini-app")

def update_bot_config():
    """Обновить конфигурацию бота"""
    print("\n🤖 Обновление конфигурации бота...")
    
    username = input("Введи свой GitHub username: ").strip()
    if not username:
        print("❌ Username не может быть пустым!")
        return False
    
    # Обновляем chess_bot.py
    try:
        with open('chess_bot.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace(
            'https://YOUR_USERNAME.github.io/chess-mini-app',
            f'https://{username}.github.io/chess-mini-app'
        )
        
        with open('chess_bot.py', 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Конфигурация обновлена для: {username}")
        return True
    except Exception as e:
        print(f"❌ Ошибка обновления конфигурации: {e}")
        return False

def main():
    """Главная функция"""
    print("🎮 Настройка домена для шахмат в Telegram")
    print("=" * 50)
    
    # Проверяем, что мы в правильной папке
    if not os.path.exists('index.html'):
        print("❌ Файл index.html не найден!")
        print("Запусти скрипт из папки chess_mini_app")
        return
    
    # Настраиваем Git
    setup_git()
    
    # Обновляем конфигурацию бота
    if update_bot_config():
        print("\n🎉 Настройка завершена!")
        print("\n📋 Что делать дальше:")
        print("1. Создай репозиторий на GitHub")
        print("2. Загрузи код (команды выше)")
        print("3. Включи GitHub Pages")
        print("4. Запусти бота: python chess_bot.py")
        print("5. Протестируй Mini App в Telegram!")
        
        setup_github_pages()
    else:
        print("❌ Настройка не завершена. Попробуй еще раз.")

if __name__ == '__main__':
    main()
