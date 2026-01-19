import os
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def command_start_handler(message: types.Message):
    builder = InlineKeyboardBuilder()
    
    # Button to launch the WebApp
    builder.button(
        text="Open Conscious YouTube", 
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    
    await message.answer(
        "Welcome to Conscious YouTube! 🌟\n"
        "Parents: Control what your kids watch.\n"
        "Kids: Earn rewards for mindful viewing.\n\n"
        "Click the button below to start.",
        reply_markup=builder.as_markup()
    )

async def start_bot():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(start_bot())
