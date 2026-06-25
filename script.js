// --- VARIABLES GLOBALES ---
let diccionarioGlobal = [];
let olla = [];
let ollaOriginal = [];

let equipoA = [];
let equipoB = [];
let indiceTurnoA = 0;
let indiceTurnoB = 0;
let tocaEquipo = 'A'; // Alterna entre A y B
let jugadorActual = null;

let palabraActualObj = null;
let puntosEqA = 0;
let puntosEqB = 0;
let tiempoRestante = 60;
let intervalo = null;

// --- INICIALIZACIÓN ---
window.onload = () => {
    // Intenta cargar el diccionario JSON externo
    fetch('diccionario.json')
        .then(response => {
            if (!response.ok) throw new Error("No se encontró diccionario.json");
            return response.json();
        })
        .then(data => {
            diccionarioGlobal = data;
            console.log("Diccionario cargado exitosamente.");
        })
        .catch(err => {
            console.warn("Aviso:", err.message, "- Se usará un diccionario de emergencia.");
            diccionarioGlobal = [
                { palabra: "Computadora", definicion: "Máquina electrónica para procesar datos" },
                { palabra: "Playa", definicion: "Extensión casi plana de arena a la orilla del mar" },
                { palabra: "Teléfono", definicion: "Dispositivo para comunicación a distancia" },
                { palabra: "Dinosaurio", definicion: "Reptil prehistórico extinto" }
            ];
        });
};

// --- NAVEGACIÓN ENTRE PANTALLAS (A PRUEBA DE CLICKS RÁPIDOS) ---
function cambiarPantalla(idMostrar) {
    document.querySelectorAll('.pantalla').forEach(p => {
        // 1. Si esta pantalla tiene un temporizador de ocultación pendiente, lo cancelamos de inmediato
        if (p.dataset.timeoutId) {
            clearTimeout(Number(p.dataset.timeoutId));
            p.dataset.timeoutId = "";
        }

        // 2. Ocultamos las pantallas que no corresponden
        if (p.id !== idMostrar) {
            p.classList.remove('active');
            
            // Guardamos la referencia del temporizador en el elemento para poder cancelarlo si es necesario
            const tId = setTimeout(() => {
                p.classList.add('hidden');
                p.dataset.timeoutId = "";
            }, 400); // 400ms es lo que tarda la animación CSS
            
            p.dataset.timeoutId = tId;
        }
    });
    
    // 3. Mostramos la pantalla objetivo
    const pantalla = document.getElementById(idMostrar);
    
    // Si la pantalla de destino tenía un temporizador para ocultarse, lo anulamos para que no se borre solo
    if (pantalla.dataset.timeoutId) {
        clearTimeout(Number(pantalla.dataset.timeoutId));
        pantalla.dataset.timeoutId = "";
    }
    
    pantalla.classList.remove('hidden');
    
    // Pequeño delay síncrono para asegurar que el navegador registre el flujo de la animación
    setTimeout(() => pantalla.classList.add('active'), 10);
}

// --- CONFIGURACIÓN DE JUGADORES ---
function completarPalabrasAlAzar() {
    if (diccionarioGlobal.length < 4) {
        alert("Aún cargando diccionario o hay muy pocas palabras.");
        return;
    }
    
    // Desordena una copia del diccionario y toma las primeras 4
    let mezclado = [...diccionarioGlobal].sort(() => 0.5 - Math.random());
    for(let i = 1; i <= 4; i++) {
        document.getElementById(`pal-${i}`).value = mezclado[i-1].palabra;
    }
}

function buscarDefinicion(palabraEscrita) {
    // Busca si la palabra escrita existe en el diccionario global para darle definición
    const encontrada = diccionarioGlobal.find(d => d.palabra.toLowerCase() === palabraEscrita.toLowerCase().trim());
    return encontrada ? encontrada.definicion : "Palabra agregada por jugador";
}

function agregarJugador() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const equipo = document.querySelector('input[name="equipo"]:checked').value;
    
    const p1 = document.getElementById('pal-1').value.trim();
    const p2 = document.getElementById('pal-2').value.trim();
    const p3 = document.getElementById('pal-3').value.trim();
    const p4 = document.getElementById('pal-4').value.trim();

    if (!nombre || !p1 || !p2 || !p3 || !p4) {
        alert("Por favor ingresa un nombre y las 4 palabras.");
        return;
    }

    const nuevoJugador = {
        nombre: nombre,
        palabras: [
            { palabra: p1, definicion: buscarDefinicion(p1) },
            { palabra: p2, definicion: buscarDefinicion(p2) },
            { palabra: p3, definicion: buscarDefinicion(p3) },
            { palabra: p4, definicion: buscarDefinicion(p4) }
        ]
    };

    if (equipo === 'A') {
        equipoA.push(nuevoJugador);
        const li = document.createElement('li');
        li.textContent = nombre;
        document.getElementById('lista-equipo-a').appendChild(li);
    } else {
        equipoB.push(nuevoJugador);
        const li = document.createElement('li');
        li.textContent = nombre;
        document.getElementById('lista-equipo-b').appendChild(li);
    }

    // Limpiar campos
    document.getElementById('input-nombre').value = '';
    for(let i=1; i<=4; i++) document.getElementById(`pal-${i}`).value = '';
    document.getElementById('input-nombre').focus();

    // Mostrar botón de inicio si hay al menos 1 en cada equipo
    if (equipoA.length > 0 && equipoB.length > 0) {
        document.getElementById('btn-empezar').classList.remove('hidden');
    }
}

