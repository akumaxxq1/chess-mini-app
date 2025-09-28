# 🚀 Деплой шахмат на GitHub Pages

## 📋 Пошаговая инструкция:

### 1. Создай GitHub аккаунт
- Перейди на [github.com](https://github.com)
- Зарегистрируйся или войди

### 2. Создай новый репозиторий
- Нажми "New repository"
- Название: `chess-mini-app`
- Сделай публичным (Public)
- НЕ добавляй README, .gitignore, лицензию

### 3. Загрузи файлы
```bash
# В папке chess_mini_app выполни:
git init
git add .
git commit -m "Initial commit: Chess Mini App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chess-mini-app.git
git push -u origin main
```

### 4. Включи GitHub Pages
- Перейди в Settings репозитория
- Прокрути до "Pages"
- Source: Deploy from a branch
- Branch: main
- Folder: / (root)
- Нажми Save

### 5. Получи ссылку
- Твой сайт будет доступен по адресу:
- `https://YOUR_USERNAME.github.io/chess-mini-app`

## 🔧 Настройка бота:

После получения ссылки обнови `chess_bot.py`:

```python
WEB_APP_URL = "https://YOUR_USERNAME.github.io/chess-mini-app"
```

## ✅ Готово!

Твой Mini App будет работать по HTTPS и доступен всем!
