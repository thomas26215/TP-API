// model.js
const apiKey = '2fa77c81a2d451f7470fd8d397c639d0';

export class Model {
    // Récupérer les genres depuis l'API
    static async loadGenres() {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=fr-FR`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.genres || [];
        } catch (error) {
            console.error('Erreur lors du chargement des genres:', error);
            throw error;
        }
    }

    // Rechercher des films/séries
    static async searchMovies(query, filters = {}, page = 1) {
        let url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}&language=fr-FR&page=${page}`;

        if (filters.genre) url += `&with_genres=${filters.genre}`;
        if (filters.year) url += `&year=${filters.year}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            throw error;
        }
    }

    // Récupérer les films populaires
    static async fetchTrendingMovies(page = 1) {
        let url = `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}&language=fr-FR&page=${page}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors du chargement des films populaires:', error);
            throw error;
        }
    }

    // Récupérer les suggestions de recherche
    static async fetchSuggestions(query) {
        let url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${query}&language=fr-FR&page=1`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.results.slice(0, 5); // Limiter à 5 suggestions
        } catch (error) {
            console.error('Erreur lors de la récupération des suggestions:', error);
            throw error;
        }
    }

    // Gestion des favoris (localStorage)
    static getFavorites() {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    }

    static addFavorite(item) {
        let favorites = this.getFavorites();
        favorites.push({ id: item.id, title: item.title || item.name, media_type: item.media_type });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    static removeFavorite(item) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(f => f.id !== item.id || f.media_type !== item.media_type);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

