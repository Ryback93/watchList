// ====== firebase setup ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase,
         ref, 
         set, 
         get, 
         remove, 
         child } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

const firebaseConfig = {
   apiKey: "AIzaSyAm4yfpdT-xHBMjto-Yz8xDPXXhPBLNDIQ",
   authDomain: "watchlist-508ca.firebaseapp.com",
   databaseURL: "https://watchlist-508ca-default-rtdb.firebaseio.com/",
   projectId: "watchlist-508ca",
   storageBucket: "watchlist-508ca.firebasestorage.app",
   messagingSenderId: "331078386859",
   appId: "1:331078386859:web:6181d8eb5fa56ad93f23ee"
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app)

console.log(database)


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
    const userId = "defaultUser";
    const watchlistRef = ref(database, `watchlists/${userId}`);

    get(watchlistRef)
        .then(snapshot => {
            const data = snapshot.val();
            if (!data) {
                watchlistContainer.innerHTML = '<p style="color: white;">Your watchlist is empty.</p>';
                return;
            }

            const movieIDs = Object.keys(data);
            watchlistContainer.innerHTML = '';

            movieIDs.forEach(id => {
                fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
                    .then(res => res.json())
                    .then(details => {
                        const movieCard = document.createElement("div");
                        movieCard.className = "movie-card";
                        
                        const poster = document.createElement("img");
                        poster.src = details.Poster !== "N/A" ? details.Poster : "images/placeholder.png";
                        poster.alt = details.Title;
                        poster.className = "movie-poster";

                        const infoDiv = document.createElement("div");
                        infoDiv.className = "movie-info";

                        const title = document.createElement("h3");
                        title.textContent = `${details.Title} ⭐ ${details.imdbRating}`;

                        const meta = document.createElement("p");
                        meta.textContent = `${details.Runtime} | ${details.Genre}`;

                        const button = document.createElement("button");
                        button.textContent = "Remove";
                        button.className = "watchlist-button";
                        button.dataset.id = details.imdbID;
                        button.addEventListener("click", () => {
                            removeFromWatchlist(details.imdbID);
                            movieCard.remove();
                            if (watchlistContainer.children.length === 0) {
                                watchlistContainer.innerHTML = '<p style="color: white;">Your watchlist is empty.</p>';
                            }
                        });

                        const plot = document.createElement("p");
                        plot.textContent = details.Plot;
                        plot.style.marginTop = "10px";

                        infoDiv.append(title, meta, button, plot);
                        movieCard.append(poster, infoDiv);
                        watchlistContainer.appendChild(movieCard);
                    });
            });
        })
        .catch(error => {
            console.error("Firebase fetch error:", error);
        });
}



// ====== Local Storage Functions ======   
function addToWatchlist(imdbID) {
    const userId = "defaultUser"; // You can replace with actual user auth ID if needed
    const watchlistRef = ref(database, `watchlists/${userId}/${imdbID}`);

    set(watchlistRef, true)
        .then(() => {
            alert('Added to watchlist')
        })
        .catch(error => {
            console.error("Firebase add error:", error)
            alert('Failed to add to watchlist')
        });
}

function removeFromWatchlist(imdbID) {
    const userId = "defaultUser";
    const watchlistRef = ref(database, `watchlists/${userId}/${imdbID}`);

    remove(watchlistRef)
        .then(() => {
            console.log('Removed from watchlist')
        })
        .catch(error => {
            console.error("Firebase remove error:", error)
        });
}