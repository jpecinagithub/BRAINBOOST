/**
 * Color Match - Juego de flexibilidad mental
 * Muestra palabras con colores, y el usuario debe responder según la instrucción
 */
class ColorMatch {
    /**
     * Constructor del juego Color Match
     * @param {Function} updateStatsCallback - Función para actualizar estadísticas en la UI
     */
    constructor(updateStatsCallback) {
        this.updateStats = updateStatsCallback;
        this.colors = [
            { name: 'ROJO', hex: '#FF0000' },
            { name: 'AZUL', hex: '#0000FF' },
            { name: 'VERDE', hex: '#00CC00' },
            { name: 'AMARILLO', hex: '#FFCC00' },
            { name: 'MORADO', hex: '#9900CC' }
        ];
        this.currentWord = null;
        this.currentColor = null;
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.gameActive = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.roundTimer = null;
        this.timePerWord = 3000; // Tiempo inicial por palabra en ms
        this.consecutiveCorrect = 0;
        this.mode = 'color'; // 'color' o 'word'
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Color Match</h2>
                <p>Haz clic en el color correcto según la instrucción.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="color-match-container">
                <div class="instruction">Haz clic en el COLOR del texto, no en la palabra</div>
                <div class="color-word">PALABRA</div>
                <div class="color-options"></div>
            </div>
            <button id="start-color" class="control-btn">Comenzar</button>
        `;
        
        // Crear botones de colores
        this.createColorButtons();
        
        // Configurar el botón de inicio
        document.getElementById('start-color').addEventListener('click', () => {
            this.startGame();
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: 'Modo: Color'
        });
    }

    /**
     * Crea los botones de colores
     */
    createColorButtons() {
        const colorOptions = document.querySelector('.color-options');
        colorOptions.innerHTML = '';
        
        this.colors.forEach(color => {
            const button = document.createElement('button');
            button.className = 'color-btn';
            button.style.backgroundColor = color.hex;
            button.dataset.color = color.name;
            
            button.addEventListener('click', () => {
                if (this.gameActive) {
                    this.checkAnswer(color.name);
                }
            });
            
            colorOptions.appendChild(button);
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
        this.consecutiveCorrect = 0;
        this.level = 1;
        this.mode = 'color';
        this.timePerWord = 3000;
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-color');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Actualizar instrucción
        this.updateInstructionMode();
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Mostrar primera palabra
        this.showNextWord();
    }

    /**
     * Muestra la siguiente palabra
     */
    showNextWord() {
        if (!this.gameActive) return;
        
        // Seleccionar una palabra aleatoria (nombre de color)
        const wordIndex = Math.floor(Math.random() * this.colors.length);
        this.currentWord = this.colors[wordIndex].name;
        
        // Seleccionar un color aleatorio (que puede ser diferente al nombre)
        let colorIndex;
        // Con 30% de probabilidad, hacer que coincidan para aumentar la dificultad
        if (Math.random() < 0.3) {
            colorIndex = wordIndex;
        } else {
            do {
                colorIndex = Math.floor(Math.random() * this.colors.length);
            } while (colorIndex === wordIndex);
        }
        this.currentColor = this.colors[colorIndex].name;
        
        // Mostrar la palabra con el color seleccionado
        const wordDisplay = document.querySelector('.color-word');
        wordDisplay.textContent = this.currentWord;
        wordDisplay.style.color = this.colors[colorIndex].hex;
        wordDisplay.classList.add('pulse');
        
        // Quitar la animación después de completarse
        setTimeout(() => {
            wordDisplay.classList.remove('pulse');
        }, 500);
        
        // Establecer temporizador para la palabra actual
        this.roundTimer = setTimeout(() => {
            // Si el usuario no respondió a tiempo
            this.handleTimeout();
        }, this.timePerWord);
    }

    /**
     * Verifica la respuesta del usuario
     * @param {string} selectedColor - Color seleccionado por el usuario
     */
    checkAnswer(selectedColor) {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda
        clearTimeout(this.roundTimer);
        
        // Determinar la respuesta correcta según el modo
        const correctAnswer = this.mode === 'color' ? this.currentColor : this.currentWord;
        
        // Determinar si la respuesta es correcta
        const isCorrect = (selectedColor === correctAnswer);
        
        // Actualizar contadores
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;
            
            // Calcular puntos basados en velocidad y nivel
            const responseTime = (Date.now() - this.startTime) % this.timePerWord;
            const timeBonus = Math.max(1, Math.floor((this.timePerWord - responseTime) / 100));
            const pointsEarned = 10 + timeBonus + (this.level * 3);
            
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
            progress: `${accuracy}% precisión - Modo: ${this.mode === 'color' ? 'Color' : 'Palabra'}`
        });
        
        // Programar la siguiente palabra después de un breve feedback
        setTimeout(() => {
            this.showNextWord();
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
            progress: `${accuracy}% precisión - Modo: ${this.mode === 'color' ? 'Color' : 'Palabra'}`
        });
        
        // Programar la siguiente palabra
        setTimeout(() => {
            this.showNextWord();
        }, 800);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        this.consecutiveCorrect = 0;
        
        // Reducir el tiempo por palabra (aumentar dificultad)
        this.timePerWord = Math.max(1200, this.timePerWord - 300);
        
        // Cambiar el modo cada 2 niveles para aumentar la dificultad
        if (this.level % 2 === 0) {
            this.mode = this.mode === 'color' ? 'word' : 'color';
            this.updateInstructionMode();
        }
        
        // Mostrar mensaje de subida de nivel
        this.updateInstructions(`¡Nivel ${this.level}! ${this.mode === 'color' ? 'Haz clic en el COLOR' : 'Haz clic en la PALABRA'}`);
    }

    /**
     * Actualiza la instrucción según el modo actual
     */
    updateInstructionMode() {
        const instructionElement = document.querySelector('.instruction');
        if (this.mode === 'color') {
            instructionElement.textContent = 'Haz clic en el COLOR del texto, no en la palabra';
        } else {
            instructionElement.textContent = 'Haz clic en la PALABRA, no en el color del texto';
        }
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
        
        // Actualizar botón de inicio
        const startButton = document.getElementById('start-color');
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
                    <p>Modo: ${this.mode === 'color' ? 'Color' : 'Palabra'}</p>
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