// --- FLUJO DEL JUEGO ---
function iniciarJuegoCompleto() {
    olla = [];
    const todosLosJugadores = [...equipoA, ...equipoB];
    
    todosLosJugadores.forEach(jugador => {
        olla.push(...jugador.palabras);
    });
    
    ollaOriginal = [...olla]; 
    prepararSiguienteTurno();
    cambiarPantalla('pantalla-juego');
}

function prepararSiguienteTurno() {
    if (tocaEquipo === 'A') {
        jugadorActual = equipoA[indiceTurnoA];
        document.getElementById('turno-equipo').innerText = `Equipo A: Turno de ${jugadorActual.nombre}`;
        document.getElementById('turno-equipo').style.backgroundColor = 'var(--equipo-a)';
    } else {
        jugadorActual = equipoB[indiceTurnoB];
        document.getElementById('turno-equipo').innerText = `Equipo B: Turno de ${jugadorActual.nombre}`;
        document.getElementById('turno-equipo').style.backgroundColor = 'var(--equipo-b)';
    }
}

function iniciarTurno() {
    document.getElementById('btn-iniciar-turno').classList.add('hidden');
    document.getElementById('botones-accion').classList.remove('hidden');
    
    sacarPalabra();
    tiempoRestante = 60;
    actualizarReloj();
    
    intervalo = setInterval(() => {
        tiempoRestante--;
        actualizarReloj();
        if (tiempoRestante <= 0) finTurno();
    }, 1000);
}

function actualizarReloj() {
    const elReloj = document.getElementById('tiempo');
    elReloj.innerText = tiempoRestante;
    if (tiempoRestante <= 10) {
        elReloj.classList.add('urgente');
    } else {
        elReloj.classList.remove('urgente');
    }
}

function sacarPalabra() {
    if (olla.length === 0) return finRonda();
    const indice = Math.floor(Math.random() * olla.length);
    palabraActualObj = olla[indice];
    document.getElementById('palabra-actual').innerText = palabraActualObj.palabra;
    document.getElementById('definicion-actual').innerText = palabraActualObj.definicion;
}

function palabraAdivinada() {
    if (olla.length === 0) return; // PROTECCIÓN: Evita clicks accidentales si la olla ya se vació
    if (tocaEquipo === 'A') puntosEqA++;
    else puntosEqB++;

    olla = olla.filter(p => p.palabra !== palabraActualObj.palabra);
    sacarPalabra();
}

function pasarPalabra() {
    if (olla.length === 0) return; // PROTECCIÓN: Evita el click si el juego ya terminó
    sacarPalabra(); 
}

function finTurno() {
    clearInterval(intervalo);
    document.getElementById('tiempo').classList.remove('urgente');
    alert(`¡TIEMPO! Hasta aquí llega ${jugadorActual.nombre}`);
    
    // Lógica estricta de turnos
    if (tocaEquipo === 'A') {
        indiceTurnoA = (indiceTurnoA + 1) % equipoA.length; 
        tocaEquipo = 'B';
    } else {
        indiceTurnoB = (indiceTurnoB + 1) % equipoB.length;
        tocaEquipo = 'A';
    }

    // Reset UI Turno
    document.getElementById('palabra-actual').innerText = "¿Listos?";
    document.getElementById('definicion-actual').innerText = "Pasen el dispositivo al siguiente jugador";
    document.getElementById('btn-iniciar-turno').classList.remove('hidden');
    document.getElementById('botones-accion').classList.add('hidden');
    
    prepararSiguienteTurno();
}

function finRonda() {
    clearInterval(intervalo);
    document.getElementById('tiempo').classList.remove('urgente');
    
    document.getElementById('marcador-eq1').innerText = puntosEqA;
    document.getElementById('marcador-eq2').innerText = puntosEqB;
    
    cambiarPantalla('pantalla-fin');

    // --- LÓGICA DE BLOQUEO DE 5 SEGUNDOS ---
    const btnSiguiente = document.getElementById('btn-siguiente-ronda');
    btnSiguiente.disabled = true;          // Desactiva el botón por completo
    btnSiguiente.style.opacity = "0.5";     // Lo opaca visualmente
    btnSiguiente.style.cursor = "not-allowed";

    let tiempoBloqueo = 5;
    btnSiguiente.innerText = `Siguiente Ronda (${tiempoBloqueo}s) 🔄`;

    const intervaloBloqueo = setInterval(() => {
        tiempoBloqueo--;
        if (tiempoBloqueo > 0) {
            btnSiguiente.innerText = `Siguiente Ronda (${tiempoBloqueo}s) 🔄`;
        } else {
            // Cuando pasan los 5 segundos, el botón vuelve a la vida
            clearInterval(intervaloBloqueo);
            btnSiguiente.disabled = false;
            btnSiguiente.style.opacity = "1";
            btnSiguiente.style.cursor = "pointer";
            btnSiguiente.innerText = "Siguiente Ronda 🔄";
        }
    }, 1000);
}

function reiniciarRonda() {
    olla = [...ollaOriginal]; // Rellena la olla
    
    // Reset UI Juego
    document.getElementById('palabra-actual').innerText = "¿Listos?";
    document.getElementById('definicion-actual').innerText = "Nueva ronda, mismas reglas de turnos.";
    document.getElementById('btn-iniciar-turno').classList.remove('hidden');
    document.getElementById('botones-accion').classList.add('hidden');
    
    prepararSiguienteTurno();
    cambiarPantalla('pantalla-juego');
}
