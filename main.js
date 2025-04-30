// ====== DOM Elements ======
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const watchlistContainer = document.getElementById('watchlist') 
const apiKey = "d0e200a7"

// ====== Search Page Logic ======
if (searchButton) {
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim()
        if (searchTerm) {
            fetchMovies(searchTerm)
        }
    })

}

function fetchMovies(searchTerm) {
    fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => { 
            if (data.Response === "True") {
                renderMovies(data.Search)
            } else {
                watchlistContainer.innerHTML = `<p style="color: white;">${data.Error}</p>`
            }
        })
        .catch(error => {
            console.error('Fetch error:', error)
            watchlistContainer.innerHTML = `<p style="color: red;">Failed to fetch movies </p>`
        })    
}

function renderMovies(movies) {
    watchlistContainer.innerHTML = ""

    const moviePromises = movies.map(movie => {
        return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
            .then(response => response.json())
    })

    Promise.all(moviePromises).then(movieDetailsArray => {
       movieDetailsArray.forEach(details => {
            const movieCard = document.createElement("div")
            movieCard.className = "movie-card"

            const poster = document.createElement("img")
            poster.src = details.Poster !== "N/A" ? details.Poster : "images/placeholder.png"
            poster.alt = details.Title
            poster.className = "movie-poster"

            const infoDiv = document.createElement("div")
            infoDiv.className = "movie-info"

            const title = document.createElement("h3")
            title.textContent = `${details.Title} ⭐ ${details.imdbRating}`

            const meta = document.createElement("p")
            meta.textContent = `${details.Runtime} | ${details.Genre}`

            const button = document.createElement("button")
            button.textContent = "+ Watchlist"
            button.className = "watchlist-button"
            button.dataset.id = details.imdbID
            button.addEventListener("click", () => {
                addToWatchlist(details.imdbID)
            })

            const plot = document.createElement("p")
            plot.textContent = details.Plot
            plot.style.marginTop = "10px"
            // plot.style.fontSize = "10px"

            infoDiv.append(title, meta, button, plot)
            movieCard.append(poster, infoDiv)
            watchlistContainer.appendChild(movieCard)
        })
    })
}


//====== Watchlist Page Logic ======
if (window.location.pathname.includes ("watchlist.html")) {
    displayWatchlist()
}

function displayWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || []

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = '<p style="color: white;">Your watchlist is empty.</p>'
        return
    }

    watchlistContainer.innerHTML = ''

    watchlist.forEach(id => {
        fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
            .then(res => res.json())
            .then(details => {
                const movieCard = document.createElement("div")
                movieCard.className = "movie-card"
                
                const poster = document.createElement("img")
                poster.src = details.Poster !== "N/A" ? details.Poster : "images/placeholder.png"
                poster.alt = details.Title
                poster.className = "movie-poster"

                const infoDiv = document.createElement("div")
                infoDiv.className = "movie-info"

                const title = document.createElement("h3")
                title.textContent = `${details.Title} ⭐ ${details.imdbRating}`

                const meta = document.createElement("p")
                meta.textContent = `${details.Runtime} | ${details.Genre}`

                const button = document.createElement("button")
                button.textContent = "Remove"
                button.className = "watchlist-button"
                button.dataset.id = details.imdbID
                button.addEventListener("click", () => {
                    removeFromWatchlist(details.imdbID)
                    movieCard.remove()
                    if (watchlistContainer.children.length === 0) {
                        watchlistContainer.innerHTML = '<p style="color: white;">Your watchlist is empty.</p>'
                    }
                })

                const plot = document.createElement("p")
                plot.textContent = details.Plot
                plot.style.marginTop = "10px"

                infoDiv.append(title, meta, button, plot)
                movieCard.append(poster, infoDiv)
                watchlistContainer.appendChild(movieCard)

            })    

    })
}


// ====== Local Storage Functions ======   
function addToWatchlist(imdbID) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []
    if (!watchlist.includes(imdbID)) {
        watchlist.push(imdbID)
        localStorage.setItem('watchlist', JSON.stringify(watchlist))
        alert('Added to watchlist')
    } else {
        alert('Already in watchlist')
    }
}

function removeFromWatchlist(imdbID) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []
    watchlist = watchlist.filter(id => id !== imdbID)
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
}