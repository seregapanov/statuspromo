# bot/main.py

from aiogram import Bot, Dispatcher
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from aiogram.filters import CommandStart
from aiogram import F
import asyncio
import requests

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
dp = Dispatcher()

def get_campaign(camp_id: str):
    """Получить кампанию из Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{camp_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200 and response.json():
        return response.json()[0]
    return None

@dp.message(CommandStart())
async def start_command(message: Message):
    args = message.text.split(" ")
    if len(args) > 1 and args[1].startswith("share_"):
        camp_id = args[1][6:]  # обрезаем "share_"
        camp = get_campaign(camp_id)
        if not camp:
            await message.answer("❌ Кампания не найдена.")
            return
        await send_campaign_materials(message.from_user, camp)
    else:
        await message.answer("Привет! Нажми на ссылку из приложения.")

async def send_campaign_materials(user, camp):
    username = user.username or f"tg{user.id}"
    
    # Генерация UTM-ссылки
    utm_link = camp["target_link"] + f"?utm_source=telegram_status&utm_content=@{username}"
    
    # Подпись
    caption = camp["caption_template"].replace("{link}", utm_link)

    # Отправка медиа
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

    # Кнопка подтверждения
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Опубликовал", callback_data=f"confirm_{camp['id']}")]
    ])
    await bot.send_message(user.id, "Нажми, чтобы подтвердить публикацию:", reply_markup=keyboard)

@dp.callback_query(F.data.startswith("confirm_"))
async def handle_confirmation(callback):
    print(callback.data)
    user_id = callback.from_user.id
    camp_id = callback.data[8:]

    # Получаем кампанию
    camp = get_campaign(camp_id)
    if not camp:
        await callback.answer("❌ Кампания не найдена")
        return

    # 1. Проверить, не подтверждал ли уже
    check_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/shares?user_id=eq.tg_{user_id}&campaign_id=eq.{camp_id}",
        headers=HEADERS
    )
    if check_response.status_code == 200 and check_response.json():
        await callback.answer("⚠️ Вы уже подтвердили эту публикацию", show_alert=True)
        return

    # 🔑 Берём баллы из кампании
    points_reward = camp.get("points_reward", 10)  # по умолчанию 10

    # Получаем пользователя
    user_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS
    )

    if user_response.status_code != 200 or not user_response.json():
        await callback.answer("❌ Пользователь не найден")
        return

    user = user_response.json()[0]
    new_points = user["points"] + points_reward

    
    # Обновляем баллы
    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS,
        json={"points": new_points}
    )

    if update_response.status_code == 204:
        ## Сохраняем факт публикации
        requests.post(
            f"{SUPABASE_URL}/rest/v1/shares",
            headers=HEADERS,
            json={
                "user_id": f"tg_{user_id}",
                "campaign_id": camp_id,
                "timestamp": callback.message.date.isoformat()
            }
        )
        await callback.answer(f"✅ Начислено {points_reward} баллов")
        await callback.message.edit_text(
            f"✅ Публикация подтверждена!\n\n"
            f"Начислено: {points_reward} баллов\n"
            f"Ваш баланс: {new_points}"
        )
    else:
        await callback.answer("⚠️ Ошибка начисления")
        print("Ошибка обновления:", update_response.text)

async def main():
    print("✅ Бот запущен и слушает сообщения...")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())