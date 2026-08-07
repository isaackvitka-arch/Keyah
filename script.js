// --- 1. VARIABLES GLOBALES ---

let todasLasNoticias = [];

// --- 2. CARGAR EL JSON AL INICIO DE LA APLICACIÓN ---

fetch('Noticias.json')
    .then(respuesta => respuesta.json())
    .then(datos => {
        todasLasNoticias = datos;
        mostrarNoticias(todasLasNoticias);
    })
    .catch(error => console.error('Error cargando las noticias de KEYAH NEWS:', error));

// --- 3. FUNCIÓN PRINCIPAL PARA PINTAR PORTADA (HERO Y GRID) ---

function mostrarNoticias(listaDeNoticias) {
    const contenedorHero = document.getElementById('hero-Noticia');
    const contenedorGrid = document.getElementById('contenedor-Noticias');
    
    // Nos aseguramos de volver a mostrar el título de últimas noticias si estaba oculto
    document.querySelector('.latest-section h2').style.display = 'block';
    
    // Limpiamos los contenedores anteriores
    contenedorHero.innerHTML = '';
    contenedorGrid.innerHTML = '';

    if (listaDeNoticias.length === 0) {
        contenedorGrid.innerHTML = `<p class="no-news">Por el momento no hay noticias en esta sección.</p>`;
        return;
    }

    // --- MANEJO DINÁMICO DEL HERO ---
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
    contenedorHero.querySelector('.hero-card').addEventListener('click', () => {
        verArticuloCompleto(noticiaPrincipal.id);
    });

    // --- MANEJO DE LAS CASILLAS RESTANTES (.slice) ---
    const noticiasRestantes = listaDeNoticias.slice(1);

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

    if (noticia) {
        // Limpiamos y ocultamos el Hero y el título de la sección secundaria
        contenedorHero.innerHTML = '';
        tituloSeccion.style.display = 'none';

        // Generar dinámicamente los bloques alternados de texto e imagen
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
            // Compatibilidad por si alguna noticia usa el formato antiguo de texto plano
            bloquesHTML = `<p>${noticia.texto || ''}</p>`;
        }

        // Reemplazamos las casillas del Grid por la estructura de lectura del artículo
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

        // Lógica para el botón regresar
        document.getElementById('btn-regresar').addEventListener('click', () => {
            mostrarNoticias(todasLasNoticias);
        });
    }
}

// --- 5. LÓGICA DE FILTRADO DE CATEGORÍAS (MENÚ) ---

const enlacesMenu = document.querySelectorAll('.main-nav a');

enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', (evento) => {
        evento.preventDefault(); 
        const categoriaSeleccionada = enlace.textContent;

        if (categoriaSeleccionada === 'Inicio') {
            mostrarNoticias(todasLasNoticias);
        } else {
            const noticiasFiltradas = todasLasNoticias.filter(noticia => 
                noticia.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
            );
            mostrarNoticias(noticiasFiltradas);
        }

        // Si está en celular, cerramos el menú hamburguesa automáticamente al dar clic
        document.getElementById('main-navigation').classList.remove('active');
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn.textContent === '✕') {
            menuBtn.textContent = '☰';
        }
    });
});

// --- 6. INTERACCIÓN DEL MENÚ HAMBURGUESA (MÓVILES) ---

const menuBtn = document.getElementById('menu-btn');
const mainNav = document.getElementById('main-navigation');

menuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    if (mainNav.classList.contains('active')) {
        menuBtn.textContent = '✕';
    } else {
        menuBtn.textContent = '☰';
    }
});