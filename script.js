// --- 1. VARIABLES GLOBALES ---
let todasLasNoticias = [];

// --- 2. ESPERAR A QUE EL DOM ESTÉ LISTO ANTES DE EJECUTAR CUALQUIER LÓGICA ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Cargar JSON con RUTA RELATIVA (Obligatorio para GitHub Pages)
    fetch('./noticias.json')
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            return respuesta.json();
        })
        .then(datos => {
            todasLasNoticias = datos;
            mostrarNoticias(todasLasNoticias);
        })
        .catch(error => console.error('Error cargando las noticias de KEYAH NEWS:', error));

    // Inicializar menú hamburguesa y filtros
    inicializarMenu();
});

// --- 3. FUNCIÓN PRINCIPAL PARA PINTAR PORTADA (HERO Y GRID) ---
function mostrarNoticias(listaDeNoticias) {
    const contenedorHero = document.getElementById('hero-noticia');
    const contenedorGrid = document.getElementById('contenedor-noticias');
    const tituloSeccion = document.querySelector('.latest-section h2');
    
    // Mostramos de nuevo el título "Últimas Noticias"
    if (tituloSeccion) {
        tituloSeccion.style.display = 'block';
    }
    
    if (!contenedorGrid) return;

    // Limpiamos los contenedores anteriores
    if (contenedorHero) contenedorHero.innerHTML = '';
    contenedorGrid.innerHTML = '';

    if (listaDeNoticias.length === 0) {
        contenedorGrid.innerHTML = `<p class="no-news">Por el momento no hay noticias en esta sección.</p>`;
        return;
    }

    // --- MANEJO DINÁMICO DEL HERO ---
    if (contenedorHero) {
        const noticiaPrincipal = listaDeNoticias[0];
        contenedorHero.innerHTML = `
            <div class="hero-card" style="cursor: pointer;">
                <div class="hero-image-wrapper">
                    <img src="${noticiaPrincipal.imagen}" alt="${noticiaPrincipal.titulo}">
                </div>
                <div class="hero-content">
                    <span class="badge badge-hero">${noticiaPrincipal.categoria}</span>
                    <h1>${noticiaPrincipal.titulo}</h1>
                    <p>${noticiaPrincipal.resumen}</p>
                    <span class="hero-read-more">Leer artículo completo →</span>
                </div>
            </div>
        `;

        // Clic en el Hero para ver artículo completo
        const tarjetaHero = contenedorHero.querySelector('.hero-card');
        if (tarjetaHero) {
            tarjetaHero.addEventListener('click', () => {
                verArticuloCompleto(noticiaPrincipal.id);
            });
        }
    }

    // --- MANEJO DE LAS CASILLAS RESTANTES (.slice) ---
    const noticiasRestantes = contenedorHero ? listaDeNoticias.slice(1) : listaDeNoticias;

    noticiasRestantes.forEach(noticia => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'noticia-card';
        tarjeta.style.cursor = 'pointer';
        
        tarjeta.innerHTML = `
            <img src="${noticia.imagen}" alt="${noticia.titulo}">
            <span class="badge">${noticia.categoria}</span>
            <h3>${noticia.titulo}</h3>
            <p>${noticia.resumen}</p>
        `;

        // Clic en tarjeta secundaria
        tarjeta.addEventListener('click', () => {
            verArticuloCompleto(noticia.id);
        });

        contenedorGrid.appendChild(tarjeta);
    });
}

// --- 4. VISTA DE LECTURA DE ARTÍCULO COMPLETO (SPA) ---
function verArticuloCompleto(id) {
    const contenedorHero = document.getElementById('hero-noticia');
    const contenedorGrid = document.getElementById('contenedor-noticias');
    const tituloSeccion = document.querySelector('.latest-section h2');
    
    const noticia = todasLasNoticias.find(item => item.id === id);

    if (noticia && contenedorGrid) {
        // Ocultamos el Hero y el título "Últimas Noticias"
        if (contenedorHero) contenedorHero.innerHTML = '';
        if (tituloSeccion) tituloSeccion.style.display = 'none';

        // Generar bloques alternados de texto e imagen
        let bloquesHTML = '';
        if (noticia.contenido && Array.isArray(noticia.contenido)) {
            noticia.contenido.forEach(bloque => {
                if (bloque.tipo === 'texto') {
                    bloquesHTML += `<p>${bloque.valor}</p>`;
                } else if (bloque.tipo === 'imagen') {
                    bloquesHTML += `
                        <div class="bloque-imagen-container">
                            <img src="${bloque.valor}" alt="${noticia.titulo}" class="articulo-imagen-secundaria">
                            ${bloque.pie ? `<p class="pie-de-foto">${bloque.pie}</p>` : ''}
                        </div>
                    `;
                }
            });
        } else {
            bloquesHTML = `<p>${noticia.texto || ''}</p>`;
        }

        // Reemplazamos el Grid por la vista de lectura
        contenedorGrid.innerHTML = `
            <article class="articulo-completo">
                <button class="btn-volver" id="btn-regresar">← Volver a últimas noticias</button>
                <div class="articulo-header">
                    <span class="badge">${noticia.categoria}</span>
                    <h1>${noticia.titulo}</h1>
                    <div class="articulo-meta">
                        <span>Por <strong>${noticia.autor}</strong></span> | 
                        <span>${noticia.fecha}</span>
                    </div>
                </div>
                <img src="${noticia.imagen}" alt="${noticia.titulo}" class="articulo-imagen">
                <div class="articulo-cuerpo">
                    ${bloquesHTML}
                </div>
            </article>
        `;

        // Botón regresar
        const btnRegresar = document.getElementById('btn-regresar');
        if (btnRegresar) {
            btnRegresar.addEventListener('click', () => {
                mostrarNoticias(todasLasNoticias);
            });
        }

        // Scroll al inicio para leer la nota
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- 5. LÓGICA DE MENÚ Y FILTRADO (COMPATIBLE CON HEADER Y FOOTER) ---
function inicializarMenu() {
    // Seleccionar enlaces tanto del Header como del Footer
    const enlacesCategorias = document.querySelectorAll('.main-nav a, .footer-column a[href^="#"]');
    const menuBtn = document.getElementById('menu-btn');
    const mainNav = document.getElementById('main-navigation');

    enlacesCategorias.forEach(enlace => {
        enlace.addEventListener('click', (evento) => {
            const categoriaSeleccionada = enlace.textContent.trim();

            // Si es un enlace a categoría de noticias, prevenimos el salto abrupto de ancla
            if (['Inicio', 'Musica', 'Música', 'Arte', 'Conciertos', 'Obras'].includes(categoriaSeleccionada)) {
                evento.preventDefault();

                if (categoriaSeleccionada === 'Inicio') {
                    mostrarNoticias(todasLasNoticias);
                } else {
                    const noticiasFiltradas = todasLasNoticias.filter(noticia => 
                        noticia.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
                    );
                    mostrarNoticias(noticiasFiltradas);
                }

                // Cerrar menú móvil
                if (mainNav) mainNav.classList.remove('active');
                if (menuBtn) menuBtn.textContent = '☰';
                
                // Hacer scroll suave hacia la sección de noticias
                const seccionMain = document.querySelector('.main-content');
                if (seccionMain) {
                    seccionMain.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Menú Hamburguesa en Móviles
    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuBtn.textContent = mainNav.classList.contains('active') ? '✕' : '☰';
        });
    }
}