/**
 * Chalkboard Challenge - Juego de cálculo mental
 * El usuario debe resolver operaciones matemáticas rápidamente
 */
class ChalkboardChallenge {
    /**
     * Constructor del juego Chalkboard Challenge
     * @param {Function} updateStatsCallback - Función para actualizar estadísticas en la UI
     */
    constructor(updateStatsCallback) {
        this.updateStats = updateStatsCallback;
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameActive = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.questionTimer = null;
        this.timePerQuestion = 10; // Tiempo inicial por pregunta en segundos
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.operations = ['+', '-', '×']; // Operaciones disponibles
        this.consecutiveCorrect = 0;
        this.gameTime = 60; // Tiempo de juego en segundos
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');

        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Chalkboard Challenge</h2>
                <p>Resuelve las operaciones matemáticas lo más rápido posible.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="chalkboard-container">
                <div class="chalkboard">
                    <div class="question">5 + 3 = ?</div>
                    <div class="timer-bar"><div class="timer-progress"></div></div>
                </div>
                <div class="answer-pad">
                    <div class="answer-display">?</div>
                    <div class="number-pad">
                        <button class="num-btn" data-num="1">1</button>
                        <button class="num-btn" data-num="2">2</button>
                        <button class="num-btn" data-num="3">3</button>
                        <button class="num-btn" data-num="4">4</button>
                        <button class="num-btn" data-num="5">5</button>
                        <button class="num-btn" data-num="6">6</button>
                        <button class="num-btn" data-num="7">7</button>
                        <button class="num-btn" data-num="8">8</button>
                        <button class="num-btn" data-num="9">9</button>
                        <button class="num-btn" data-num="0">0</button>
                        <button class="num-btn" data-num="clear">C</button>
                        <button class="num-btn" data-num="submit">✓</button>
                    </div>
                </div>
            </div>
            <button id="start-chalkboard" class="control-btn">Comenzar</button>
        `;

        // Configurar el botón de inicio
        document.getElementById('start-chalkboard').addEventListener('click', () => {
            this.startGame();
        });

        // Configurar botones del teclado numérico
        const numButtons = document.querySelectorAll('.num-btn');
        numButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!this.gameActive) return;

                const value = button.getAttribute('data-num');

                if (value === 'clear') {
                    this.clearAnswer();
                } else if (value === 'submit') {
                    this.submitAnswer();
                } else {
                    this.addDigit(value);
                }
            });
        });

        // Configurar atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;

            if (e.key >= '0' && e.key <= '9') {
                this.addDigit(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearAnswer();
            } else if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: '0% precisión'
        });

        // Añadir estilos específicos para Chalkboard Challenge si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Chalkboard Challenge
     */
    addStyles() {
        // Verificar si ya existe un estilo para Chalkboard Challenge
        if (!document.getElementById('chalkboard-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'chalkboard-styles';
            styleElement.textContent = `
                .chalkboard-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .chalkboard {
                    width: 100%;
                    background-color: #2d4a22;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    position: relative;
                }
                
                .question {
                    font-family: 'Comic Sans MS', cursive, sans-serif;
                    font-size: 36px;
                    color: white;
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .timer-bar {
                    width: 100%;
                    height: 10px;
                    background-color: rgba(255, 255, 255, 0.3);
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .timer-progress {
                    height: 100%;
                    width: 100%;
                    background-color: #4caf50;
                    transition: width 0.1s linear;
                }
                
                .answer-pad {
                    width: 100%;
                    background-color: white;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                .answer-display {
                    font-size: 32px;
                    text-align: center;
                    margin-bottom: 15px;
                    height: 40px;
                    background-color: #f5f5f5;
                    border-radius: 4px;
                    padding: 5px;
                }
                
                .number-pad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
                
                .num-btn {
                    padding: 15px;
                    font-size: 20px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .num-btn:hover {
                    background-color: #357abd;
                }
                
                .num-btn[data-num="clear"] {
                    background-color: #f44336;
                }
                
                .num-btn[data-num="submit"] {
                    background-color: #4caf50;
                }
                
                .correct-answer {
                    color: #4caf50;
                    font-weight: bold;
                }
                
                .incorrect-answer {
                    color: #f44336;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(styleElement);
        }
    }

    /**
     * Inicia una nueva ronda del juego
     */
    startGame() {
        // Reiniciar variables de juego
        this.score = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameActive = true;
        this.level = 1;
        this.consecutiveCorrect = 0;
        this.timePerQuestion = 10;

        // Cambiar texto del botón
        const startButton = document.getElementById('start-chalkboard');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;

        // Limpiar respuesta
        this.clearAnswer();

        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();

        // Generar primera pregunta
        this.generateQuestion();
    }

    /**
     * Genera una nueva pregunta matemática
     */
    generateQuestion() {
        if (!this.gameActive) return;

        // Cancelar el temporizador de pregunta anterior si existe
        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
        }

        // Determinar la dificultad según el nivel
        let maxNum1, maxNum2;

        switch (this.level) {
            case 1:
                maxNum1 = 10;
                maxNum2 = 10;
                break;
            case 2:
                maxNum1 = 20;
                maxNum2 = 10;
                break;
            case 3:
                maxNum1 = 20;
                maxNum2 = 20;
                break;
            case 4:
                maxNum1 = 50;
                maxNum2 = 20;
                break;
            default:
                maxNum1 = 100;
                maxNum2 = 50;
                break;
        }

        // Seleccionar operación según el nivel
        let operation;
        if (this.level <= 2) {
            // Niveles 1-2: solo suma y resta
            operation = this.operations[Math.floor(Math.random() * 2)];
        } else {
            // Niveles 3+: todas las operaciones
            operation = this.operations[Math.floor(Math.random() * this.operations.length)];
        }

        // Generar números aleatorios
        let num1 = Math.floor(Math.random() * maxNum1) + 1;
        let num2 = Math.floor(Math.random() * maxNum2) + 1;

        // Asegurar que la resta no dé resultado negativo
        if (operation === '-' && num2 > num1) {
            [num1, num2] = [num2, num1]; // Intercambiar valores
        }

        // Calcular respuesta
        let answer;
        switch (operation) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '×':
                answer = num1 * num2;
                break;
        }

        // Guardar pregunta y respuesta
        this.currentQuestion = `${num1} ${operation} ${num2} = ?`;
        this.currentAnswer = answer;

        // Mostrar pregunta
        document.querySelector('.question').textContent = this.currentQuestion;

        // Reiniciar barra de tiempo
        const timerProgress = document.querySelector('.timer-progress');
        timerProgress.style.width = '100%';

        // Iniciar cuenta regresiva para la pregunta
        let timeLeft = this.timePerQuestion;

        const updateTimer = () => {
            timeLeft -= 0.1;
            const percentage = (timeLeft / this.timePerQuestion) * 100;
            timerProgress.style.width = `${percentage}%`;

            if (timeLeft <= 0) {
                this.handleTimeout();
            } else if (this.gameActive) {
                this.questionTimer = setTimeout(updateTimer, 100);
            }
        };

        this.questionTimer = setTimeout(updateTimer, 100);
    }

    /**
     * Añade un dígito a la respuesta actual
     * @param {string} digit - Dígito a añadir
     */
    addDigit(digit) {
        const answerDisplay = document.querySelector('.answer-display');
        const currentValue = answerDisplay.textContent;

        // Limitar a 3 dígitos máximo
        if (currentValue.length >= 3 && currentValue !== '?') return;

        // Reemplazar el signo de interrogación con el dígito
        if (currentValue === '?') {
            answerDisplay.textContent = digit;
        } else {
            answerDisplay.textContent += digit;
        }
    }

    /**
     * Limpia la respuesta actual
     */
    clearAnswer() {
        document.querySelector('.answer-display').textContent = '?';
    }

    /**
     * Envía la respuesta del usuario
     */
    submitAnswer() {
        if (!this.gameActive) return;

        const answerDisplay = document.querySelector('.answer-display');
        const userAnswer = answerDisplay.textContent;

        // Verificar si hay una respuesta
        if (userAnswer === '?') return;

        // Convertir a número
        const userNum = parseInt(userAnswer, 10);

        // Verificar si la respuesta es correcta
        const isCorrect = userNum === this.currentAnswer;

        // Actualizar contadores
        this.totalAnswers++;

        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;

            // Calcular puntos basados en velocidad y nivel
            const timeLeft = document.querySelector('.timer-progress').style.width.replace('%', '') / 100 * this.timePerQuestion;
            const timeBonus = Math.max(1, Math.floor(timeLeft * 2));
            const pointsEarned = 10 + timeBonus + (this.level * 5);

            this.score += pointsEarned;

            // Mostrar feedback positivo
            answerDisplay.textContent = userAnswer;
            answerDisplay.className = 'answer-display correct-answer';

            // Aumentar nivel si hay suficientes respuestas correctas consecutivas
            if (this.consecutiveCorrect >= 3) {
                this.levelUp();
            }

            // Mostrar mensaje
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);
        } else {
            this.consecutiveCorrect = 0;

            // Mostrar feedback negativo
            answerDisplay.textContent = `${userAnswer} ≠ ${this.currentAnswer}`;
            answerDisplay.className = 'answer-display incorrect-answer';

            // Mostrar mensaje
            this.updateInstructions(`¡Incorrecto! La respuesta era ${this.currentAnswer}`);
        }

        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión`
        });

        // Cancelar el temporizador de pregunta
        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
        }

        // Programar la siguiente pregunta después de un breve feedback
        setTimeout(() => {
            if (this.gameActive) {
                answerDisplay.className = 'answer-display';
                this.clearAnswer();
                this.generateQuestion();
            }
        }, 1500);
    }

    /**
     * Maneja el caso cuando el usuario no responde a tiempo
     */
    handleTimeout() {
        if (!this.gameActive) return;

        this.totalAnswers++;
        this.consecutiveCorrect = 0;

        // Mostrar la respuesta correcta
        const answerDisplay = document.querySelector('.answer-display');
        answerDisplay.textContent = `= ${this.currentAnswer}`;
        answerDisplay.className = 'answer-display incorrect-answer';

        // Mostrar mensaje
        this.updateInstructions('¡Tiempo agotado!');

        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión`
        });

        // Programar la siguiente pregunta
        setTimeout(() => {
            if (this.gameActive) {
                answerDisplay.className = 'answer-display';
                this.clearAnswer();
                this.generateQuestion();
            }
        }, 1500);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        this.consecutiveCorrect = 0;

        // Reducir el tiempo por pregunta (aumentar dificultad)
        this.timePerQuestion = Math.max(3, this.timePerQuestion - 1);

        // Mostrar mensaje de subida de nivel
        this.updateInstructions(`¡Nivel ${this.level}! Dificultad aumentada`);
    }

    /**
     * Actualiza el mensaje de instrucciones
     * @param {string} message - Mensaje a mostrar
     */
    updateInstructions(message) {
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = message;
    }

    /**
     * Inicia el temporizador del juego
     */
    startTimer() {
        // Reiniciar el contador visual
        const timeRemainingElement = document.querySelector('.time-remaining');
        const progressBar = document.querySelector('.countdown-progress');

        // Establecer el tiempo inicial
        timeRemainingElement.textContent = this.gameTime;
        progressBar.style.width = '100%';

        this.timer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            const timeRemaining = Math.max(0, this.gameTime - this.elapsedTime);

            // Actualizar el contador visual
            timeRemainingElement.textContent = timeRemaining;
            const progressPercentage = (timeRemaining / this.gameTime) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // Cambiar color según el tiempo restante
            if (timeRemaining <= 10) {
                progressBar.style.backgroundColor = '#f44336'; // Rojo cuando queda poco tiempo
            } else if (timeRemaining <= 30) {
                progressBar.style.backgroundColor = '#ff9800'; // Naranja cuando queda tiempo medio
            } else {
                progressBar.style.backgroundColor = '#4a90e2'; // Azul normal
            }

            // Actualizar estadísticas
            this.updateStats({ time: this.elapsedTime });

            // Terminar el juego después del tiempo establecido
            if (this.elapsedTime >= this.gameTime) {
                this.endGame();
            }
        }, 1000);
    }

    /**
     * Detiene el temporizador del juego
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.questionTimer) {
            clearTimeout(this.questionTimer);
            this.questionTimer = null;
        }
    }

    /**
     * Finaliza el juego
     */
    endGame() {
        this.gameActive = false;
        this.stopTimer();

        // Actualizar botón de inicio
        const startButton = document.getElementById('start-chalkboard');
        startButton.textContent = 'Jugar de nuevo';
        startButton.disabled = false;

        // Calcular precisión
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100) || 0;

        // Mostrar resultados finales
        this.updateInstructions(`¡Juego terminado! Puntuación: ${this.score}, Precisión: ${accuracy}%`);

        // Mostrar popup con puntuación final
        this.showScorePopup(accuracy);
    }

    /**
     * Muestra un popup con la puntuación final
     * @param {number} accuracy - Precisión del jugador en porcentaje
     */
    showScorePopup(accuracy) {
        // Crear el elemento del popup si no existe
        let popup = document.querySelector('.score-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.className = 'score-popup';
            document.body.appendChild(popup);
        }

        // Contenido del popup
        popup.innerHTML = `
            <div class="popup-content">
                <h2 class="popup-title">¡Tiempo agotado!</h2>
                <div class="final-score">${this.score} puntos</div>
                <div class="score-details">
                    <p>Nivel alcanzado: ${this.level}</p>
                    <p>Precisión: ${accuracy}%</p>
                    <p>Respuestas correctas: ${this.correctAnswers} de ${this.totalAnswers}</p>
                </div>
                <button class="popup-button">Jugar de nuevo</button>
            </div>
        `;

        // Mostrar el popup con una pequeña demora para la animación
        setTimeout(() => {
            popup.classList.add('active');
        }, 100);

        // Añadir confeti para celebrar la puntuación
        this.createConfetti();

        // Configurar el botón para cerrar el popup y reiniciar el juego
        popup.querySelector('.popup-button').addEventListener('click', () => {
            popup.classList.remove('active');
            setTimeout(() => {
                this.init();
            }, 300);
        });
    }

    /**
     * Crea efecto de confeti para celebrar la puntuación
     */
    createConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        const confettiCount = 100;
        const container = document.querySelector('.score-popup');

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 10 + 5 + 'px';
            confetti.style.height = Math.random() * 10 + 5 + 'px';
            confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(confetti);

            // Eliminar el confeti después de la animación
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
}