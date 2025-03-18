// model.js

export default class MovieModel {
    constructor() {
        this.apiKey = '2fa77c81a2d451f7470fd8d397c639d0';
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.genres = [];
        this.currentPage = 1;
        this.totalPages = 1;
    }

    async loadGenres() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${this.apiKey}&language=fr-FR`);
            const data = await response.json();
            this.genres = data.genres;
            return this.genres;
        } catch (error) {
            console.error('Erreur lors du chargement des genres:', error);
        }
    }

    async searchMovies(query, filters = {}, page = 1) {
        let url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${query}&language=fr-FR&page=${page}`;

        if (filters.genre) url += `&with_genres=${filters.genre}`;
        if (filters.year) url += `&year=${filters.year}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            this.currentPage = data.page;
            this.totalPages = data.total_pages;

            let filteredResults = data.results;
            if (filters.rating) {
                filteredResults = filteredResults.filter(movie => movie.vote_average >= parseFloat(filters.rating));
            }
            return filteredResults;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            throw error;
        }
    }

    toggleFavorite(movie) {
        const index = this.favorites.findIndex(fav => fav.id === movie.id);
        if (index !== -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push({ id: movie.id, title: movie.title });
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }

    isFavorite(movieId) {
        return this.favorites.some(fav => fav.id === movieId);
    }
}

