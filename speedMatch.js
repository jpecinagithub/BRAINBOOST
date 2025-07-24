/**
 * Speed Match - Juego de velocidad de procesamiento
 * Muestra dos símbolos y el usuario debe indicar si son iguales lo más rápido posible
 */
class SpeedMatch {
    /**
     * Constructor del juego Speed Match
     * @param {Function} updateStatsCallback - Función para actualizar estadísticas en la UI
     */
    constructor(updateStatsCallback) {
        this.updateStats = updateStatsCallback;
        this.symbols = ['★', '♦', '♠', '♣', '♥', '◆', '▲', '●'];
        this.currentSymbol = null;
        this.previousSymbol = null;
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameActive = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.roundTimer = null;
        this.timePerSymbol = 3000; // Tiempo inicial por símbolo en ms
        this.consecutiveCorrect = 0;
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');

        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Speed Match</h2>
                <p>Indica si el símbolo actual es igual al anterior lo más rápido posible.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="speed-match-container">
                <div class="symbol-display">?</div>
                <div class="speed-match-buttons">
                    <button class="speed-btn yes-btn" id="yes-btn">Igual (S)</button>
                    <button class="speed-btn no-btn" id="no-btn">Diferente (N)</button>
                </div>
            </div>
            <button id="start-speed" class="control-btn">Comenzar</button>
        `;

        // Configurar el botón de inicio
        document.getElementById('start-speed').addEventListener('click', () => {
            this.startGame();
        });

        // Configurar botones de respuesta
        document.getElementById('yes-btn').addEventListener('click', () => {
            this.checkAnswer(true);
        });

        document.getElementById('no-btn').addEventListener('click', () => {
            this.checkAnswer(false);
        });

        // Configurar atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;

            if (e.key === 's' || e.key === 'S') {
                this.checkAnswer(true);
            } else if (e.key === 'n' || e.key === 'N') {
                this.checkAnswer(false);
            }
        });

        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: '0%'
        });
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
        this.previousSymbol = null;
        this.consecutiveCorrect = 0;

        // Cambiar texto del botón
        const startButton = document.getElementById('start-speed');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;

        // Habilitar botones de respuesta
        document.getElementById('yes-btn').disabled = false;
        document.getElementById('no-btn').disabled = false;

        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();

        // Mostrar primer símbolo
        this.showNextSymbol();
    }

    /**
     * Muestra el siguiente símbolo
     */
    showNextSymbol() {
        if (!this.gameActive) return;

        // Guardar el símbolo actual como anterior
        this.previousSymbol = this.currentSymbol;

        // Seleccionar un nuevo símbolo
        // Con 20% de probabilidad, mostrar el mismo símbolo
        if (this.previousSymbol && Math.random() < 0.2) {
            this.currentSymbol = this.previousSymbol;
        } else {
            // Seleccionar un símbolo aleatorio diferente al anterior
            let newSymbol;
            do {
                newSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
            } while (newSymbol === this.previousSymbol);

            this.currentSymbol = newSymbol;
        }

        // Mostrar el símbolo
        const symbolDisplay = document.querySelector('.symbol-display');
        symbolDisplay.textContent = this.currentSymbol;
        symbolDisplay.classList.add('pulse');

        // Quitar la animación después de completarse
        setTimeout(() => {
            symbolDisplay.classList.remove('pulse');
        }, 500);

        // Si es el primer símbolo, no hay comparación posible
        if (this.previousSymbol === null) {
            this.updateInstructions('Memoriza este símbolo. El siguiente deberás compararlo con este.');

            // Programar el siguiente símbolo después de un tiempo
            this.roundTimer = setTimeout(() => {
                this.showNextSymbol();
            }, 1500);

            return;
        }

        // Actualizar instrucciones
        this.updateInstructions('¿Es igual al símbolo anterior?');

        // Establecer temporizador para el símbolo actual
        this.roundTimer = setTimeout(() => {
            // Si el usuario no respondió a tiempo
            this.handleTimeout();
        }, this.timePerSymbol);
    }

    /**
     * Verifica la respuesta del usuario
     * @param {boolean} sameAnswer - True si el usuario indicó que los símbolos son iguales
     */
    checkAnswer(sameAnswer) {
        if (!this.gameActive || this.previousSymbol === null) return;

        // Cancelar el temporizador de ronda
        clearTimeout(this.roundTimer);

        // Determinar si la respuesta es correcta
        const isCorrect = (sameAnswer === (this.currentSymbol === this.previousSymbol));

        // Actualizar contadores
        this.totalAnswers++;

        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;

            // Calcular puntos basados en velocidad y nivel
            const responseTime = (Date.now() - this.startTime) % this.timePerSymbol;
            const timeBonus = Math.max(1, Math.floor((this.timePerSymbol - responseTime) / 100));
            const pointsEarned = 10 + timeBonus + (this.level * 2);

            this.score += pointsEarned;

            // Mostrar feedback positivo
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);

            // Aumentar nivel si hay suficientes respuestas correctas consecutivas
            if (this.consecutiveCorrect >= 5) {
                this.levelUp();
            }
        } else {
            this.consecutiveCorrect = 0;

            // Mostrar feedback negativo
            this.updateInstructions('¡Incorrecto!');
        }

        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión`
        });

        // Programar el siguiente símbolo después de un breve feedback
        setTimeout(() => {
            this.showNextSymbol();
        }, 800);
    }

    /**
     * Maneja el caso cuando el usuario no responde a tiempo
     */
    handleTimeout() {
        if (!this.gameActive) return;

        this.totalAnswers++;
        this.consecutiveCorrect = 0;

        // Mostrar feedback
        this.updateInstructions('¡Tiempo agotado!');

        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión`
        });

        // Programar el siguiente símbolo
        setTimeout(() => {
            this.showNextSymbol();
        }, 800);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        this.consecutiveCorrect = 0;

        // Reducir el tiempo por símbolo (aumentar dificultad)
        this.timePerSymbol = Math.max(1000, this.timePerSymbol - 300);

        // Mostrar mensaje de subida de nivel
        this.updateInstructions(`¡Nivel ${this.level}! Velocidad aumentada`);
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

        // Establecer el tiempo inicial (60 segundos)
        const gameTime = 60;
        timeRemainingElement.textContent = gameTime;
        progressBar.style.width = '100%';

        this.timer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            const timeRemaining = Math.max(0, gameTime - this.elapsedTime);

            // Actualizar el contador visual
            timeRemainingElement.textContent = timeRemaining;
            const progressPercentage = (timeRemaining / gameTime) * 100;
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

            // Terminar el juego después de 60 segundos
            if (this.elapsedTime >= 60) {
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

        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }
    }

    /**
     * Finaliza el juego
     */
    endGame() {
        this.gameActive = false;
        this.stopTimer();

        // Deshabilitar botones de respuesta
        document.getElementById('yes-btn').disabled = true;
        document.getElementById('no-btn').disabled = true;

        // Actualizar botón de inicio
        const startButton = document.getElementById('start-speed');
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