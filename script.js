// 1. DICCIONARIO BASE (Agrega todas las que quieras aquí)
const diccionarioCompleto = [
    { palabra: "Rectángulo", definicion: "Polígono de 4 lados paralelos" },
    { palabra: "Gato", definicion: "Mamífero felino doméstico" },
    { palabra: "Guitarra", definicion: "Instrumento musical de cuerdas" },
    { palabra: "Sol", definicion: "Estrella luminosa centro de nuestro sistema" },
    { palabra: "Helado", definicion: "Postre congelado hecho de leche o agua" },
    { palabra: "Bicicleta", definicion: "Vehículo de dos ruedas movido por pedales" },
    { palabra: "Teléfono", definicion: "Dispositivo para comunicarse a distancia" },
    { palabra: "Zapatos", definicion: "Prenda de vestir para los pies" },
    { palabra: "Montaña", definicion: "Gran elevación natural de terreno" },
    { palabra: "Libro", definicion: "Conjunto de hojas de papel impresas y encuadernadas" }
];

// Variables del juego
let olla = [];
let ollaOriginal = []; // Para reiniciar la ronda
let palabraActualObj = null;
let equipoActual = 1;
let puntosEq1 = 0;
let puntosEq2 = 0;
let tiempoRestante = 60;
let intervalo = null;

// Referencias a elementos del HTML (DOM)
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaFin = document.getElementById('pantalla-fin');

function cambiarPantalla(pantallaMostrar) {
    pantallaInicio.classList.add('hidden');
    pantallaJuego.classList.add('hidden');
    pantallaFin.classList.add('hidden');
    pantallaMostrar.classList.remove('hidden');
}

function prepararOlla() {
    const kPalabras = parseInt(document.getElementById('cantidad-palabras').value);
    // Para el ejemplo, multiplicamos por 4 jugadores imaginarios.
    const totalPalabrasNecesarias = kPalabras * 4; 
    
    // Desordenar el diccionario y tomar las necesarias
    let diccionarioMezclado = [...diccionarioCompleto].sort(() => 0.5 - Math.random());
    olla = diccionarioMezclado.slice(0, totalPalabrasNecesarias);
    ollaOriginal = [...olla]; // Guardamos copia para la Ronda 2

    // Actualizar UI
    document.getElementById('turno-equipo').innerText = `Turno del ${document.getElementById('nombre-eq1').value}`;
    cambiarPantalla(pantallaJuego);
}

function iniciarTurno() {
    document.getElementById('btn-iniciar-turno').classList.add('hidden');
    document.getElementById('btn-correcto').classList.remove('hidden');
    document.getElementById('btn-pasar').classList.remove('hidden');
    
    sacarPalabra();
    tiempoRestante = 60;
    document.getElementById('tiempo').innerText = tiempoRestante;
    
    intervalo = setInterval(() => {
        tiempoRestante--;
        document.getElementById('tiempo').innerText = tiempoRestante;
        if (tiempoRestante <= 0) {
            finTurno();
        }
    }, 1000);
}

function sacarPalabra() {
    if (olla.length === 0) {
        finRonda();
        return;
    }
    // Seleccionar una palabra al azar de la olla
    const indice = Math.floor(Math.random() * olla.length);
    palabraActualObj = olla[indice];
    document.getElementById('palabra-actual').innerText = palabraActualObj.palabra;
    document.getElementById('definicion-actual').innerText = `(${palabraActualObj.definicion})`;
}

function palabraAdivinada() {
    // Sumar punto
    if (equipoActual === 1) puntosEq1++;
    else puntosEq2++;

    // Quitar palabra de la olla
    olla = olla.filter(p => p.palabra !== palabraActualObj.palabra);
    sacarPalabra(); // Siguiente palabra
}

function pasarPalabra() {
    // Simplemente saca otra palabra sin quitar la actual de la olla
    sacarPalabra();
}

function finTurno() {
    clearInterval(intervalo);
    alert("¡TIEMPO AGOTADO!");
    
    // Cambiar de equipo
    equipoActual = equipoActual === 1 ? 2 : 1;
    const nombreEquipo = document.getElementById(`nombre-eq${equipoActual}`).value;
    document.getElementById('turno-equipo').innerText = `Turno del ${nombreEquipo}`;
    
    // Resetear UI
    document.getElementById('palabra-actual').innerText = "¿Listos?";
    document.getElementById('definicion-actual').innerText = "Pasale el teléfono al otro equipo";
    document.getElementById('btn-iniciar-turno').classList.remove('hidden');
    document.getElementById('btn-correcto').classList.add('hidden');
    document.getElementById('btn-pasar').classList.add('hidden');
}

function finRonda() {
    clearInterval(intervalo);
    const nombreEq1 = document.getElementById('nombre-eq1').value;
    const nombreEq2 = document.getElementById('nombre-eq2').value;
    
    document.getElementById('marcador-eq1').innerText = `${nombreEq1}: ${puntosEq1}`;
    document.getElementById('marcador-eq2').innerText = `${nombreEq2}: ${puntosEq2}`;
    
    cambiarPantalla(pantallaFin);
}

function reiniciarRonda() {
    // Vuelve a llenar la olla con las mismas palabras
    olla = [...ollaOriginal];
    
    // Resetear UI del juego
    document.getElementById('palabra-actual').innerText = "¿Listos?";
    document.getElementById('definicion-actual').innerText = "";
    document.getElementById('btn-iniciar-turno').classList.remove('hidden');
    document.getElementById('btn-correcto').classList.add('hidden');
    document.getElementById('btn-pasar').classList.add('hidden');
    
    cambiarPantalla(pantallaJuego);
}