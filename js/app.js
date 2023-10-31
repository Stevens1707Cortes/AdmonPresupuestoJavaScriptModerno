// Variables y Selectores

const formularioGasto = document.querySelector('#agregar-gasto');
const listadoGastos = document.querySelector('#gastos ul');
const btnPDF = document.querySelector('#generar-pdf');





// Eventos

cargarEventListeners();
function cargarEventListeners() {
    
    // Cuando el documento cargue completamente
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    // Eventos formulario
    formularioGasto.addEventListener('submit', agregarGasto);

    //Generar Pdf
    btnPDF.addEventListener('click', crearPDF);
}


// Clases

// Presupuesto maneja la logica de los calculos entre gasto y presupuesto
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        // Con spread operator
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante(){
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidadGasto, 0 );

        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );
        this.calcularRestante();
    }
}

// UI o UserInterface maneja el HTML
class UI {
    presupuestoHTML(cantidad){

        const {presupuesto, restante} = cantidad;
        
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){

        this.limpiarAlerta();

        // crear HTML
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success')
        }

        //Mensaje de error
        divMensaje.textContent = mensaje;

        //Insertar HTML
        document.querySelector('.primario').insertBefore(divMensaje, formularioGasto);

        // Quitarlo
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastoLista(gastosLista){
        
        this.limpiarHTML();

        //Iterar sobre los gastos
        gastosLista.forEach(gasto => {

            const {nombreGasto, cantidadGasto, id} = gasto;

            // Crear LI
            const nuevoGasto = document.createElement('li');
                // className cuando se necesiten agregar muchas clases
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
                // dataSet.id = para agregar data-id
            nuevoGasto.dataset.id = id;

            // Agregar el HTML de gasto

            nuevoGasto.textContent = `${nombreGasto}`;
            const cantidadHTML = document.createElement('span');
            cantidadHTML.textContent = `${cantidadGasto}`;
            cantidadHTML.className = 'badge badge-primary badge-pill';

            // Boton borrar gasto
            const btnBorrarGasto = document.createElement('button');
            btnBorrarGasto.classList.add('btn','btn-danger','borrar-gasto');
            btnBorrarGasto.textContent = 'Borrar x';
            btnBorrarGasto.onclick = () => {
                eliminarGasto(id);
            }

            // Insertar HTML
            nuevoGasto.appendChild(cantidadHTML);
            nuevoGasto.appendChild(btnBorrarGasto);
            listadoGastos.appendChild(nuevoGasto);
        })

    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        
        // Comprobar el 25%
        if ((presupuesto * 0.25) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');

        }else if ((presupuesto * 0.5) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        }else{
            restanteDiv.classList.remove('alert-warning', 'alert-danger');
            restanteDiv.classList.add('alert-success');
        }


        if (restante <= 0) {
            ui.imprimirAlerta('Se ha excedido el presupuesto', 'error');
            formularioGasto.querySelector('button[type="submit"]').disabled = true;
        }else{
            formularioGasto.querySelector('button[type="submit"]').disabled = false;
        }
    }

    limpiarAlerta(){
        const alertaMensaje = document.querySelector('.primario .alert');
        if (alertaMensaje) {
            alertaMensaje.remove();
        }
    }

    limpiarHTML(){
        while (listadoGastos.firstChild) {
            listadoGastos.firstChild.remove();
        }
    }
}


// Instanciar
const ui = new UI();
let presupuesto;


// Funciones

function preguntarPresupuesto(e) {
    const presupuestoUsuario = prompt('Ingresa un presupuesto');

    // Validar presupuesto

    /* null es cuando se le presiona 'Cancelar' al prompt
    NaN = Not is a Number
    isNaN verifica si al transformar una variable a numero da NaN retorna true
    presupuestoUsuario <= 0 - Para que no acepte numeros negativos */

    if (presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) { 
        window.location.reload(); // Esto recargar la ventana actual
        return;
    }
    // Presupuesto valido

    //Instanciamos desde aqui, para recibir el presupuesto, y luego reasigne el valor a nuetra variable global
    presupuesto = new Presupuesto(presupuestoUsuario);

    //Agregar al HTML
    ui.presupuestoHTML(presupuesto);
}

function agregarGasto(e) {
    e.preventDefault();

    // Leer los datos del formulario
    const nombreGasto = document.querySelector('#gasto').value;
    const cantidadGasto = Number(document.querySelector('#cantidad').value);

    // Validacion
    if (nombreGasto === '' || cantidadGasto === ''  ) {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        
        return;
    }else if (isNaN(cantidadGasto) || cantidadGasto <= 0) {
        ui.imprimirAlerta('Cantidad invalida', 'error');

        return;
    }

    // Generar un objeto con el gasto

    // El contrario al Destructuring
    const gasto = {nombreGasto, cantidadGasto, id: Date.now() }; // Object liertal enchantment - Agrega propiedades a una variable
    
    // Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    // Imprime la alerta en HTML
    ui.imprimirAlerta('Gasto agregado', 'correcto');

    // Imprime los gastos
    const {gastos, restante} = presupuesto;

    ui.mostrarGastoLista(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
    

    // Resetear formulario
    formularioGasto.reset();

}

function eliminarGasto(id) {
    // Eliminar gasto del objeto
    presupuesto.eliminarGasto(id);

    // Eliminar del HTML
    const {gastos, restante} = presupuesto;
    ui.mostrarGastoLista(gastos);

    //Reembolsar gasto
    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}

function crearPDF() {
    const mes = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const {gastos, restante} = presupuesto;
    const pdfLista = new jsPDF();

    // Establece el color de relleno y dibuja un rectángulo para simular el fondo
    pdfLista.setFillColor(224, 224, 224); 
    pdfLista.rect(10, 10, 190, 200, 'F');

    // Titulo
    pdfLista.setFontSize(20);
    pdfLista.setTextColor(90,169,169);
    pdfLista.text(20, 30, `Lista de gastos: Mes ${mes}, Año ${year}`);

    let lugarLista = 50;

    // Texto en PDF de cada gasto
    gastos.forEach((gasto, index) => {

        const {nombreGasto, cantidadGasto} = gasto;
        const contenido = `${index + 1}. ${nombreGasto}. Gasto: $ ${cantidadGasto} pesos`;
        pdfLista.setFontSize(12);
        pdfLista.setTextColor(0,0,0);
        pdfLista.text(20, lugarLista, contenido);
        lugarLista += 10;
    })

    let presupuestoLugar = lugarLista + 10;
    let restanteLugar = presupuestoLugar + 10;

    // Texto del presupuesto y el restante
    pdfLista.setFontSize(20);
    pdfLista.setTextColor(90,169,169);
    pdfLista.text(20, presupuestoLugar, `Presupuesto: $ ${presupuesto.presupuesto} pesos`);
    pdfLista.setFontSize(20);
    pdfLista.setTextColor(242,82,114);
    pdfLista.text(20, restanteLugar, `Restante: $ ${restante} pesos`);

    // Guardar / Descargar PDF

    pdfLista.save('ListaDeGastos.pdf');

}