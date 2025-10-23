class TuringMachine {
    constructor() {
        this.tape = []; //representa la cinta
        this.headPosition = 0; // posicio del cabezal
        this.currentState = ''; // estado actual de la maquina
        this.initialState = ''; //estado inicial
        this.finalStates = new Set(); //estado final o aceptacion
        this.blankSymbol = '_'; //simbolos en blanco
        this.transitions = new Map(); //reglas de transicion
        this.stepCount = 0;//contador de paso
        this.isRunning = false;//si esta corriendo
        this.isHalted = false;//si esta detenida
    }

    //inicializa los valores
    initialize(input, initialState, finalStates, blankSymbol, rules) {
        this.tape = Array.from(input || '');
        this.headPosition = 0;
        this.currentState = initialState;
        this.initialState = initialState;
        this.finalStates = new Set(finalStates);
        this.blankSymbol = blankSymbol;
        this.stepCount = 0;
        this.isRunning = false;
        this.isHalted = false;
        this.transitions = new Map();

        rules.forEach(rule => {
            const [key, value] = rule.split('→');
            this.transitions.set(key.trim(), value.trim());
        });

        //actualiza la pantalla de logs
        this.updateDisplay();
        this.log(`Máquina inicializada con entrada: "${input}"`);
        this.log(`Estado inicial: ${initialState}`);
        this.log(`Estados finales: ${Array.from(finalStates).join(', ')}`);
    }

    //devuelve el simbolo actual donde el cabezal tape = '1','0','1'; headPosition = 1; getcu.. = 0
    getCurrentSymbol() {
        if (this.headPosition < 0 || this.headPosition >= this.tape.length) {
            return this.blankSymbol;
        }
        return this.tape[this.headPosition] || this.blankSymbol;
    }

    //metodo para ejecutar paso por paso la maquina
    step() {
        if (this.isHalted) {
            this.log('La máquina ya se ha detenido');
            return false;
        }

        const currentSymbol = this.getCurrentSymbol();
        const key = `${this.currentState},${currentSymbol}`;

        if (!this.transitions.has(key)) {
            this.log(`No hay transición para (${this.currentState}, ${currentSymbol})`);
            this.isHalted = true;
            this.updateStatus();
            return false;
        }

        const transition = this.transitions.get(key);
        const [newState, newSymbol, direction] = transition.split(',');

        this.log(`(${this.currentState}, ${currentSymbol}) → (${newState}, ${newSymbol}, ${direction})`);

        // Extender la cinta si es necesario
        while (this.headPosition >= this.tape.length) {
            this.tape.push(this.blankSymbol);
        }
        if (this.headPosition < 0) {
            this.tape.unshift(this.blankSymbol);
            this.headPosition = 0;
        }

        // Escribir símbolo
        this.tape[this.headPosition] = newSymbol;

        // Cambiar estado
        this.currentState = newState;

        // Mover cabezal
        if (direction.toUpperCase() === 'R') {
            this.headPosition++;
        } else if (direction.toUpperCase() === 'L') {
            this.headPosition--;
        }

        this.stepCount++;

        // Verificar si llegó a un estado final
        if (this.finalStates.has(this.currentState)) {
            this.log(`¡Máquina aceptó la entrada! Estado final: ${this.currentState}`);
            this.isHalted = true;
        }

        this.updateDisplay();
        return true;
    }

    updateDisplay() {
        this.updateTape();
        this.updateStatus();
    }

    updateTape() {
        const tapeElement = document.getElementById('tape');
        tapeElement.innerHTML = '';

        // Mostrar un rango más amplio de la cinta
        const start = Math.max(0, this.headPosition - 10);
        const end = Math.min(this.tape.length, this.headPosition + 11);

        for (let i = start; i < end; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = this.tape[i] || this.blankSymbol;

            if (i === this.headPosition) {
                cell.classList.add('current');
            }

            tapeElement.appendChild(cell);
        }

        // Mostrar celdas vacías si el cabezal está fuera de la cinta
        if (this.headPosition < 0 || this.headPosition >= this.tape.length) {
            const cell = document.createElement('div');
            cell.className = 'cell current';
            cell.textContent = this.blankSymbol;
            if (this.headPosition < 0) {
                tapeElement.insertBefore(cell, tapeElement.firstChild);
            } else {
                tapeElement.appendChild(cell);
            }
        }
    }

    //actualiza los valores del log
    updateStatus() {
        document.getElementById('current-state').textContent = this.currentState || '-';
        document.getElementById('head-position').textContent = this.headPosition;
        document.getElementById('step-count').textContent = this.stepCount;

        let status = 'Ejecutando';
        if (this.isHalted) {
            status = this.finalStates.has(this.currentState) ? 'Aceptada' : 'Rechazada';
        } else if (!this.isRunning) {
            status = 'Detenida';
        }
        document.getElementById('machine-status').textContent = status;
    }

    log(message) {
        const logElement = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        logElement.innerHTML += `[${timestamp}] ${message}\n`;
        logElement.scrollTop = logElement.scrollHeight;
    }

    //reinicia toda la maquina
    reset() {
        this.tape = [];
        this.headPosition = 0;
        this.currentState = '';
        this.stepCount = 0;
        this.isRunning = false;
        this.isHalted = false;

        document.getElementById('log').innerHTML = '';
        this.updateDisplay();
        this.log('Máquina reiniciada');
    }

}//end class

const machine = new TuringMachine();

function initializeMachine() {
    const input = document.getElementById('input-string').value;
    const initialState = document.getElementById('initial-state').value;
    const finalStatesStr = document.getElementById('final-states').value;
    const blankSymbol = document.getElementById('blank-symbol').value || '_';
    const rulesStr = document.getElementById('transition-rules').value;

    if (!initialState) {
        alert('Por favor, especifica un estado inicial');
        return;
    }

    const finalStates = finalStatesStr.split(',').map(s => s.trim()).filter(s => s);
    const rules = rulesStr.split('\n').map(r => r.trim()).filter(r => r && r.includes('→'));

    if (rules.length === 0) {
        alert('Por favor, especifica al menos una regla de transición');
        return;
    }

    machine.initialize(input, initialState, finalStates, blankSymbol, rules);
}

function step() {
    machine.step();
}

function run() {
    if (machine.isHalted) {
        machine.log('⛔ La máquina ya se ha detenido');
        return;
    }

    machine.isRunning = true;
    machine.updateStatus();

    function runStep() {
        if (machine.step() && !machine.isHalted) {
            setTimeout(runStep, 500); // Pausa de 500ms entre pasos
        } else {
            machine.isRunning = false;
            machine.updateStatus();
        }
    }

    runStep();
}

function reset() {
    machine.reset();
}

// Inicializar con ejemplo por defecto
window.onload = function () {
    initializeMachine();
};