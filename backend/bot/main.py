# bot/main.py

from aiogram import Bot, Dispatcher
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message
from aiogram.filters import CommandStart
from aiogram import F
from aiogram.utils.markdown import hlink
import asyncio
import requests
import re

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

# === Хранение состояния ===
# В реальном проекте — используй Redis или базу
# Здесь — простой словарь (работает при одном инстансе)
pending_confirmation = {}  # { user_id: camp_id }

def get_campaign(camp_id: str):
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{camp_id}"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200 and response.json():
        return response.json()[0]
    return None

@dp.message(CommandStart())
async def start_command(message: Message):
    args = message.text.split(" ", 1)
    if len(args) > 1 and args[1].startswith("share_"):
        camp_id = args[1][6:]
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
    caption = camp["caption_template"].replace("{link}",  hlink('🔗', utm_link))

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
    user_id = callback.from_user.id
    camp_id = callback.data[8:]

    # Проверка дублей
    check_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/shares?user_id=eq.tg_{user_id}&campaign_id=eq.{camp_id}",
        headers=HEADERS
    )
    if check_response.status_code == 200 and check_response.json():
        await callback.answer("⚠️ Вы уже подтвердили", show_alert=True)
        return

    # Сохраняем, что пользователь хочет подтвердить
    pending_confirmation[user_id] = camp_id

    # Уведомляем
    await callback.answer("✅ Отлично! Теперь пришлите ссылку на статус: https://t.me/username/s/123")

    # Редактируем сообщение
    await callback.message.edit_text(
        "✅ Отлично! Теперь пришлите ссылку на статус:\n\n"
        "Пример: <code>https://t.me/username/s/123</code>",
        parse_mode="HTML"
    )

# === Регулярное выражение для ссылки на статус ===
STORY_URL_PATTERN = re.compile(r'https?://t\.me/([^/]+)/s/(\d+)', re.IGNORECASE)

def validate_story_url(url: str):
    # 1. Проверка формата
    match = re.search(r'https?://t\.me/([^/]+)/s/(\d+)', url, re.IGNORECASE)
    if not match:
        return False, "Неверный формат ссылки"

    username, story_id = match.groups()

    # 2. Проверка доступности
    try:
        response = requests.head(url, timeout=8, headers={
            "User-Agent": "StatusPromo Bot/1.0"
        }, allow_redirects=True)
        
        print('text:',response.text)
        print('content:',response.content)
        print('content:',response.headers)

        if response.status_code == 200:
            return True, "OK"
        elif response.status_code == 404:
            return False, "Статус не найден (404)"
        else:
            return False, f"Ошибка: {response.status_code}"

    except requests.exceptions.Timeout:
        return False, "Таймаут при проверке"
    except requests.exceptions.RequestException as e:
        return False, f"Ошибка сети: {str(e)}"


@dp.message()
async def handle_story_link(message: Message):
    user_id = message.from_user.id

    if user_id not in pending_confirmation:
        return

    text = message.text.strip()
    match = STORY_URL_PATTERN.search(text)
    if not match:
        await message.reply("❌ Пришлите ссылку в формате: https://t.me/username/s/123")
        return

    story_url = match.group(0)

    # 🔍 Проверяем доступность
    is_available, reason = validate_story_url(story_url)
    if not is_available:
        await message.reply(f"❌ Не удалось подтвердить статус:\n\n{reason}")
        return

    username_in_link = match.group(1)
    story_id = match.group(2)

    # Проверка: совпадает ли username
    user = message.from_user
    if user.username and user.username.lower() != username_in_link.lower():
        await message.reply(
            f"⚠️ Вы указали @{username_in_link}, но вы вошли как @{user.username}.\n"
            "Убедитесь, что публикуете с правильного аккаунта.",
        )
        return

    # === Все проверки пройдены — начисляем баллы ===
    camp_id = pending_confirmation.pop(user_id)  # Удаляем из ожидания
    camp = get_campaign(camp_id)

    if not camp:
        await message.reply("❌ Ошибка: кампания не найдена.")
        return

    points_reward = camp.get("points_reward", 10)

    # Получаем пользователя
    user_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS
    )
    if user_response.status_code != 200 or not user_response.json():
        await message.reply("❌ Ошибка: пользователь не найден.")
        return

    user_data = user_response.json()[0]
    new_points = user_data["points"] + points_reward

    # Обновляем баллы
    update_response = requests.patch(
        f"{SUPABASE_URL}/rest/v1/users?id=eq.tg_{user_id}",
        headers=HEADERS,
        json={"points": new_points}
    )

    if update_response.status_code == 204:
        # Сохраняем факт публикации
        requests.post(
            f"{SUPABASE_URL}/rest/v1/shares",
            headers=HEADERS,
            json={
                "user_id": f"tg_{user_id}",
                "campaign_id": camp_id,
                "timestamp": message.date.isoformat(),
                "story_url": f"https://t.me/{username_in_link}/s/{story_id}"
            }
        )
        await message.reply(
            f"✅ Публикация подтверждена!\n\n"
            f"Начислено: {points_reward} баллов\n"
            f"Ваш баланс: {new_points}"
        )
    else:
        await message.reply("⚠️ Ошибка начисления баллов")

async def main():
    print("✅ Бот запущен и слушает сообщения...")
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
