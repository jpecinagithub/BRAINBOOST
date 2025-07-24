/**
 * Digit Detective - Juego de memoria de trabajo
 * El usuario debe recordar secuencias de números que se muestran brevemente
 */
class DigitDetective {
    /**
     * Constructor del juego Digit Detective
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
        this.sequenceTimer = null;
        this.gameTime = 60; // Tiempo de juego en segundos
        
        // Secuencia actual
        this.currentSequence = [];
        this.userSequence = [];
        this.sequenceLength = 3; // Longitud inicial de la secuencia
        this.displayTime = 1000; // Tiempo de visualización por dígito en ms
        this.isShowingSequence = false;
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Digit Detective</h2>
                <p>Memoriza la secuencia de números y reprodúcela en el mismo orden.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="digit-detective-container">
                <div class="sequence-display">?</div>
                <div class="user-sequence"></div>
                <div class="number-pad">
                    <button class="digit-btn" data-digit="1">1</button>
                    <button class="digit-btn" data-digit="2">2</button>
                    <button class="digit-btn" data-digit="3">3</button>
                    <button class="digit-btn" data-digit="4">4</button>
                    <button class="digit-btn" data-digit="5">5</button>
                    <button class="digit-btn" data-digit="6">6</button>
                    <button class="digit-btn" data-digit="7">7</button>
                    <button class="digit-btn" data-digit="8">8</button>
                    <button class="digit-btn" data-digit="9">9</button>
                    <button class="digit-btn clear-btn" data-digit="clear">Borrar</button>
                </div>
            </div>
            <button id="start-digit-detective" class="control-btn">Comenzar</button>
        `;
        
        // Configurar el botón de inicio
        document.getElementById('start-digit-detective').addEventListener('click', () => {
            this.startGame();
        });
        
        // Configurar botones de dígitos
        const digitButtons = document.querySelectorAll('.digit-btn');
        digitButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.gameActive && !this.isShowingSequence) {
                    const digit = button.getAttribute('data-digit');
                    if (digit === 'clear') {
                        this.clearUserSequence();
                    } else {
                        this.addDigit(parseInt(digit, 10));
                    }
                }
            });
        });
        
        // Configurar atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive || this.isShowingSequence) return;
            
            if (e.key >= '1' && e.key <= '9') {
                this.addDigit(parseInt(e.key, 10));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearUserSequence();
            }
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: `${this.sequenceLength} dígitos`
        });
        
        // Añadir estilos específicos para Digit Detective si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Digit Detective
     */
    addStyles() {
        // Verificar si ya existe un estilo para Digit Detective
        if (!document.getElementById('digit-detective-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'digit-detective-styles';
            styleElement.textContent = `
                .digit-detective-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .sequence-display {
                    width: 200px;
                    height: 100px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 20px 0;
                    font-size: 48px;
                    font-weight: bold;
                    color: #4a90e2;
                }
                
                .user-sequence {
                    min-height: 40px;
                    margin-bottom: 20px;
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .user-digit {
                    width: 40px;
                    height: 40px;
                    background-color: #4a90e2;
                    color: white;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: bold;
                }
                
                .number-pad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    width: 100%;
                    max-width: 300px;
                }
                
                .digit-btn {
                    padding: 15px;
                    font-size: 20px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .digit-btn:hover {
                    background-color: #357abd;
                }
                
                .clear-btn {
                    grid-column: span 3;
                    background-color: #f44336;
                }
                
                .clear-btn:hover {
                    background-color: #d32f2f;
                }
                
                .correct-sequence {
                    animation: correct-flash 0.5s;
                }
                
                .incorrect-sequence {
                    animation: incorrect-flash 0.5s;
                }
                
                @keyframes correct-flash {
                    0% { background-color: #f5f5f5; }
                    50% { background-color: #a7e9af; }
                    100% { background-color: #f5f5f5; }
                }
                
                @keyframes incorrect-flash {
                    0% { background-color: #f5f5f5; }
                    50% { background-color: #ffb3b3; }
                    100% { background-color: #f5f5f5; }
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
        this.sequenceLength = 3;
        this.displayTime = 1000;
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-digit-detective');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Generar primera secuencia
        this.generateSequence();
    }

    /**
     * Genera una nueva secuencia de dígitos
     */
    generateSequence() {
        if (!this.gameActive) return;
        
        // Limpiar secuencia anterior
        this.currentSequence = [];
        this.userSequence = [];
        this.updateUserSequenceDisplay();
        
        // Generar nueva secuencia
        for (let i = 0; i < this.sequenceLength; i++) {
            const digit = Math.floor(Math.random() * 9) + 1; // Dígitos del 1 al 9
            this.currentSequence.push(digit);
        }
        
        // Mostrar mensaje
        this.updateInstructions('¡Memoriza la secuencia!');
        
        // Mostrar la secuencia al usuario
        this.showSequence();
    }

    /**
     * Muestra la secuencia al usuario
     */
    showSequence() {
        this.isShowingSequence = true;
        const sequenceDisplay = document.querySelector('.sequence-display');
        let currentIndex = 0;
        
        // Deshabilitar botones durante la visualización
        document.querySelectorAll('.digit-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Mostrar cada dígito secuencialmente
        const showNextDigit = () => {
            if (currentIndex < this.currentSequence.length) {
                sequenceDisplay.textContent = this.currentSequence[currentIndex];
                currentIndex++;
                
                // Programar el siguiente dígito o finalizar
                setTimeout(() => {
                    if (currentIndex < this.currentSequence.length) {
                        sequenceDisplay.textContent = '';
                        setTimeout(showNextDigit, 300); // Breve pausa entre dígitos
                    } else {
                        // Finalizar la secuencia
                        setTimeout(() => {
                            sequenceDisplay.textContent = '?';
                            this.isShowingSequence = false;
                            
                            // Habilitar botones
                            document.querySelectorAll('.digit-btn').forEach(btn => {
                                btn.disabled = false;
                            });
                            
                            // Actualizar instrucciones
                            this.updateInstructions('Ahora, reproduce la secuencia en el mismo orden.');
                        }, this.displayTime);
                    }
                }, this.displayTime);
            }
        };
        
        // Iniciar la secuencia
        showNextDigit();
    }

    /**
     * Añade un dígito a la secuencia del usuario
     * @param {number} digit - Dígito a añadir
     */
    addDigit(digit) {
        if (!this.gameActive || this.isShowingSequence) return;
        
        // Añadir dígito a la secuencia del usuario
        this.userSequence.push(digit);
        this.updateUserSequenceDisplay();
        
        // Verificar si la secuencia está completa
        if (this.userSequence.length === this.currentSequence.length) {
            this.checkSequence();
        }
    }

    /**
     * Actualiza la visualización de la secuencia del usuario
     */
    updateUserSequenceDisplay() {
        const userSequenceDisplay = document.querySelector('.user-sequence');
        userSequenceDisplay.innerHTML = '';
        
        this.userSequence.forEach(digit => {
            const digitElement = document.createElement('div');
            digitElement.className = 'user-digit';
            digitElement.textContent = digit;
            userSequenceDisplay.appendChild(digitElement);
        });
    }

    /**
     * Limpia la secuencia del usuario
     */
    clearUserSequence() {
        this.userSequence = [];
        this.updateUserSequenceDisplay();
    }

    /**
     * Verifica si la secuencia del usuario es correcta
     */
    checkSequence() {
        // Verificar si las secuencias coinciden
        let isCorrect = true;
        for (let i = 0; i < this.currentSequence.length; i++) {
            if (this.userSequence[i] !== this.currentSequence[i]) {
                isCorrect = false;
                break;
            }
        }
        
        // Actualizar contadores
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            
            // Calcular puntos basados en longitud de la secuencia
            const pointsEarned = this.sequenceLength * 10;
            this.score += pointsEarned;
            
            // Mostrar feedback positivo
            document.querySelector('.sequence-display').classList.add('correct-sequence');
            setTimeout(() => {
                document.querySelector('.sequence-display').classList.remove('correct-sequence');
            }, 500);
            
            // Mostrar mensaje
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);
            
            // Aumentar dificultad
            this.levelUp();
        } else {
            // Mostrar feedback negativo
            document.querySelector('.sequence-display').classList.add('incorrect-sequence');
            setTimeout(() => {
                document.querySelector('.sequence-display').classList.remove('incorrect-sequence');
            }, 500);
            
            // Mostrar mensaje
            this.updateInstructions('¡Incorrecto! La secuencia correcta era: ' + this.currentSequence.join(' '));
        }
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${this.sequenceLength} dígitos - ${accuracy}% precisión`
        });
        
        // Programar la siguiente ronda después de un breve feedback
        setTimeout(() => {
            if (this.gameActive) {
                this.generateSequence();
            }
        }, 2000);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        
        // Aumentar longitud de la secuencia cada 2 niveles
        if (this.level % 2 === 0) {
            this.sequenceLength++;
        }
        
        // Reducir tiempo de visualización (aumentar dificultad)
        this.displayTime = Math.max(500, this.displayTime - 50);
        
        // Mostrar mensaje de subida de nivel
        this.updateInstructions(`¡Nivel ${this.level}! Secuencia: ${this.sequenceLength} dígitos`);
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
        
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
            this.sequenceTimer = null;
        }
    }

    /**
     * Finaliza el juego
     */
    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        // Actualizar botón de inicio
        const startButton = document.getElementById('start-digit-detective');
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
                    <p>Secuencias correctas: ${this.correctAnswers} de ${this.totalAnswers}</p>
                    <p>Longitud máxima: ${this.sequenceLength} dígitos</p>
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