/**
 * BrainBoost - Módulo Principal
 * Controla la navegación entre juegos y gestiona el estado global de la aplicación
 */

// Estado global de la aplicación
const appState = {
    currentGame: null,
    scores: {
        memoryMatrix: 0,
        speedMatch: 0,
        colorMatch: 0,
        wordBubbles: 0,
        chalkboardChallenge: 0,
        lostInMigration: 0,
        brainShift: 0,
        digitDetective: 0,
        spatialSpeed: 0
    },
    gameInstances: {}
};

// Elementos DOM
const gameArea = document.getElementById('game-area');
const scoreDisplay = document.getElementById('score-display');
const timeDisplay = document.getElementById('time-display');
const levelDisplay = document.getElementById('level-display');
const progressDisplay = document.getElementById('progress-display');
let gamesSection, gameInterface, currentGameTitle, backToMenuBtn;

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los nuevos elementos del DOM
    gamesSection = document.getElementById('games-section');
    gameInterface = document.querySelector('.game-interface');
    currentGameTitle = document.getElementById('current-game-title');
    backToMenuBtn = document.getElementById('back-to-menu');
    
    // Configurar listeners para los botones de juego
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const gameName = button.getAttribute('data-game');
            loadGame(gameName);
        });
    });
    
    // Configurar el botón de volver al menú
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            showGamesMenu();
        });
    }

    // Inicializar instancias de juegos
    appState.gameInstances = {
        memoryMatrix: new MemoryMatrix(updateStats),
        speedMatch: new SpeedMatch(updateStats),
        colorMatch: new ColorMatch(updateStats),
        wordBubbles: new WordBubbles(updateStats),
        chalkboardChallenge: new ChalkboardChallenge(updateStats),
        lostInMigration: new LostInMigration(updateStats),
        brainShift: new BrainShift(updateStats),
        digitDetective: new DigitDetective(updateStats),
        spatialSpeed: new SpatialSpeed(updateStats)
    };
    
    // Añadir animación al icono del cerebro
    animateBrainIcon();
});

/**
 * Carga un juego específico en el área de juego
 * @param {string} gameName - Nombre del juego a cargar
 */
function loadGame(gameName) {
    // Mostrar la interfaz del juego y ocultar la sección de juegos
    gamesSection.style.display = 'none';
    gameInterface.classList.remove('hidden');
    
    // Actualizar el título del juego actual
    const gameTitle = getGameTitle(gameName);
    currentGameTitle.textContent = gameTitle;
    
    // Limpiar el área de juego
    gameArea.innerHTML = '';
    
    // Actualizar el juego actual
    appState.currentGame = gameName;
    
    // Inicializar el juego seleccionado
    const game = appState.gameInstances[gameName];
    if (game) {
        game.init();
    } else {
        console.error(`El juego ${gameName} no está implementado`);
        gameArea.innerHTML = '<div class="welcome-screen"><h2>Error</h2><p>El juego seleccionado no está disponible.</p></div>';
    }
    
    // Actualizar estadísticas
    updateStats({
        score: 0,
        time: 0,
        level: 1,
        progress: '-'
    });
    
    // Desplazarse al área del juego
    gameInterface.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Muestra el menú de juegos y oculta la interfaz del juego
 */
function showGamesMenu() {
    gamesSection.style.display = 'block';
    gameInterface.classList.add('hidden');
    
    // Desplazarse al menú de juegos
    gamesSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Obtiene el título completo de un juego a partir de su nombre clave
 * @param {string} gameName - Nombre clave del juego
 * @returns {string} - Título completo del juego
 */
function getGameTitle(gameName) {
    const titles = {
        memoryMatrix: 'Memory Matrix',
        speedMatch: 'Speed Match',
        colorMatch: 'Color Match',
        wordBubbles: 'Word Bubbles',
        chalkboardChallenge: 'Chalkboard Challenge',
        lostInMigration: 'Lost in Migration',
        brainShift: 'Brain Shift',
        digitDetective: 'Digit Detective',
        spatialSpeed: 'Spatial Speed'
    };
    
    return titles[gameName] || 'Juego Desconocido';
}

/**
 * Actualiza las estadísticas mostradas en el panel de resultados
 * @param {Object} stats - Objeto con las estadísticas a actualizar
 */
function updateStats(stats) {
    if (stats.score !== undefined) {
        scoreDisplay.textContent = stats.score;
        // Actualizar el puntaje en el estado global
        if (appState.currentGame) {
            appState.scores[appState.currentGame] = stats.score;
        }
    }
    
    if (stats.time !== undefined) {
        timeDisplay.textContent = `${stats.time}s`;
    }
    
    if (stats.level !== undefined) {
        levelDisplay.textContent = stats.level;
    }
    
    if (stats.progress !== undefined) {
        progressDisplay.textContent = stats.progress;
    }
}

/**
 * Anima el icono del cerebro en la sección hero
 */
function animateBrainIcon() {
    const brainIcon = document.querySelector('.brain-icon');
    if (!brainIcon) return;
    
    // Posicionar aleatoriamente el icono del cerebro
    function randomPosition() {
        const x = Math.random() * 80 + 10; // 10% a 90% del ancho
        const y = Math.random() * 80 + 10; // 10% a 90% del alto
        brainIcon.style.left = `${x}%`;
        brainIcon.style.top = `${y}%`;
    }
    
    // Posición inicial
    randomPosition();
    
    // Cambiar posición cada cierto tiempo
    setInterval(() => {
        randomPosition();
    }, 8000);
}