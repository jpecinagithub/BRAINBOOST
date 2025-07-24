/**
 * Word Bubbles - Juego de fluidez verbal
 * El usuario debe formar palabras que comiencen con una letra específica
 */
class WordBubbles {
    /**
     * Constructor del juego Word Bubbles
     * @param {Function} updateStatsCallback - Función para actualizar estadísticas en la UI
     */
    constructor(updateStatsCallback) {
        this.updateStats = updateStatsCallback;
        this.currentLetter = '';
        this.validWords = [];
        this.userWords = [];
        this.score = 0;
        this.level = 1;
        this.gameActive = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.gameTime = 60; // Tiempo de juego en segundos
        this.commonSpanishWords = [
            // Palabras con A
            'agua', 'amor', 'amigo', 'animal', 'árbol', 'aire', 'auto', 'azul', 'alto', 'abajo',
            'andar', 'ayuda', 'año', 'alma', 'arte', 'ayer', 'ahora', 'antes', 'algo', 'alguien',
            // Palabras con B
            'boca', 'brazo', 'bueno', 'bonito', 'barco', 'bebé', 'beso', 'banco', 'baile', 'bosque',
            'bola', 'botón', 'bolsa', 'brillo', 'buscar', 'bailar', 'beber', 'bajar', 'borrar', 'brillar',
            // Palabras con C
            'casa', 'calle', 'color', 'comer', 'cielo', 'carro', 'cabeza', 'cuerpo', 'corazón', 'ciudad',
            'campo', 'camino', 'calor', 'clase', 'cosa', 'correr', 'cantar', 'crear', 'crecer', 'conocer',
            // Palabras con D
            'día', 'dedo', 'dulce', 'dolor', 'diente', 'dibujo', 'dinero', 'danza', 'dormir', 'decir',
            'dar', 'deber', 'dejar', 'dentro', 'desde', 'después', 'durante', 'dueño', 'doble', 'duro',
            // Palabras con E
            'edad', 'estar', 'espejo', 'escuela', 'estrella', 'espacio', 'equipo', 'error', 'esperar', 'escribir',
            'entrar', 'elegir', 'enviar', 'enseñar', 'encontrar', 'entender', 'escuchar', 'empezar', 'existir', 'explicar',
            // Palabras con F
            'flor', 'fuego', 'fruta', 'familia', 'fiesta', 'foto', 'fuerza', 'forma', 'fácil', 'frío',
            'feliz', 'final', 'fondo', 'futuro', 'favor', 'faltar', 'formar', 'funcionar', 'firmar', 'fallar',
            // Palabras con G
            'gato', 'gente', 'grande', 'grupo', 'guerra', 'gusto', 'gracia', 'golpe', 'gota', 'gris',
            'ganar', 'guardar', 'guiar', 'girar', 'gritar', 'gustar', 'gastar', 'generar', 'gobernar', 'gestionar',
            // Palabras con H
            'hora', 'hoja', 'huevo', 'hombre', 'hermano', 'hijo', 'historia', 'hambre', 'hielo', 'hueso',
            'hablar', 'hacer', 'haber', 'hallar', 'herir', 'hundir', 'huir', 'hervir', 'honrar', 'humillar',
            // Palabras con I
            'isla', 'idea', 'imagen', 'iglesia', 'invierno', 'insecto', 'interés', 'inicio', 'idioma', 'igual',
            'ir', 'incluir', 'intentar', 'invitar', 'informar', 'impedir', 'importar', 'imaginar', 'indicar', 'investigar',
            // Palabras con J
            'juego', 'jardín', 'joven', 'juez', 'jugo', 'jaula', 'jirafa', 'jamón', 'jefe', 'juguete',
            'jugar', 'juntar', 'juzgar', 'jurar', 'jalar', 'jadear', 'justificar', 'jubilarse', 'jactarse', 'jerarquizar',
            // Palabras con L
            'luz', 'luna', 'libro', 'lago', 'lado', 'línea', 'labio', 'lugar', 'llave', 'lluvia',
            'leer', 'lavar', 'llamar', 'llevar', 'llorar', 'lograr', 'luchar', 'limitar', 'liberar', 'liderar',
            // Palabras con M
            'mano', 'mesa', 'mar', 'mundo', 'madre', 'música', 'miedo', 'mapa', 'montaña', 'madera',
            'mirar', 'mover', 'meter', 'mandar', 'mejorar', 'mantener', 'merecer', 'mostrar', 'medir', 'mencionar',
            // Palabras con N
            'noche', 'niño', 'nombre', 'nariz', 'nube', 'nido', 'nivel', 'norte', 'número', 'noticia',
            'nadar', 'nacer', 'negar', 'notar', 'nombrar', 'necesitar', 'navegar', 'nutrir', 'normalizar', 'neutralizar',
            // Palabras con O
            'ojo', 'oro', 'olla', 'oso', 'ola', 'orden', 'objeto', 'origen', 'orilla', 'oveja',
            'oír', 'oler', 'odiar', 'opinar', 'obtener', 'observar', 'ofrecer', 'olvidar', 'organizar', 'orientar',
            // Palabras con P
            'pan', 'pelo', 'piso', 'pared', 'puerta', 'papel', 'piedra', 'planta', 'playa', 'pueblo',
            'poner', 'poder', 'pasar', 'pedir', 'pensar', 'perder', 'partir', 'pagar', 'probar', 'producir',
            // Palabras con R
            'río', 'ropa', 'rosa', 'rueda', 'reloj', 'risa', 'rama', 'raíz', 'rayo', 'regalo',
            'reír', 'romper', 'robar', 'rezar', 'recibir', 'recordar', 'realizar', 'resolver', 'reducir', 'respetar',
            // Palabras con S
            'sol', 'silla', 'suelo', 'sangre', 'sueño', 'semana', 'sonido', 'sabor', 'salud', 'señal',
            'ser', 'saber', 'salir', 'sentir', 'seguir', 'servir', 'soñar', 'subir', 'sufrir', 'superar',
            // Palabras con T
            'taza', 'tiempo', 'tierra', 'techo', 'trabajo', 'tren', 'teatro', 'teléfono', 'tigre', 'tormenta',
            'tener', 'tomar', 'tocar', 'traer', 'tratar', 'terminar', 'tardar', 'temblar', 'transformar', 'transmitir',
            // Palabras con U
            'uva', 'uno', 'uso', 'uña', 'unión', 'universidad', 'universo', 'uniforme', 'utilidad', 'urgencia',
            'unir', 'usar', 'ubicar', 'unificar', 'utilizar', 'urbanizar', 'ultimar', 'ungir', 'usurpar', 'urdir',
            // Palabras con V
            'voz', 'vida', 'vino', 'vaso', 'viento', 'viaje', 'ventana', 'verdad', 'valor', 'vestido',
            'ver', 'vivir', 'venir', 'volar', 'vender', 'vencer', 'valorar', 'variar', 'verificar', 'visualizar'
        ];
        
        // Letras disponibles para el juego (excluimos algunas poco comunes en español)
        this.availableLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V'];
    }

