/**
 * BrainBoost - Configuración global
 * Este archivo contiene configuraciones globales para la aplicación
 */

const BrainBoostConfig = {
    // Configuración general
    appName: 'BrainBoost',
    version: '1.0.0',
    
    // Configuración de juegos
    games: {
        defaultGameTime: 60, // Tiempo de juego en segundos
        
        // Configuraciones específicas por juego
        memoryMatrix: {
            initialGridSize: 4,
            initialCellsToRemember: 3,
            maxCellsToRemember: 12
        },
        
        speedMatch: {
            initialTimePerSymbol: 3000,
            minTimePerSymbol: 1000
        },
        
        colorMatch: {
            initialTimePerWord: 3000,
            minTimePerWord: 1200
        },
        
        wordBubbles: {
            minWordLength: 3
        },
        
        chalkboardChallenge: {
            initialTimePerQuestion: 10,
            minTimePerQuestion: 3
        },
        
        lostInMigration: {
            initialTimePerRound: 2000,
            minTimePerRound: 800,
            maxDistractionLevel: 4
        },
        
        brainShift: {
            initialTimePerRound: 3000,
            minTimePerRound: 1000
        },
        
        digitDetective: {
            initialSequenceLength: 3,
            initialDisplayTime: 1000,
            minDisplayTime: 500
        },
        
        spatialSpeed: {
            initialTimePerRound: 5000,
            minTimePerRound: 2000,
            maxGridSize: 5
        }
    },
    
    // Configuración de UI
    ui: {
        animations: true,
        sounds: false, // Para implementación futura
        confetti: true
    },
    
    // Configuración de almacenamiento (para implementación futura)
    storage: {
        saveScores: false,
        savePreferences: false
    }
};

// Exportar la configuración para su uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrainBoostConfig;
}