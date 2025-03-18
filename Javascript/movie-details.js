const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const mediaType = urlParams.get('media_type') || 'movie';

    if (movieId) {
        fetchDetails(movieId, mediaType);
    } else {
        document.getElementById('movie-details').textContent = 'Aucun film ou série sélectionné';
    }
});

function fetchDetails(id, mediaType) {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${apiKey}&language=fr-FR`;

    fetch(url)
        .then(response => response.json())
        .then(item => {
            displayDetails(item, mediaType);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des détails:', error);
            document.getElementById('movie-details').textContent = 'Erreur lors du chargement des détails.';
        });
}

function displayDetails(item, mediaType) {
    const detailsContainer = document.getElementById('movie-details');
    const title = mediaType === 'movie' ? item.title : item.name;
    const releaseDate = mediaType === 'movie' ? item.release_date : item.first_air_date;

    detailsContainer.innerHTML = `
        <div class="info">
            <h1>${title}</h1>
            <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${title}">
            <div class="detail-item"><i class="fas fa-calendar"></i> <bold>Date de sortie : ${releaseDate}</div>
            <div class="detail-item"><i class="fas fa-star"></i> Note moyenne : ${item.vote_average}/10</div>
            <div class="detail-item"><i class="fas fa-film"></i> Genre : ${item.genres ? item.genres.map(genre => genre.name).join(', ') : ''}</div>
            ${mediaType === 'tv' ? `<div class="detail-item"><i class="fas fa-tv"></i> Nombre de saisons : ${item.number_of_seasons}</div>` : ''}
            <div class="detail-item"><i class="fas fa-align-left"></i> Synopsis : ${item.overview}</div>
        </div>
    `;
}

