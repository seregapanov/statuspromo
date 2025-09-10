# bot/main.py

from aiogram import Bot, Dispatcher
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from aiogram.filters import Command
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
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{camp_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200 and response.json():
        return response.json()[0]
    return None

@dp.message(Command("start"))
async def start_command(message: Message):
    args = message.text.split(" ", 1)
    
    if len(args) > 1:
        arg = args[1]
        if arg.startswith("share_"):
            camp_id = arg[6:]
            camp = get_campaign(camp_id)
            if not camp:
                await message.answer("❌ Кампания не найдена.")
                return
            await send_campaign_materials(message.from_user, camp)
            return
        elif arg.startswith("auth"):
            # Специальный режим — вход в веб
            pass  # Обработаем ниже

    # Простой старт
    await message.answer("Привет! Нажми на ссылку из приложения.")

@dp.message(Command("profile"))
async def profile_command(message: Message):
    user = message.from_user
    auth_link = f"https://statuspromo.vercel.app/auth-success?tg_id={user.id}&username={user.username or ''}&first_name={user.first_name}&last_name={user.last_name or ''}"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📱 Открыть профиль", url=auth_link)]
    ])
    
    await message.answer("Ваш профиль в StatusPromo", reply_markup=keyboard)

@dp.message()
async def any_message(message: Message):
    # На любое сообщение — предлагаем открыть веб
    user = message.from_user
    auth_link = f"https://statuspromo.vercel.app/auth-success?tg_id={user.id}&username={user.username or ''}&first_name={user.first_name}&last_name={user.last_name or ''}"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Продолжить в приложении", url=auth_link)]
    ])
    
    await message.answer(
        "👋 Привет! Нажми кнопку ниже, чтобы открыть веб-версию и продолжить.",
        reply_markup=keyboard
    )

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

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Опубликовал", callback_data=f"confirm_{camp['id']}")]
    ])
    await bot.send_message(user.id, "Нажми, чтобы подтвердить публикацию:", reply_markup=keyboard)

@dp.callback_query(lambda c: c.data.startswith("confirm_"))
async def handle_confirmation(callback):
    user_id = callback.from_user.id
    camp_id = callback.data[8:]

    camp = get_campaign(camp_id)
    if not camp:
        await callback.answer("❌ Кампания не найдена")
        return

    # Проверка дублей
    check_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/shares?user_id=eq.tg_{user_id}&campaign_id=eq.{camp_id}",
        headers=HEADERS
    )
    if check_response.status_code == 200 and check_response.json():
        await callback.answer("⚠️ Вы уже подтвердили", show_alert=True)
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

async def main():
    print("✅ Бот запущен и слушает сообщения...")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
