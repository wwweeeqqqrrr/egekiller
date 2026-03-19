import os
from urllib.parse import unquote

from telegram.ext import ExtBot


async def validate_telegram_data(init_data: str):
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        return False


    return ExtBot(bot_token).validate_web_app_data(init_data)


def get_user_data(init_data: str) -> dict:
    data = dict(x.split("=") for x in unquote(init_data).split("&"))
    user_data = dict(x.split("=") for x in unquote(data.get("user")).split("&"))
    return user_data