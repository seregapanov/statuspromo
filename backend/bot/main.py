# backend/bot/main.py

from aiogram import Bot, Dispatcher, executor, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram import filters
import requests
import asyncio
import uvicorn
from fastapi import FastAPI
import os
import logging

# === Включаем логи aiogram ===
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# === Настройки Supabase ===
SUPABASE_URL = "https://hezxfkeflzupndlbkshi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlenhma2VmbHp1cG5kbGJrc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzU5MDEsImV4cCI6MjA3MjY1MTkwMX0.qJYyJinI27Zx4bvYBv9d70cs-J3QPrFcwBLNAxz91eg"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

BOT_TOKEN = "8218788965:AAHu00w5c7gTgBeukl6ESnBtPMVS_imDzsw"
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

# === FastAPI ===
app = FastAPI(title="StatusPromo Bot")

@app.get("/")
def home():
    logger.info("Health check received")
    return {"status": "Bot is running", "service": "StatusPromo"}

@app.get("/health")
def health():
    return {"status": "ok", "bot": "aiogram"}

# === Функции бота ===
def get_campaign(camp_id: str):
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{camp_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200 and response.json():
        return response.json()[0]
    return None

@dp.message_handler(filters.Command("start"))
async def start_command(message: types.Message):
    logger.info(f"Получена команда /start от {message.from_user.id}")
    args = message.get_args()
    if args.startswith("share_"):
        camp_id = args[6:]
        camp = get_campaign(camp_id)
        if not camp:
            await message.answer("❌ Кампания не найдена.")
            return
        await send_campaign_materials(message.from_user, camp)
    else:
        await message.answer("Привет! Нажми на ссылку из приложения.")

async def send_campaign_materials(user, camp):
    username = user.username or f"tg{user.id}"
    utm_link = camp["target_link"] + f"?utm_source=telegram_status&utm_content=@{username}"
    caption = camp["caption_template"].replace("{link}", utm_link)

    if camp.get("video_url"):
        try:
            await bot.send_video(
                chat_id=user.id,
                video=camp["video_url"],
                caption=caption,
                parse_mode="HTML"
            )
        except:
            await bot.send_photo(
                chat_id=user.id,
                photo=camp.get("image_url", "https://via.placeholder.com/800x1422/229ED9/FFFFFF?text=Ad"),
                caption=caption,
                parse_mode="HTML"
            )
    else:
        await bot.send_photo(
            chat_id=user.id,
            photo=camp.get("image_url", "https://via.placeholder.com/800x1422/229ED9/FFFFFF?text=Ad"),
            caption=caption,
            parse_mode="HTML"
        )

    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton(text="✅ Опубликовал", callback_data=f"confirm_{camp['id']}"))
    await bot.send_message(user.id, "Нажми, чтобы подтвердить публикацию:", reply_markup=keyboard)

@dp.callback_query_handler(lambda c: c.data.startswith("confirm_"))
async def handle_confirmation(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    camp_id = callback.data[8:]
    logger.info(f"Подтверждение публикации: пользователь {user_id}, кампания {camp_id}")

    camp = get_campaign(camp_id)
    if not camp:
        await callback.answer("❌ Кампания не найдена")
        return

    points_reward = camp.get("points_reward", 10)

    user_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS
    )

    if user_response.status_code != 200 or not user_response.json():
        await callback.answer("❌ Пользователь не найден")
        return

    user = user_response.json()[0]
    new_points = user["points"] + points_reward

    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS,
        json={"points": new_points}
    )

    if update_response.status_code == 204:
        await callback.answer(f"✅ Начислено {points_reward} баллов")
        await callback.message.edit_text(
            f"✅ Публикация подтверждена!\n\n"
            f"Начислено: {points_reward} баллов\n"
            f"Ваш баланс: {new_points}"
        )

        # Сохраняем факт публикации
        requests.post(
            f"{SUPABASE_URL}/rest/v1/shares",
            headers=HEADERS,
            json={
                "user_id": f"tg_{user_id}",
                "campaign_id": camp_id,
                "timestamp": callback.message.date.isoformat()
            }
        )
    else:
        await callback.answer("⚠️ Ошибка начисления")

# === Запуск: всё в одном цикле ===
async def run_bot():
    logger.info("🚀 Запуск бота...")
    await dp.start_polling()
    logger.info("🛑 Бот остановлен")

if __name__ == "__main__":
    logger.info("✅ Сервис запущен. Инициализация...")

    # Запускаем FastAPI в отдельном потоке
    import threading

    def run_server():
        port = int(os.environ.get("PORT", 8000))
        logger.info(f"🌐 FastAPI запущен на порту {port}")
        uvicorn.run(app, host="0.0.0.0", port=port, loop="none")

    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    # Запускаем бота
    try:
        asyncio.run(run_bot())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
