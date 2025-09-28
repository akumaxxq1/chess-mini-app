# 🚀 БЫСТРЫЙ ДЕПЛОЙ ШАХМАТ

## 📋 Пошаговая инструкция (5 минут):

### 1. 📁 Создай GitHub репозиторий
- Перейди на: https://github.com/new
- Название: `chess-mini-app`
- Сделай **публичным** ✅
- НЕ добавляй README, .gitignore, лицензию
- Нажми "Create repository"

### 2. 📤 Загрузи файлы
- Нажми "uploading an existing file"
- Перетащи ВСЕ файлы из папки `chess_mini_app`:
  - index.html
  - chess.css
  - chess.js
  - chess_bot.py
  - requirements.txt
  - README.md
  - package.json
  - .gitignore
  - deploy_github.md
  - setup_domain.py

### 3. 💾 Сохрани
- Внизу напиши: "Initial commit: Chess Mini App"
- Нажми "Commit changes"

### 4. 🌐 Включи GitHub Pages
- Перейди в **Settings** репозитория
- Прокрути до **"Pages"**
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**
- Нажми **Save**

### 5. 🔗 Получи ссылку
- Твой сайт будет доступен по адресу:
- `https://YOUR_USERNAME.github.io/chess-mini-app`
- Замени `YOUR_USERNAME` на свой GitHub username

### 6. 🤖 Обнови бота
- Открой `chess_bot.py`
- Замени строку:
```python
WEB_APP_URL = "https://YOUR_USERNAME.github.io/chess-mini-app"
```
- На свою ссылку

### 7. 🎮 Запусти бота
```bash
python chess_bot.py
```

## ✅ Готово!

Твой Mini App будет работать по HTTPS и доступен всем!

## 🆘 Если что-то не работает:
- Проверь, что репозиторий публичный
- Убедись, что все файлы загружены
- Подожди 5-10 минут после включения Pages
- Проверь ссылку в браузере
