const wordsContainer = document.getElementById('words-container');
const tg = window.Telegram.WebApp;
tg.ready();
const API_URL = 'http://api.egekiller.ru'


const VOWELS = "аеёиоуыэюя";
let words = []; 
let correctIndex = -1;
let word_limit = 30

async function fetchWords() {  // ПОЛУЧЕНИЕ СЛОВ С БЭКЕНДА
    try {
        const response = await fetch(`${API_URL}/words/random?limit=${word_limit}`,{headers: {'X-Telegram-Init-Data': tg.initData}});
        const data = await response.json();
        console.log(data)
        words = data
        displayCurrentWord()
        return words
        
    } catch (error) {
        console.error("Ошибка при загрузке слов:", error);
        wordsContainer.textContent = `Не удалось загрузить слова. Убедитесь, что бэкенд запущен.${error}`;
    }
}

function displayCurrentWord() {
    if (words.length === 0){
         wordsContainer.innerHTML = `
            <div style="text-align: center;">
                <h2>Уверен что точно все запомнил?</h2>
                <button onclick="location.reload()" style="padding: 10px 20px;font-family: 'Courier New', Courier, monospace; font-size: 18px; cursor: pointer; border-radius: 8px; border: none; background-color: #4CAF50; color: white; margin-top: 20px;">Хочу еще</button>
            </div>
        `;
        return; 
    }; 
    wordsContainer.innerHTML = '';
    const randomIndex = Math.floor(Math.random() * words.length);
    const wordObject = words.splice(randomIndex, 1)[0];
    correctIndex = wordObject.accent_index;
    const poppedWord = wordObject.word.toLowerCase();
    const wordDiv = document.createElement('div');
    wordDiv.classList.add('word')
    for (let i =0; i < poppedWord.length;i++){
        let type = ''
        const letter = document.createElement('span')
        letter.textContent = poppedWord[i]
        const isVowel = VOWELS.includes(poppedWord[i].toLowerCase());
        letter.classList.add(isVowel ? 'vowel' : 'consonant');
        letter.dataset.index = i;
        wordDiv.appendChild(letter)
        
    }
    
    wordsContainer.appendChild(wordDiv)



   
    
    // 
    // highlightCurrentLetter();
}
// displayCurrentWord(words[0])
// // Функция для подсветки текущей буквы
// function highlightCurrentLetter() {
//     const wordDiv = wordsContainer.children[currentWordIndex];
//     const letterSpan = wordDiv.children[currentLetterIndex];
//     letterSpan.classList.add('active');
// }

// // Запускаем всё при загрузке страницы
fetchWords();


wordsContainer.addEventListener('click',(e)=>{
    const clickedLetter = e.target.closest('span');
    
    console.log(clickedLetter)
    if (clickedLetter.classList.contains("vowel") && correctIndex !== -1) {
        const index = parseInt(clickedLetter.dataset.index);
        if (index === correctIndex){
            clickedLetter.classList.add('correct_letter')//добавить зелены цвет
            setTimeout(displayCurrentWord, 600); 

        }else{
            clickedLetter.classList.add('incorrect_letter') // добавить красны цвет
        }
        console.log(index)

    }

})
    
        
// document.addEventListener('keydown', (event) => {
//     // Если все слова напечатаны, ничего не делаем
//     if (currentWordIndex >= words.length) {
//         return;
//     }

//     const currentWordDiv = wordsContainer.children[currentWordIndex];
    
//     // --- Логика перехода на следующее слово по пробелу ---
//     if (event.key === ' ') {
//         // Запрещаем стандартное поведение пробела (прокрутку страницы)
//         event.preventDefault(); 
        
//         // Переходим, только если мы закончили печатать слово
//         if (currentLetterIndex === currentWordDiv.children.length) {
//             currentWordIndex++; // Переключаемся на следующее слово
//             currentLetterIndex = 0; // Сбрасываем счетчик букв

//             // Проверяем, не закончились ли слова
//             if (currentWordIndex < words.length) {
//                  highlightCurrentLetter();
//             } else {
//                 wordsContainer.innerHTML = '<h2>Тренировка окончена!</h2>';
//             }
//         }
//         return; // Выходим, чтобы не обрабатывать пробел как букву
//     }

//     // --- Логика проверки букв (твой код, но с защитой от ошибки) ---
//     // Не даем печатать дальше, если слово уже закончилось
//     if (currentLetterIndex >= currentWordDiv.children.length) {
//         return; 
//     }

//     const currentLetterSpan = currentWordDiv.children[currentLetterIndex];
//     const expectedLetter = currentLetterSpan.textContent;
    
//     // Не реагируем на служебные клавиши, которые могли просочиться
//     if (event.key.length !== 1) return;
    
//     const typedLetter = event.key;

//     // Снимаем старую подсветку
//     currentLetterSpan.classList.remove('active');

//     // Твой код здесь работает идеально!
//     if (typedLetter === expectedLetter) {
//         currentLetterSpan.classList.add('correct');
//     } else {
//         currentLetterSpan.classList.add('incorrect');
//         sessionMistakes.add(words[currentWordIndex].id);
//     }
    
//     currentLetterIndex++; // Переходим к следующей букве

//     // Подсвечиваем новую букву, если она есть
//     if (currentLetterIndex < currentWordDiv.children.length) {
//         highlightCurrentLetter();
//     } else if (currentWordIndex < words.length - 1) {
//         // Если слово кончилось, можно показать "пробел" для перехода
//         // (это мы сделаем позже, пока просто ждем нажатия)
//     }
// });

// async function finishSession() {
//     // 1. Собираем все ID слов из текущей сессии
//     const allWordIds = words.map(word => word.id);

//     // 2. Превращаем наш Set с ошибками в обычный массив
//     const mistakenWordIds = Array.from(sessionMistakes);

//     console.log("Все слова в сессии:", allWordIds);
//     console.log("Слова с ошибками:", mistakenWordIds);

//     // 3. Отправляем данные на бэкенд
//     try {
//         const results = {
//             user_id: 1, // Временно, пока нет регистрации
//             all_words: allWordIds,
//             mistaken_words: mistakenWordIds
//         };
        
//         // Эндпоинт теперь назовем более логично: /stats/session
//         const response = await fetch(`${API_URL}/stats/session`, {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify(results)
//         });

//         if (response.ok) {
//             console.log("Статистика сессии успешно сохранена!");
//             wordsContainer.innerHTML = '<h2>Тренировка окончена!</h2><h3>Результаты сохранены.</h3>';
//         } else {
//             const errorData = await response.json();
//             console.error("Ошибка сохранения статистики:", errorData);
//         }

//     } catch (error) {
//         console.error("Сетевая ошибка:", error);
//     }
// }