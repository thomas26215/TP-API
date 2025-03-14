const apiKey = '2fa77c81a2d451f7470fd8d397c639d0'; // Utilisez la même clé API

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (movieId) {
        fetchMovieDetails(movieId);
    } else {
        document.getElementById('movie-details').textContent = 'Aucun film sélectionné';
    }
});

function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=fr-FR`;

    fetch(url)
        .then(response => response.json())
        .then(movie => {
            displayMovieDetails(movie);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des détails du film:', error);
            document.getElementById('movie-details').textContent = 'Erreur lors du chargement des détails du film.';
        });
}

function displayMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details');
    detailsContainer.innerHTML = `
        <h1>${movie.title}</h1>
        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
        <p>Date de sortie : ${movie.release_date}</p>
        <p>Note moyenne : ${movie.vote_average}/10</p>
        <p>Synopsis : ${movie.overview}</p>
    `;
}

