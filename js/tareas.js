(function () {
  'use strict';

  var CLAVE = 'agenda-verde-tareas';
  var form = document.getElementById('form-tarea');
  var lista = document.getElementById('lista');
  var contador = document.getElementById('contador');
  var mensaje = document.getElementById('mensaje');
  var campos = {
    titulo: document.getElementById('titulo'),
    prioridad: document.getElementById('prioridad'),
    fecha: document.getElementById('fecha')
  };
  var tareas = cargar();

  // La fecha límite no puede ser anterior a hoy
  var hoy = new Date();
  var hoyTexto = hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');
  campos.fecha.min = hoyTexto;

  function cargar() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch (e) {
      return [];
    }
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(tareas));
    } catch (e) { /* si no hay almacenamiento, la lista sigue en memoria */ }
  }

  // Muestra u oculta el error de un campo
  function marcar(nombre, texto) {
    var campo = campos[nombre];
    document.getElementById('error-' + nombre).textContent = texto;
    campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    return !texto;
  }

  // Validación de datos del formulario
  function validar() {
    var titulo = campos.titulo.value.trim();
    var ok = true;
    ok = marcar('titulo', titulo.length < 3 ? 'Escribe al menos 3 caracteres.' :
      titulo.length > 60 ? 'El nombre no puede pasar de 60 caracteres.' : '') && ok;
    ok = marcar('prioridad', campos.prioridad.value === '' ? 'Selecciona una prioridad.' : '') && ok;
    ok = marcar('fecha', campos.fecha.value === '' ? 'Elige una fecha límite.' :
      campos.fecha.value < hoyTexto ? 'La fecha no puede ser anterior a hoy.' : '') && ok;
    return ok;
  }

  // Dibuja la lista modificando el DOM
  function mostrar() {
    lista.textContent = '';
    tareas.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'tarea ' + t.prioridad + (t.hecha ? ' hecha' : '');

      var texto = document.createElement('span');
      texto.className = 'texto';
      texto.textContent = t.titulo + ' – Prioridad ' + t.prioridad + ' – Vence ' + t.fecha;

      var acciones = document.createElement('div');
      acciones.className = 'acciones';

      var bHecha = document.createElement('button');
      bHecha.type = 'button';
      bHecha.className = 'boton secundario';
      bHecha.textContent = t.hecha ? 'Reabrir' : 'Completar';
      bHecha.setAttribute('aria-label', (t.hecha ? 'Reabrir: ' : 'Completar: ') + t.titulo);
      bHecha.addEventListener('click', function () {
        t.hecha = !t.hecha;
        guardar();
        mostrar();
      });

      var bBorrar = document.createElement('button');
      bBorrar.type = 'button';
      bBorrar.className = 'boton';
      bBorrar.textContent = 'Eliminar';
      bBorrar.setAttribute('aria-label', 'Eliminar: ' + t.titulo);
      bBorrar.addEventListener('click', function () {
        tareas = tareas.filter(function (x) { return x.id !== t.id; });
        guardar();
        mostrar();
        mensaje.textContent = 'Tarea eliminada.';
      });

      acciones.appendChild(bHecha);
      acciones.appendChild(bBorrar);
      li.appendChild(texto);
      li.appendChild(acciones);
      lista.appendChild(li);
    });

    var pendientes = tareas.filter(function (t) { return !t.hecha; }).length;
    contador.textContent = tareas.length === 0
      ? 'Aún no tienes tareas. Agrega la primera con el formulario.'
      : 'Pendientes: ' + pendientes + ' de ' + tareas.length;
  }

  // Evento: enviar el formulario
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    mensaje.textContent = '';
    if (!validar()) {
      // Lleva el foco al primer campo con error
      var primero = form.querySelector('[aria-invalid="true"]');
      if (primero) { primero.focus(); }
      return;
    }
    tareas.push({
      id: Date.now(),
      titulo: campos.titulo.value.trim(),
      prioridad: campos.prioridad.value,
      fecha: campos.fecha.value,
      hecha: false
    });
    guardar();
    mostrar();
    form.reset();
    mensaje.textContent = 'Tarea agregada correctamente.';
    campos.titulo.focus();
  });

  // Evento: validar al salir de cada campo
  ['titulo', 'prioridad', 'fecha'].forEach(function (n) {
    campos[n].addEventListener('blur', validar);
  });

  mostrar();
})();
