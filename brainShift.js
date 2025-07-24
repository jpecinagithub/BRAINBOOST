/**
 * Brain Shift - Juego de flexibilidad cognitiva
 * El usuario debe alternar entre clasificar números y formas según la instrucción
 */
class BrainShift {
    /**
     * Constructor del juego Brain Shift
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
        this.roundTimer = null;
        this.timePerRound = 3000; // Tiempo inicial por ronda en ms
        this.consecutiveCorrect = 0;
        this.gameTime = 60; // Tiempo de juego en segundos
        
        // Modos de clasificación
        this.modes = ['number', 'shape'];
        this.currentMode = 'number';
        
        // Formas disponibles
        this.shapes = ['circle', 'square', 'triangle'];
        
        // Números disponibles
        this.numbers = [1, 2, 3];
        
        // Elemento actual
        this.currentElement = null;
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Brain Shift</h2>
                <p>Clasifica según la instrucción: número o forma.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="brain-shift-container">
                <div class="mode-instruction">Clasifica por: <span class="current-mode">NÚMERO</span></div>
                <div class="element-display"></div>
                <div class="classification-options">
                    <div class="option-row number-options">
                        <button class="option-btn" data-value="1">1</button>
                        <button class="option-btn" data-value="2">2</button>
                        <button class="option-btn" data-value="3">3</button>
                    </div>
                    <div class="option-row shape-options">
                        <button class="option-btn" data-value="circle">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" />
                            </svg>
                        </button>
                        <button class="option-btn" data-value="square">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <rect x="10" y="10" width="80" height="80" />
                            </svg>
                        </button>
                        <button class="option-btn" data-value="triangle">
                            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="50,10 90,90 10,90" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <button id="start-brain-shift" class="control-btn">Comenzar</button>
        `;
        
        // Configurar el botón de inicio
        document.getElementById('start-brain-shift').addEventListener('click', () => {
            this.startGame();
        });
        
        // Configurar botones de clasificación
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.gameActive) {
                    const value = button.getAttribute('data-value');
                    this.checkAnswer(value);
                }
            });
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: 'Modo: Número'
        });
        
        // Añadir estilos específicos para Brain Shift si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Brain Shift
     */
    addStyles() {
        // Verificar si ya existe un estilo para Brain Shift
        if (!document.getElementById('brain-shift-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'brain-shift-styles';
            styleElement.textContent = `
                .brain-shift-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .mode-instruction {
                    font-size: 20px;
                    margin: 15px 0;
                    text-align: center;
                }
                
                .current-mode {
                    font-weight: bold;
                    color: #4a90e2;
                }
                
                .element-display {
                    width: 150px;
                    height: 150px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 20px 0;
                    font-size: 48px;
                    position: relative;
                }
                
                .element-display svg {
                    width: 80px;
                    height: 80px;
                    fill: currentColor;
                }
                
                .classification-options {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-top: 20px;
                    width: 100%;
                }
                
                .option-row {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }
                
                .option-btn {
                    width: 70px;
                    height: 70px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, background-color 0.2s;
                }
                
                .option-btn:hover {
                    background-color: #357abd;
                    transform: scale(1.05);
                }
                
                .option-btn svg {
                    width: 40px;
                    height: 40px;
                    fill: white;
                }
                
                .correct-flash {
                    animation: correct-flash 0.5s;
                }
                
                .incorrect-flash {
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
        this.consecutiveCorrect = 0;
        this.timePerRound = 3000;
        this.currentMode = 'number';
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-brain-shift');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Actualizar instrucción de modo
        this.updateModeDisplay();
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Generar primer elemento
        this.generateElement();
    }

    /**
     * Genera un nuevo elemento para clasificar
     */
    generateElement() {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda anterior si existe
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
        }
        
        // Seleccionar forma y número aleatorios
        const randomShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const randomNumber = this.numbers[Math.floor(Math.random() * this.numbers.length)];
        
        // Crear el elemento actual
        this.currentElement = {
            shape: randomShape,
            number: randomNumber
        };
        
        // Mostrar el elemento
        const elementDisplay = document.querySelector('.element-display');
        
        // Crear el contenido según la forma
        let shapeContent = '';
        switch (randomShape) {
            case 'circle':
                shapeContent = `
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" />
                    </svg>
                `;
                break;
            case 'square':
                shapeContent = `
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="80" height="80" />
                    </svg>
                `;
                break;
            case 'triangle':
                shapeContent = `
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="50,10 90,90 10,90" />
                    </svg>
                `;
                break;
        }
        
        // Mostrar el elemento con el número dentro
        elementDisplay.innerHTML = `
            <div style="position: relative;">
                ${shapeContent}
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 24px; font-weight: bold;">
                    ${randomNumber}
                </div>
            </div>
        `;
        
        // Establecer temporizador para la ronda actual
        this.roundTimer = setTimeout(() => {
            // Si el usuario no respondió a tiempo
            this.handleTimeout();
        }, this.timePerRound);
    }

    /**
     * Actualiza la visualización del modo actual
     */
    updateModeDisplay() {
        const modeDisplay = document.querySelector('.current-mode');
        modeDisplay.textContent = this.currentMode === 'number' ? 'NÚMERO' : 'FORMA';
    }

    /**
     * Verifica la respuesta del usuario
     * @param {string} answer - Respuesta seleccionada por el usuario
     */
    checkAnswer(answer) {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda
        clearTimeout(this.roundTimer);
        
        // Determinar la respuesta correcta según el modo actual
        const correctAnswer = this.currentMode === 'number' 
            ? this.currentElement.number.toString() 
            : this.currentElement.shape;
        
        // Determinar si la respuesta es correcta
        const isCorrect = (answer === correctAnswer);
        
        // Actualizar contadores
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;
            
            // Calcular puntos basados en nivel
            const pointsEarned = 10 + (this.level * 2);
            
            this.score += pointsEarned;
            
            // Mostrar feedback positivo
            document.querySelector('.element-display').classList.add('correct-flash');
            setTimeout(() => {
                document.querySelector('.element-display').classList.remove('correct-flash');
            }, 500);
            
            // Mostrar mensaje
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);
            
            // Aumentar nivel si hay suficientes respuestas correctas consecutivas
            if (this.consecutiveCorrect >= 5) {
                this.levelUp();
            }
            
            // Alternar el modo de clasificación cada cierto número de respuestas correctas
            if (this.level >= 2 && this.correctAnswers % 3 === 0) {
                this.toggleMode();
            }
        } else {
            this.consecutiveCorrect = 0;
            
            // Mostrar feedback negativo
            document.querySelector('.element-display').classList.add('incorrect-flash');
            setTimeout(() => {
                document.querySelector('.element-display').classList.remove('incorrect-flash');
            }, 500);
            
            // Mostrar mensaje
            this.updateInstructions('¡Incorrecto!');
        }
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión - Modo: ${this.currentMode === 'number' ? 'Número' : 'Forma'}`
        });
        
        // Programar la siguiente ronda después de un breve feedback
        setTimeout(() => {
            if (this.gameActive) {
                this.generateElement();
            }
        }, 1000);
    }

