/**
 * Spatial Speed - Juego de percepción espacial
 * El usuario debe identificar rápidamente qué imagen es diferente entre un conjunto
 */
class SpatialSpeed {
    /**
     * Constructor del juego Spatial Speed
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
        this.timePerRound = 5000; // Tiempo inicial por ronda en ms
        this.consecutiveCorrect = 0;
        this.gameTime = 60; // Tiempo de juego en segundos
        
        // Configuración del juego
        this.gridSize = 2; // Tamaño inicial de la cuadrícula (2x2)
        this.currentGrid = [];
        this.differentItemIndex = -1;
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Spatial Speed</h2>
                <p>Encuentra rápidamente la imagen que es diferente.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="spatial-speed-container">
                <div class="round-timer">
                    <div class="round-timer-progress"></div>
                </div>
                <div class="spatial-grid"></div>
            </div>
            <button id="start-spatial-speed" class="control-btn">Comenzar</button>
        `;
        
        // Configurar el botón de inicio
        document.getElementById('start-spatial-speed').addEventListener('click', () => {
            this.startGame();
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: `Cuadrícula ${this.gridSize}x${this.gridSize}`
        });
        
        // Añadir estilos específicos para Spatial Speed si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Spatial Speed
     */
    addStyles() {
        // Verificar si ya existe un estilo para Spatial Speed
        if (!document.getElementById('spatial-speed-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'spatial-speed-styles';
            styleElement.textContent = `
                .spatial-speed-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                }
                
                .round-timer {
                    width: 100%;
                    height: 8px;
                    background-color: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                
                .round-timer-progress {
                    height: 100%;
                    width: 100%;
                    background-color: #4caf50;
                    transition: width 0.1s linear;
                }
                
                .spatial-grid {
                    display: grid;
                    gap: 10px;
                    margin: 20px 0;
                }
                
                .grid-item {
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, background-color 0.2s;
                    overflow: hidden;
                }
                
                .grid-item:hover {
                    transform: scale(1.05);
                }
                
                .grid-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                
                .grid-item.correct {
                    background-color: #a7e9af;
                }
                
                .grid-item.incorrect {
                    background-color: #ffb3b3;
                }
                
                /* Tamaños de cuadrícula */
                .grid-2x2 {
                    grid-template-columns: repeat(2, 120px);
                    grid-template-rows: repeat(2, 120px);
                }
                
                .grid-3x3 {
                    grid-template-columns: repeat(3, 100px);
                    grid-template-rows: repeat(3, 100px);
                }
                
                .grid-4x4 {
                    grid-template-columns: repeat(4, 80px);
                    grid-template-rows: repeat(4, 80px);
                }
                
                .grid-5x5 {
                    grid-template-columns: repeat(5, 70px);
                    grid-template-rows: repeat(5, 70px);
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
        this.timePerRound = 5000;
        this.gridSize = 2;
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-spatial-speed');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Generar primera ronda
        this.generateRound();
    }

    /**
     * Genera una nueva ronda del juego
     */
    generateRound() {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda anterior si existe
        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
        }
        
        // Generar la cuadrícula
        this.generateGrid();
        
        // Iniciar temporizador de ronda
        this.startRoundTimer();
    }

    /**
     * Genera la cuadrícula con los elementos
     */
    generateGrid() {
        const grid = document.querySelector('.spatial-grid');
        grid.innerHTML = '';
        
        // Establecer clase de tamaño de cuadrícula
        grid.className = `spatial-grid grid-${this.gridSize}x${this.gridSize}`;
        
        // Generar elementos de la cuadrícula
        const totalItems = this.gridSize * this.gridSize;
        this.currentGrid = [];
        
        // Seleccionar formas para esta ronda
        const shapes = this.getShapes();
        const mainShape = shapes.main;
        const differentShape = shapes.different;
        
        // Seleccionar posición del elemento diferente
        this.differentItemIndex = Math.floor(Math.random() * totalItems);
        
        // Crear los elementos de la cuadrícula
        for (let i = 0; i < totalItems; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.dataset.index = i;
            
            // Determinar si este es el elemento diferente
            const isSpecial = (i === this.differentItemIndex);
            const shape = isSpecial ? differentShape : mainShape;
            
            // Añadir la forma al elemento
            item.innerHTML = shape;
            
            // Añadir evento de clic
            item.addEventListener('click', () => {
                if (this.gameActive) {
                    this.checkAnswer(i);
                }
            });
            
            grid.appendChild(item);
            this.currentGrid.push({
                element: item,
                isSpecial: isSpecial
            });
        }
    }

    /**
     * Obtiene formas SVG para la ronda actual
     * @returns {Object} Objeto con formas SVG para elementos normales y diferentes
     */
    getShapes() {
        // Colores disponibles
        const colors = ['#4a90e2', '#4caf50', '#f44336', '#ff9800', '#9c27b0'];
        
        // Seleccionar colores aleatorios
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        let differentColor;
        do {
            differentColor = colors[Math.floor(Math.random() * colors.length)];
        } while (differentColor === mainColor);
        
        // Tipos de formas disponibles
        const shapeTypes = [
            // Círculo
            (color) => `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="40" fill="${color}" />
                </svg>
            `,
            // Cuadrado
            (color) => `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="10" width="80" height="80" fill="${color}" />
                </svg>
            `,
            // Triángulo
            (color) => `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,10 90,90 10,90" fill="${color}" />
                </svg>
            `,
            // Estrella
            (color) => `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" fill="${color}" />
                </svg>
            `,
            // Hexágono
            (color) => `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="${color}" />
                </svg>
            `
        ];
        
        // Seleccionar tipo de forma aleatoria
        const shapeIndex = Math.floor(Math.random() * shapeTypes.length);
        const shapeType = shapeTypes[shapeIndex];
        
        // Determinar cómo será diferente (por color o por forma)
        const differenceType = Math.random() < 0.5 ? 'color' : 'shape';
        
        if (differenceType === 'color') {
            // Diferente por color
            return {
                main: shapeType(mainColor),
                different: shapeType(differentColor)
            };
        } else {
            // Diferente por forma
            let differentShapeIndex;
            do {
                differentShapeIndex = Math.floor(Math.random() * shapeTypes.length);
            } while (differentShapeIndex === shapeIndex);
            
            return {
                main: shapeType(mainColor),
                different: shapeTypes[differentShapeIndex](mainColor)
            };
        }
    }

    /**
     * Inicia el temporizador de la ronda actual
     */
    startRoundTimer() {
        const timerProgress = document.querySelector('.round-timer-progress');
        timerProgress.style.width = '100%';
        
        // Tiempo inicial
        let timeLeft = this.timePerRound;
        const updateInterval = 50; // Actualizar cada 50ms para animación suave
        
        const updateTimer = () => {
            timeLeft -= updateInterval;
            const percentage = (timeLeft / this.timePerRound) * 100;
            timerProgress.style.width = `${percentage}%`;
            
            // Cambiar color según el tiempo restante
            if (percentage <= 20) {
                timerProgress.style.backgroundColor = '#f44336'; // Rojo cuando queda poco tiempo
            } else if (percentage <= 50) {
                timerProgress.style.backgroundColor = '#ff9800'; // Naranja cuando queda tiempo medio
            } else {
                timerProgress.style.backgroundColor = '#4caf50'; // Verde normal
            }
            
            if (timeLeft <= 0) {
                // Tiempo agotado
                this.handleTimeout();
            } else if (this.gameActive) {
                this.roundTimer = setTimeout(updateTimer, updateInterval);
            }
        };
        
        this.roundTimer = setTimeout(updateTimer, updateInterval);
    }

    /**
     * Verifica la respuesta del usuario
     * @param {number} index - Índice del elemento seleccionado
     */
    checkAnswer(index) {
        if (!this.gameActive) return;
        
        // Cancelar el temporizador de ronda
        clearTimeout(this.roundTimer);
        
        // Verificar si la respuesta es correcta
        const isCorrect = (index === this.differentItemIndex);
        
        // Actualizar contadores
        this.totalAnswers++;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;
            
            // Calcular puntos basados en tiempo restante y nivel
            const timerWidth = parseFloat(document.querySelector('.round-timer-progress').style.width);
            const timeBonus = Math.max(1, Math.floor(timerWidth / 10));
            const pointsEarned = 10 + timeBonus + (this.level * 5);
            
            this.score += pointsEarned;
            
            // Mostrar feedback positivo
            this.currentGrid[index].element.classList.add('correct');
            
            // Mostrar mensaje
            this.updateInstructions(`¡Correcto! +${pointsEarned} puntos`);
            
            // Aumentar nivel si hay suficientes respuestas correctas consecutivas
            if (this.consecutiveCorrect >= 3) {
                this.levelUp();
            }
        } else {
            this.consecutiveCorrect = 0;
            
            // Mostrar feedback negativo
            this.currentGrid[index].element.classList.add('incorrect');
            
            // Resaltar el elemento correcto
            this.currentGrid[this.differentItemIndex].element.classList.add('correct');
            
            // Mostrar mensaje
            this.updateInstructions('¡Incorrecto!');
        }
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `Cuadrícula ${this.gridSize}x${this.gridSize} - ${accuracy}% precisión`
        });
        
        // Programar la siguiente ronda después de un breve feedback
        setTimeout(() => {
            if (this.gameActive) {
                this.generateRound();
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
        
        // Resaltar el elemento correcto
        this.currentGrid[this.differentItemIndex].element.classList.add('correct');
        
        // Mostrar mensaje
        this.updateInstructions('¡Tiempo agotado!');
        
        // Actualizar estadísticas
        const accuracy = Math.round((this.correctAnswers / this.totalAnswers) * 100);
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `Cuadrícula ${this.gridSize}x${this.gridSize} - ${accuracy}% precisión`
        });
        
        // Programar la siguiente ronda
        setTimeout(() => {
            if (this.gameActive) {
                this.generateRound();
            }
        }, 1500);
    }

    /**
     * Aumenta el nivel de dificultad
     */
    levelUp() {
        this.level++;
        this.consecutiveCorrect = 0;
        
        // Aumentar tamaño de la cuadrícula cada 2 niveles
        if (this.level % 2 === 0 && this.gridSize < 5) {
            this.gridSize++;
        }
        
        // Reducir el tiempo por ronda (aumentar dificultad)
        this.timePerRound = Math.max(2000, this.timePerRound - 500);
        
        // Mostrar mensaje de subida de nivel
        this.updateInstructions(`¡Nivel ${this.level}! Cuadrícula ${this.gridSize}x${this.gridSize}`);
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
        const startButton = document.getElementById('start-spatial-speed');
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
                    <p>Tamaño máximo: Cuadrícula ${this.gridSize}x${this.gridSize}</p>
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