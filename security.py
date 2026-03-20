import os
import hmac
import hashlib
import json
from urllib.parse import parse_qsl

async def validate_telegram_data(init_data: str) -> bool:
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        print("Ошибка: TELEGRAM_BOT_TOKEN не найден")
        return False

    try:

        parsed_data = dict(parse_qsl(init_data))
        

        if "hash" not in parsed_data:
            return False
        received_hash = parsed_data.pop("hash")
        

        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        

        secret_key = hmac.new(
            key=b"WebAppData",
            msg=bot_token.encode(),
            digestmod=hashlib.sha256
        ).digest()
        
   
        calculated_hash = hmac.new(
            key=secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
      
        return hmac.compare_digest(calculated_hash, received_hash)
        
    except Exception as e:
        print(f"Ошибка валидации: {e}")
        return False

def get_user_data(init_data: str) -> dict:
    """Извлекает и декодирует данные пользователя из валидной init_data"""
    parsed_data = dict(parse_qsl(init_data))
    if "user" in parsed_data:
     
        return json.loads(parsed_data["user"])
    return {}