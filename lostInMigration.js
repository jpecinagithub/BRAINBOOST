/**
 * Lost in Migration - Juego de atención
 * El usuario debe indicar la dirección de un objeto central mientras ignora distracciones
 */
class LostInMigration {
    /**
     * Constructor del juego Lost in Migration
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
        this.timePerRound = 2000; // Tiempo inicial por ronda en ms
        this.consecutiveCorrect = 0;
        this.gameTime = 60; // Tiempo de juego en segundos
        this.directions = ['up', 'right', 'down', 'left'];
        this.currentDirection = null;
        this.distractionLevel = 0; // Nivel de distracción (0-4)
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Lost in Migration</h2>
                <p>Indica la dirección del pájaro central usando las flechas.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="migration-container">
                <div class="birds-display">
                    <div class="bird-formation">
                        <div class="bird central">↑</div>
                    </div>
                </div>
                <div class="direction-controls">
                    <button class="direction-btn up-btn" data-direction="up">↑</button>
                    <div class="horizontal-controls">
                        <button class="direction-btn left-btn" data-direction="left">←</button>
                        <button class="direction-btn right-btn" data-direction="right">→</button>
                    </div>
                    <button class="direction-btn down-btn" data-direction="down">↓</button>
                </div>
            </div>
            <button id="start-migration" class="control-btn">Comenzar</button>
        `;
        
        // Configurar el botón de inicio
        document.getElementById('start-migration').addEventListener('click', () => {
            this.startGame();
        });
        
        // Configurar botones de dirección
        const directionButtons = document.querySelectorAll('.direction-btn');
        directionButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (this.gameActive) {
                    const direction = button.getAttribute('data-direction');
                    this.checkAnswer(direction);
                }
            });
        });
        
        // Configurar atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            let direction = null;
            
            switch (e.key) {
                case 'ArrowUp':
                    direction = 'up';
                    break;
                case 'ArrowRight':
                    direction = 'right';
                    break;
                case 'ArrowDown':
                    direction = 'down';
                    break;
                case 'ArrowLeft':
                    direction = 'left';
                    break;
            }
            
            if (direction) {
                this.checkAnswer(direction);
            }
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: '0% precisión'
        });
        
        // Añadir estilos específicos para Lost in Migration si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Lost in Migration
     */
    addStyles() {
        // Verificar si ya existe un estilo para Lost in Migration
        if (!document.getElementById('migration-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'migration-styles';
            styleElement.textContent = `
                .migration-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .birds-display {
                    width: 300px;
                    height: 300px;
                    background-color: #e8f4ff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    position: relative;
                }
                
                .bird-formation {
                    position: relative;
                    width: 200px;
                    height: 200px;
                }
                
                .bird {
                    position: absolute;
                    font-size: 36px;
                    width: 50px;
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }
                
                .bird.central {
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #e74c3c;
                    z-index: 10;
                }
                
                .bird.distraction {
                    color: #3498db;
                }
                
                .direction-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                
                .horizontal-controls {
                    display: flex;
                    gap: 50px;
                }
                
                .direction-btn {
                    width: 60px;
                    height: 60px;
                    font-size: 24px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .direction-btn:hover {
                    background-color: #357abd;
                }
                
                .correct-flash {
                    animation: correct-flash 0.5s;
                }
                
                .incorrect-flash {
                    animation: incorrect-flash 0.5s;
                }
                
                @keyframes correct-flash {
                    0% { background-color: #e8f4ff; }
                    50% { background-color: #a7e9af; }
                    100% { background-color: #e8f4ff; }
                }
                
                @keyframes incorrect-flash {
                    0% { background-color: #e8f4ff; }
                    50% { background-color: #ffb3b3; }
                    100% { background-color: #e8f4ff; }
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
        this.timePerRound = 2000;
        this.distractionLevel = 0;
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-migration');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Generar primera ronda
        this.generateRound();
    }

    /**
     * Genera una nueva ronda con pájaros
     */
    generateRound() {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda anterior si existe
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
        }
        
        // Seleccionar dirección aleatoria para el pájaro central
        this.currentDirection = this.directions[Math.floor(Math.random() * this.directions.length)];
        
        // Crear formación de pájaros
        this.createBirdFormation();
        
        // Establecer temporizador para la ronda actual
        this.roundTimer = setTimeout(() => {
            // Si el usuario no respondió a tiempo
            this.handleTimeout();
        }, this.timePerRound);
    }

    /**
     * Crea la formación de pájaros con distracciones
     */
    createBirdFormation() {
        const birdFormation = document.querySelector('.bird-formation');
        
        // Limpiar formación anterior
        birdFormation.innerHTML = '';
        
        // Crear pájaro central
        const centralBird = document.createElement('div');
        centralBird.className = 'bird central';
        
        // Establecer dirección del pájaro central
        switch (this.currentDirection) {
            case 'up':
                centralBird.textContent = '↑';
                break;
            case 'right':
                centralBird.textContent = '→';
                break;
            case 'down':
                centralBird.textContent = '↓';
                break;
            case 'left':
                centralBird.textContent = '←';
                break;
        }
        
        birdFormation.appendChild(centralBird);
        
        // Añadir pájaros de distracción según el nivel
        const numDistractions = Math.min(8, this.distractionLevel * 2);
        
        for (let i = 0; i < numDistractions; i++) {
            const distractionBird = document.createElement('div');
            distractionBird.className = 'bird distraction';
            
            // Posición aleatoria alrededor del pájaro central
            const angle = (i / numDistractions) * 2 * Math.PI;
            const radius = 80; // Radio de la formación
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            distractionBird.style.left = `calc(50% + ${x}px)`;
            distractionBird.style.top = `calc(50% + ${y}px)`;
            distractionBird.style.transform = 'translate(-50%, -50%)';
            
            // Dirección aleatoria para los pájaros de distracción
            // Con mayor probabilidad de ser diferente al central en niveles más altos
            let distractionDirection;
            
            if (this.level >= 3 && Math.random() < 0.7) {
                // Seleccionar una dirección diferente a la central
                const otherDirections = this.directions.filter(dir => dir !== this.currentDirection);
                distractionDirection = otherDirections[Math.floor(Math.random() * otherDirections.length)];
            } else {
                // Dirección aleatoria
                distractionDirection = this.directions[Math.floor(Math.random() * this.directions.length)];
            }
            
            switch (distractionDirection) {
                case 'up':
                    distractionBird.textContent = '↑';
                    break;
                case 'right':
                    distractionBird.textContent = '→';
                    break;
                case 'down':
                    distractionBird.textContent = '↓';
                    break;
                case 'left':
                    distractionBird.textContent = '←';
                    break;
            }
            
            birdFormation.appendChild(distractionBird);
        }
    }

    /**
     * Verifica la respuesta del usuario
     * @param {string} direction - Dirección seleccionada por el usuario
     */
    checkAnswer(direction) {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda
        clearTimeout(this.roundTimer);
        
        // Verificar si la dirección es correcta
        const isCorrect = direction === this.currentDirection;
        
        // Actualizar contadores
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;
            
            // Calcular puntos basados en nivel
            const pointsEarned = 10 + (this.level * 2);
            
            this.score += pointsEarned;
            
            // Mostrar feedback positivo
            document.querySelector('.birds-display').classList.add('correct-flash');
            setTimeout(() => {
                document.querySelector('.birds-display').classList.remove('correct-flash');
            }, 500);
            
            // Aumentar nivel si hay suficientes respuestas correctas consecutivas
            if (this.consecutiveCorrect >= 5) {
                this.levelUp();
            }
            
            // Mostrar mensaje
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);
        } else {
            this.consecutiveCorrect = 0;
            
            // Mostrar feedback negativo
            document.querySelector('.birds-display').classList.add('incorrect-flash');
            setTimeout(() => {
                document.querySelector('.birds-display').classList.remove('incorrect-flash');
            }, 500);
            
            // Mostrar mensaje
            this.updateInstructions(`¡Incorrecto! La dirección era ${this.getDirectionName(this.currentDirection)}`);
        }
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${accuracy}% precisión`
        });
        
        // Programar la siguiente ronda después de un breve feedback
        setTimeout(() => {
            if (this.gameActive) {
                this.generateRound();
            }
        }, 1000);
    }

