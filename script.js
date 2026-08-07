let todasLasNoticias = [];

fetch('noticias.json')
    .then(respuesta => respuesta.json())
    .then(datos => {
        todasLasNoticias = datos;
        mostrarNoticias(todasLasNoticias);
    })
    .catch(error => console.error('Error cargando las noticias:', error));

function mostrarNoticias(listaDeNoticias) {
    const contenedorHero = document.getElementById('hero-noticia');
    const contenedorGrid = document.getElementById('contenedor-noticias');
    
    document.querySelector('.latest-section h2').style.display = 'block';
    
    contenedorHero.innerHTML = '';
    contenedorGrid.innerHTML = '';

    if (listaDeNoticias.length === 0) {
        contenedorGrid.innerHTML = `<p class="no-news">Por el momento no hay noticias en esta sección.</p>`;
        return;
    }

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

    contenedorHero.querySelector('.hero-card').addEventListener('click', () => {
        verArticuloCompleto(noticiaPrincipal.id);
    });

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

        tarjeta.addEventListener('click', () => {
            verArticuloCompleto(noticia.id);
        });

        contenedorGrid.appendChild(tarjeta);
    });
}

function verArticuloCompleto(id) {
    const contenedorHero = document.getElementById('hero-noticia');
    const contenedorGrid = document.getElementById('contenedor-noticias');
    const tituloSeccion = document.querySelector('.latest-section h2');
    
    const noticia = todasLasNoticias.find(item => item.id === id);

    if (noticia) {
        contenedorHero.innerHTML = '';
        tituloSeccion.style.display = 'none';

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
        }

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

        document.getElementById('btn-regresar').addEventListener('click', () => {
            mostrarNoticias(todasLasNoticias);
        });
    }
}

const enlacesMenu = document.querySelectorAll('.main-nav a');

enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', (evento) => {
        evento.preventDefault(); 
        const categoriaSeleccionada = enlace.textContent.trim();

        if (categoriaSeleccionada.toLowerCase() === 'inicio') {
            mostrarNoticias(todasLasNoticias);
        } else {
            const noticiasFiltradas = todasLasNoticias.filter(noticia => 
                noticia.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()
            );
            mostrarNoticias(noticiasFiltradas);
        }

        document.getElementById('main-navigation').classList.remove('active');
    });
});

const menuBtn = document.getElementById('menu-btn');
const mainNav = document.getElementById('main-navigation');

menuBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
});