    /**
     * Inicializa el juego
     */
    init() {
        const gameArea = document.getElementById('game-area');
        
        // Crear contenedor para el juego
        gameArea.innerHTML = `
            <div class="instructions">
                <h2>Word Bubbles</h2>
                <p>Forma palabras que comiencen con la letra indicada.</p>
            </div>
            <div class="countdown-container">
                <div class="time-remaining">60</div>
                <div class="countdown-timer">
                    <div class="countdown-progress"></div>
                </div>
            </div>
            <div class="word-bubbles-container">
                <div class="current-letter">A</div>
                <div class="word-input-container">
                    <input type="text" id="word-input" placeholder="Escribe una palabra..." autocomplete="off">
                    <button id="submit-word" class="control-btn">Añadir</button>
                </div>
                <div class="word-list"></div>
            </div>
            <button id="start-word-bubbles" class="control-btn">Comenzar</button>
        `;
        
        // Configurar el botón de inicio
        document.getElementById('start-word-bubbles').addEventListener('click', () => {
            this.startGame();
        });
        
        // Configurar el botón de envío de palabras
        document.getElementById('submit-word').addEventListener('click', () => {
            this.submitWord();
        });
        
        // Configurar el input para enviar al presionar Enter
        document.getElementById('word-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitWord();
            }
        });
        
        // Actualizar estadísticas iniciales
        this.updateStats({
            score: this.score,
            time: 0,
            level: this.level,
            progress: '0 palabras'
        });
        
        // Añadir estilos específicos para Word Bubbles si no existen
        this.addStyles();
    }

    /**
     * Añade estilos específicos para el juego Word Bubbles
     */
    addStyles() {
        // Verificar si ya existe un estilo para Word Bubbles
        if (!document.getElementById('word-bubbles-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'word-bubbles-styles';
            styleElement.textContent = `
                .word-bubbles-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                }
                
                .current-letter {
                    font-size: 72px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #4a90e2;
                }
                
                .word-input-container {
                    display: flex;
                    width: 100%;
                    margin-bottom: 20px;
                }
                
                #word-input {
                    flex: 1;
                    padding: 10px;
                    font-size: 18px;
                    border: 2px solid #4a90e2;
                    border-radius: 4px 0 0 4px;
                }
                
                #submit-word {
                    border-radius: 0 4px 4px 0;
                    margin-top: 0;
                }
                
                .word-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    max-height: 200px;
                    overflow-y: auto;
                    padding: 10px;
                    border: 1px solid #e0e0e0;
                    border-radius: 4px;
                }
                
                .word-bubble {
                    background-color: #4a90e2;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 16px;
                    animation: bubble-appear 0.3s ease-out;
                }
                
                @keyframes bubble-appear {
                    from { transform: scale(0); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
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
        this.userWords = [];
        this.gameActive = true;
        
        // Seleccionar una letra aleatoria
        this.selectRandomLetter();
        
        // Cambiar texto del botón
        const startButton = document.getElementById('start-word-bubbles');
        startButton.textContent = 'Jugando...';
        startButton.disabled = true;
        
        // Habilitar input
        document.getElementById('word-input').disabled = false;
        document.getElementById('word-input').focus();
        document.getElementById('submit-word').disabled = false;
        
        // Limpiar lista de palabras
        document.querySelector('.word-list').innerHTML = '';
        
        // Iniciar temporizador
        this.startTime = Date.now();
        this.startTimer();
        
        // Actualizar instrucciones
        this.updateInstructions(`Forma palabras que comiencen con la letra "${this.currentLetter}"`);
    }

    /**
     * Selecciona una letra aleatoria para el juego
     */
    selectRandomLetter() {
        this.currentLetter = this.availableLetters[Math.floor(Math.random() * this.availableLetters.length)];
        document.querySelector('.current-letter').textContent = this.currentLetter;
        
        // Filtrar palabras válidas para esta letra
        this.validWords = this.commonSpanishWords.filter(word => 
            word.toLowerCase().startsWith(this.currentLetter.toLowerCase())
        );
    }

    /**
     * Procesa la palabra enviada por el usuario
     */
    submitWord() {
        if (!this.gameActive) return;
        
        const input = document.getElementById('word-input');
        const word = input.value.trim().toLowerCase();
        
        // Validar la palabra
        if (word.length < 3) {
            this.showFeedback('La palabra debe tener al menos 3 letras');
            return;
        }
        
        if (!word.startsWith(this.currentLetter.toLowerCase())) {
            this.showFeedback(`La palabra debe comenzar con la letra ${this.currentLetter}`);
            return;
        }
        
        if (this.userWords.includes(word)) {
            this.showFeedback('Ya has usado esta palabra');
            return;
        }
        
        // Verificar si la palabra es válida (está en nuestra lista o es una palabra común)
        const isValid = this.validWords.includes(word) || this.isCommonWord(word);
        
        if (isValid) {
            // Añadir la palabra a la lista del usuario
            this.userWords.push(word);
            
            // Añadir la palabra a la UI
            this.addWordBubble(word);
            
            // Calcular puntos (más puntos para palabras más largas)
            const points = Math.max(5, word.length * 2);
            this.score += points;
            
            // Mostrar feedback
            this.showFeedback(`+${points} puntos`);
            
            // Actualizar nivel basado en cantidad de palabras
            this.level = Math.max(1, Math.floor(this.userWords.length / 5) + 1);
            
            // Actualizar estadísticas
            this.updateStats({
                score: this.score,
                time: this.elapsedTime,
                level: this.level,
                progress: `${this.userWords.length} palabras`
            });
        } else {
            this.showFeedback('Palabra no válida');
        }
        
        // Limpiar el input
        input.value = '';
        input.focus();
    }

    /**
     * Verifica si una palabra es común (para aceptar palabras que no estén en nuestra lista)
     * @param {string} word - Palabra a verificar
     * @returns {boolean} - True si la palabra parece ser común
     */
    isCommonWord(word) {
        // Esta es una validación simple. En una implementación real,
        // se podría usar un diccionario más completo o una API
        return word.length >= 3 && /^[a-záéíóúüñ]+$/i.test(word);
    }

    /**
     * Añade una palabra a la UI como una burbuja
     * @param {string} word - Palabra a añadir
     */
    addWordBubble(word) {
        const wordList = document.querySelector('.word-list');
        const bubble = document.createElement('div');
        bubble.className = 'word-bubble';
        bubble.textContent = word;
        wordList.appendChild(bubble);
        
        // Hacer scroll al final si es necesario
        wordList.scrollTop = wordList.scrollHeight;
    }

    /**
     * Muestra un mensaje de feedback al usuario
     * @param {string} message - Mensaje a mostrar
     */
    showFeedback(message) {
        const instructions = document.querySelector('.instructions p');
        instructions.textContent = message;
        
        // Restaurar el mensaje original después de un tiempo
        setTimeout(() => {
            if (this.gameActive) {
                this.updateInstructions(`Forma palabras que comiencen con la letra "${this.currentLetter}"`);
            }
        }, 1500);
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
    }

    /**
     * Finaliza el juego
     */
    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        // Deshabilitar input
        document.getElementById('word-input').disabled = true;
        document.getElementById('submit-word').disabled = true;
        
        // Actualizar botón de inicio
        const startButton = document.getElementById('start-word-bubbles');
        startButton.textContent = 'Jugar de nuevo';
        startButton.disabled = false;
        
        // Mostrar resultados finales
        this.updateInstructions(`¡Juego terminado! Has formado ${this.userWords.length} palabras. Puntuación: ${this.score}`);
        
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
                    <p>Palabras formadas: ${this.userWords.length}</p>
                    <p>Letra: ${this.currentLetter}</p>
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