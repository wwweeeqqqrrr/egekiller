from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models import Word
from sqlalchemy import update
from typing import List
from sqlalchemy import select, func
from fastapi import HTTPException,Header
from fastapi.middleware.cors import CORSMiddleware
from security import validate_telegram_data, get_user_data
from database import get_db

import schemas

app = FastAPI(title="MonkeyEGE API")
origins = [
    "https://egekiller.ru"
    "http://localhost",
    "http://localhost:8080",
    "null" 
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://api.egekiller.ru"],
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем все методы 
    allow_headers=["*"], # Разрешаем все заголовки
)
@app.post("/words/bulk", response_model=List[schemas.WordResponse])
async def add_multiple_words(words_list: List[schemas.WordCreate], db: AsyncSession = Depends(get_db)):
    """
    Эндпоинт для добавления сразу нескольких слов (массива).
    """
    new_words = [Word(word=item.word, accent_index=item.accent_index) for item in words_list]
    db.add_all(new_words)
  
    
    try:

        await db.commit()
        for word in new_words:
            await db.refresh(word)
            
        return new_words
        
    except Exception as e:
        await db.rollback()
        print(f"Ошибка массового добавления: {e}")
        raise HTTPException(
            status_code=400, 
            detail="Ошибка при сохранении. Возможно, одно или несколько слов уже существуют в базе"
        )
    
@app.get("/")
async def root():
    return {"message": "made by 645qrew"}

@app.post("/words/", response_model=schemas.WordResponse)
async def add_word(word: schemas.WordCreate, db: AsyncSession = Depends(get_db)):

    new_word = Word(word=word.word,accent_index=word.accent_index)
    db.add(new_word)
    await db.commit()
    await db.refresh(new_word)
    print(new_word)
    return new_word



@app.get("/words/random", response_model=List[schemas.WordResponse])
async def get_random_words(limit: int = 20, db: AsyncSession = Depends(get_db),init_data: str = Header(..., alias="X-Telegram-Init-Data")):
    """
    Эндпоинт выдает случайную партию слов для тренировки.
    По умолчанию 20 штук, но можно запросить любое количество (limit)
    """
    is_valid = await validate_telegram_data(init_data)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid Telegram data")

    query = select(Word).order_by(func.random()).limit(limit)
    
    result = await db.execute(query)
    
    words = result.scalars().all()
    print(words)
    return words

