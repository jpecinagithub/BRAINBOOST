/**
 * Memory Matrix - Juego de memoria visual
 * Muestra una cuadrícula 4x4 con casillas iluminadas brevemente y el usuario debe repetir la secuencia
 */
class MemoryMatrix {
    /**
     * Constructor del juego Memory Matrix
     * @param {Function} updateStatsCallback - Función para actualizar estadísticas en la UI
     */
    constructor(updateStatsCallback) {
        this.updateStats = updateStatsCallback;
        this.gridSize = 4; // Tamaño de la cuadrícula (4x4)
        this.level = 1;
        this.score = 0;
        this.pattern = []; // Patrón a memorizar
        this.userPattern = []; // Patrón ingresado por el usuario
        this.gameActive = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.cellsToRemember = 3; // Cantidad inicial de celdas a recordar
        this.gameTime = 60; // Tiempo máximo de juego en segundos
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Memory Matrix</h2>
                <p>Memoriza el patrón de casillas iluminadas y luego reprodúcelo haciendo clic en las casillas.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="memory-grid"></div>
            <button id="start-memory" class="control-btn">Comenzar</button>
        `;
        
        // Crear la cuadrícula
        this.createGrid();
        
        // Configurar el botón de inicio
        document.getElementById('start-memory').addEventListener('click', () => {
            this.startGame();
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: `${this.cellsToRemember} casillas`
        });
    }

    /**
     * Crea la cuadrícula del juego
     */
    createGrid() {
        const grid = document.querySelector('.memory-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.dataset.index = i;
            
            // Agregar evento de clic solo cuando el juego esté en fase de entrada del usuario
            cell.addEventListener('click', () => {
                if (this.gameActive && this.pattern.length > 0) {
                    this.handleCellClick(i);
                }
            });
            
            grid.appendChild(cell);
        }
    }

    /**
     * Inicia una nueva ronda del juego
     */
    startGame() {
        // Reiniciar variables de juego
        this.userPattern = [];
        this.gameActive = false;
        
        // Generar nuevo patrón
        this.generatePattern();
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-memory');
        startButton.textContent = 'Espera...';
        startButton.disabled = true;
        
        // Mostrar instrucciones
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = '¡Memoriza el patrón!';
        
        // Mostrar el patrón al usuario
        this.showPattern(() => {
            // Después de mostrar el patrón, permitir la entrada del usuario
            this.gameActive = true;
            startButton.textContent = 'Jugando...';
            instructions.textContent = 'Ahora, reproduce el patrón haciendo clic en las casillas.';
            
            // Iniciar temporizador
            this.startTime = Date.now();
            this.startTimer();
        });
    }

    /**
     * Genera un patrón aleatorio para memorizar
     */
    generatePattern() {
        this.pattern = [];
        const totalCells = this.gridSize * this.gridSize;
        
        // Generar índices únicos para las celdas a iluminar
        while (this.pattern.length < this.cellsToRemember) {
            const randomIndex = Math.floor(Math.random() * totalCells);
            if (!this.pattern.includes(randomIndex)) {
                this.pattern.push(randomIndex);
            }
        }
    }

    /**
     * Muestra el patrón al usuario
     * @param {Function} callback - Función a ejecutar después de mostrar el patrón
     */
    showPattern(callback) {
        const cells = document.querySelectorAll('.memory-cell');
        let currentIndex = 0;
        
        // Mostrar cada celda del patrón secuencialmente
        const showNext = () => {
            if (currentIndex < this.pattern.length) {
                const cellIndex = this.pattern[currentIndex];
                cells[cellIndex].classList.add('highlighted');
                
                // Quitar el resaltado después de un tiempo
                setTimeout(() => {
                    cells[cellIndex].classList.remove('highlighted');
                    currentIndex++;
                    
                    // Pequeña pausa entre celdas
                    setTimeout(showNext, 300);
                }, 700);
            } else {
                // Patrón completo mostrado
                setTimeout(callback, 500);
            }
        };
        
        // Iniciar la secuencia
        showNext();
    }

    /**
     * Maneja el clic en una celda durante la fase de entrada del usuario
     * @param {number} index - Índice de la celda clickeada
     */
    handleCellClick(index) {
        if (!this.gameActive) return;
        
        const cells = document.querySelectorAll('.memory-cell');
        const currentCell = cells[index];
        
        // Agregar el índice al patrón del usuario
        this.userPattern.push(index);
        
        // Verificar si la selección es correcta
        const currentPosition = this.userPattern.length - 1;
        const isCorrect = this.pattern[currentPosition] === index;
        
        if (isCorrect) {
            // Resaltar brevemente la celda como correcta
            currentCell.classList.add('correct');
            setTimeout(() => {
                currentCell.classList.remove('correct');
            }, 300);
            
            // Verificar si el patrón está completo
            if (this.userPattern.length === this.pattern.length) {
                this.gameActive = false;
                this.handleSuccess();
            }
        } else {
            // Resaltar brevemente la celda como incorrecta
            currentCell.classList.add('incorrect');
            setTimeout(() => {
                currentCell.classList.remove('incorrect');
            }, 300);
            
            // Marcar como error pero mantener el cronómetro activo
            this.gameActive = false;
            this.handleFailure();
        }
    }

    /**
     * Maneja el éxito al completar correctamente el patrón
     */
    handleSuccess() {
        // Calcular puntuación basada en tiempo y nivel
        const timeBonus = Math.max(1, 10 - Math.floor(this.elapsedTime / 2));
        const levelBonus = this.level * 5;
        const pointsEarned = this.cellsToRemember * 10 + timeBonus + levelBonus;
        
        this.score += pointsEarned;
        
        // Actualizar nivel y dificultad
        this.level++;
        if (this.level % 2 === 0 && this.cellsToRemember < 12) {
            this.cellsToRemember++;
        }
        
        // Actualizar estadísticas
        this.updateStats({
            score: this.score,
            time: this.elapsedTime,
            level: this.level,
            progress: `${this.cellsToRemember} casillas`
        });
        
        // Mostrar mensaje de éxito
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = `¡Correcto! +${pointsEarned} puntos. Preparando siguiente nivel...`;
        
        // Actualizar botón
        const startButton = document.getElementById('start-memory');
        startButton.textContent = 'Siguiente nivel';
        startButton.disabled = false;
    }

    /**
     * Maneja el fallo al completar incorrectamente el patrón
     */
    handleFailure() {
        // Mostrar mensaje de fallo
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = '¡Incorrecto! Inténtalo de nuevo.';
        
        // Mostrar el patrón correcto
        this.showCorrectPattern();
        
        // Actualizar botón
        const startButton = document.getElementById('start-memory');
        startButton.textContent = 'Reintentar';
        startButton.disabled = false;
    }

    /**
     * Muestra el patrón correcto después de un fallo
     */
    showCorrectPattern() {
        const cells = document.querySelectorAll('.memory-cell');
        
        // Resaltar todas las celdas del patrón correcto
        this.pattern.forEach(index => {
            cells[index].classList.add('highlighted');
        });
        
        // Quitar el resaltado después de un tiempo
        setTimeout(() => {
            this.pattern.forEach(index => {
                cells[index].classList.remove('highlighted');
            });
        }, 2000);
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
            
            // Terminar el juego después del tiempo límite
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
    }
    
    /**
     * Finaliza el juego cuando se alcanza el límite de tiempo
     */
    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        // Actualizar botón de inicio
        const startButton = document.getElementById('start-memory');
        startButton.textContent = 'Jugar de nuevo';
        startButton.disabled = false;
        
        // Mostrar resultados finales
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = `¡Tiempo agotado! Puntuación final: ${this.score}`;
        
        // Mostrar el patrón correcto si estaba en medio de una ronda
        if (this.pattern.length > 0 && this.userPattern.length < this.pattern.length) {
            this.showCorrectPattern();
        }
        
        // Mostrar popup con puntuación final
        this.showScorePopup();
    }
    
    /**
     * Muestra un popup con la puntuación final
     */
    showScorePopup() {
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
                    <p>Celdas memorizadas: ${this.cellsToRemember}</p>
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