    /**
     * Alterna entre los modos de clasificación
     */
    toggleMode() {
        this.currentMode = this.currentMode === 'number' ? 'shape' : 'number';
        this.updateModeDisplay();
        this.updateInstructions(`¡Cambio de modo! Ahora clasifica por ${this.currentMode === 'number' ? 'NÚMERO' : 'FORMA'}`);
    }

    /**
     * Maneja el caso cuando el usuario no responde a tiempo
     */
    handleTimeout() {
        if (!this.gameActive) return;
        
        this.totalAnswers++;
        this.consecutiveCorrect = 0;
        
        // Mostrar feedback negativo
        document.querySelector('.element-display').classList.add('incorrect-flash');
        setTimeout(() => {
            document.querySelector('.element-display').classList.remove('incorrect-flash');
        }, 500);
        
        // Mostrar mensaje
        this.updateInstructions('¡Tiempo agotado!');
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión - Modo: ${this.currentMode === 'number' ? 'Número' : 'Forma'}`
        });
        
        // Programar la siguiente ronda
        setTimeout(() => {
            if (this.gameActive) {
                this.generateElement();
            }
        }, 1000);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        this.consecutiveCorrect = 0;
        
        // Reducir el tiempo por ronda (aumentar dificultad)
        this.timePerRound = Math.max(1000, this.timePerRound - 300);
        
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
        const startButton = document.getElementById('start-brain-shift');
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
                    <p>Último modo: ${this.currentMode === 'number' ? 'Número' : 'Forma'}</p>
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