    /**
     * Obtiene el nombre en español de una dirección
     * @param {string} direction - Dirección en inglés
     * @returns {string} - Nombre de la dirección en español
     */
    getDirectionName(direction) {
        switch (direction) {
            case 'up':
                return 'arriba';
            case 'right':
                return 'derecha';
            case 'down':
                return 'abajo';
            case 'left':
                return 'izquierda';
            default:
                return direction;
        }
    }

    /**
     * Maneja el caso cuando el usuario no responde a tiempo
     */
    handleTimeout() {
        if (!this.gameActive) return;
        
        this.totalAnswers++;
        this.consecutiveCorrect = 0;
        
        // Mostrar feedback negativo
        document.querySelector('.birds-display').classList.add('incorrect-flash');
        setTimeout(() => {
            document.querySelector('.birds-display').classList.remove('incorrect-flash');
        }, 500);
        
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
        
        // Programar la siguiente ronda
        setTimeout(() => {
            if (this.gameActive) {
                this.generateRound();
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
        this.timePerRound = Math.max(800, this.timePerRound - 200);
        
        // Aumentar nivel de distracción cada 2 niveles
        if (this.level % 2 === 0 && this.distractionLevel < 4) {
            this.distractionLevel++;
        }
        
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
        const startButton = document.getElementById('start-migration');
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
                    <p>Nivel de distracción: ${this.distractionLevel + 1}/5</p>
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