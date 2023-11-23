const imageURL = "https://image.tmdb.org/t/p/original";
const API_KEY = "f531333d637d0c44abc85b3e74db2186";
const API_URL = `https://api.themoviedb.org/3/movie/top_rated?`;
const SEARCH_API_URL = "https://api.themoviedb.org/3/search/movie";
const LS_KEY = "favoriteMovies";
let movies = [];

let sortByDateFlag = 1;
let sortByRatingFlag = 1;
let currentPage = 1;

async function fetchMovies(page = 1) {
  try {
    let response = await fetch(
      `${API_URL}api_key=${API_KEY}&language=en-US&page=${page}`
    );
    response = await response.json();
    movies = response.results;
    renderMovies(response.results);
  } catch (error) {
    console.log(error);
  }
}
fetchMovies();

function renderMovies(movies) {
  console.log("render");
  const moviesList = document.getElementById("movies-list");
  moviesList.innerHTML = "";
  movies.forEach((movie) => {
    let { poster_path, title, vote_average, vote_count } = movie;
    vote_average = Math.round(vote_average * 10) / 10;
    const listItem = document.createElement("li");
    listItem.className = "card";
    let imageSource = poster_path
      ? `${imageURL}/${poster_path}`
      : `https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`;

    let imageTag = `<img class="poster" src = "${imageSource}" alt="${title}" />`;
    listItem.innerHTML += imageTag;
    const titleTag = `<p class="title">${title}</p>`;
    listItem.innerHTML += titleTag;
    let sectionTag = `<section class="vote-favoriteIcon">
      <section class="vote">
          <p class="vote-count">Votes: ${vote_count}</p>
          <p class="vote-rating">Rating: ${vote_average}</p>
      </section>
      <i class="fa-regular fa-heart favorite-icon" id="${title}"></i>
      </section>
      `;

    listItem.innerHTML += sectionTag;

    const favoriteIcon = listItem.querySelector(".favorite-icon");
    favoriteIcon.addEventListener("click", (event) => {
      const { id } = event.target;
      if (favoriteIcon.classList.contains("fa-solid")) {
        removeMovieNameFromLocalStorage(id);
        favoriteIcon.classList.remove("fa-solid");
      } else {
        addMovieNameToLocalStorage(id);
        favoriteIcon.classList.add("fa-solid");
      }

      // favoriteIcon.classList.toggle("fa-solid");
    });

    moviesList.appendChild(listItem);
  });
}

const sortByDateFunction = document.getElementById("sort-by-date");
function sortByDate() {
  let sortedMovies;
  if (sortByDateFlag === 1) {
    sortedMovies = movies.sort((movie1, movie2) => {
      return new Date(movie1.release_date) - new Date(movie2.release_date);
    });
    sortByDateFunction.innerText = "Sort by date (latest to oldest)";
    sortByDateFlag = -1;
  } else {
    sortedMovies = movies.sort((movie1, movie2) => {
      return new Date(movie2.release_date) - new Date(movie1.release_date);
    });
    sortByDateFunction.innerText = "Sort by date (oldest to latest)";
    sortByDateFlag = 1;
  }
  renderMovies(sortedMovies);
}
sortByDateFunction.addEventListener("click", sortByDate);

const sortByRatingFunction = document.getElementById("sort-by-rating");
function sortByRating() {
  let sortedMovies;
  if (sortByRatingFlag === 1) {
    console.log("hello");
    sortedMovies = movies.sort((movie1, movie2) => {
      return movie1.vote_average - movie2.vote_average;
    });
    sortByRatingFunction.innerText = "Sort by rating (most to least)";
    sortByRatingFlag = -1;
  } else {
    sortedMovies = movies.sort((movie1, movie2) => {
      return movie2.vote_average - movie1.vote_average;
    });
    sortByRatingFunction.innerText = "Sort by rating (least to most)";
    sortByRatingFlag = 1;
  }
  renderMovies(sortedMovies);
}
sortByRatingFunction.addEventListener("click", sortByRating);

const prevButton = document.getElementById("prev-btn");
const pageNumberButton = document.getElementById("curr-btn");
const nextButton = document.getElementById("next-btn");
prevButton.disabled = true;

prevButton.addEventListener("click", () => {
  nextButton.disabled = false;
  currentPage--;

  fetchMovies(currentPage);
  pageNumberButton.innerText = `Current Page : ${currentPage}`;
  if (currentPage === 1) {
    prevButton.disabled = true;
  }
});

nextButton.addEventListener("click", () => {
  prevButton.disabled = false;
  currentPage++;
  fetchMovies(currentPage);
  pageNumberButton.innerText = `Current Page : ${currentPage}`;
  if (currentPage === 447) {
    nextButton.disabled = true;
  }
});

const searchMovies = async (searchMovie) => {
  try {
    const response = await fetch(
      `${SEARCH_API_URL}?query=${searchMovie}&api_key=${API_KEY}&language=en-US&page=1`
    );
    const result = await response.json();
    movies = result.results;
    renderMovies(movies);
  } catch (error) {
    console.log(error);
  }
};

const searchButton = document.getElementById("search_button");
const searchInput = document.getElementById("search_input");

searchButton.addEventListener("click", () => {
  searchMovies(searchInput.value);
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchMovies(searchInput.value);
  }
});

function getMovieNameFromLocalStorage() {
  const favoriteMovies = JSON.parse(localStorage.getItem(LS_KEY));
  return favoriteMovies === null ? [] : favoriteMovies;
  // return favoriteMovies || []
}

function addMovieNameToLocalStorage(movieName) {
  const favoriteMovies = getMovieNameFromLocalStorage();
  const newFavoriteMovies = [...favoriteMovies, movieName];
  localStorage.setItem(LS_KEY, JSON.stringify(newFavoriteMovies));
}

function removeMovieNameFromLocalStorage(movieName) {
  const allMovies = getMovieNameFromLocalStorage();
  const newFavoriteMovies = allMovies.filter((movie) => movie !== movieName);
  localStorage.setItem(LS_KEY, JSON.stringify(newFavoriteMovies));
}

const allTab = document.getElementById("all-tabs");
const favoritesTab = document.getElementById("favorite-tabs");

function switchTab(event) {
  allTab.classList.remove("active-tab");
  favoritesTab.classList.remove("active-tab");
  event.target.classList.add("active-tab");
  displayMovies();
}

allTab.addEventListener("click", switchTab);
favoritesTab.addEventListener("click", switchTab);

async function getMovieName(movieName) {
  try {
    const response = await fetch(
      `${SEARCH_API_URL}?query=${movieName}&api_key=${API_KEY}&language=en-US&page=1`
    );
    const result = await response.json();
    return result.results[0];
  } catch (error) {
    console.log(error);
  }
}

function showFavorites(movie) {
  const moviesList = document.getElementById("movies-list");
  let { poster_path, title, vote_average, vote_count } = movie;
  vote_average = Math.round(vote_average * 10) / 10;
  const listItem = document.createElement("li");
  listItem.className = "card";
  let imageSource = poster_path
    ? `${imageURL}/${poster_path}`
    : `https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg`;

  let imageTag = `<img class="poster" src = "${imageSource}" alt="${title}" />`;
  listItem.innerHTML += imageTag;
  const titleTag = `<p class="title">${title}</p>`;
  listItem.innerHTML += titleTag;
  let sectionTag = `<section class="vote-favoriteIcon">
      <section class="vote">
          <p class="vote-count">Votes: ${vote_count}</p>
          <p class="vote-rating">Rating: ${vote_average}</p>
      </section>
      <i class="fa-solid fa-xmark xmark" id="${title}"></i>
      </section>
      `;

  listItem.innerHTML += sectionTag;
  const removeWishListButton = listItem.querySelector(".xmark");
  removeWishListButton.addEventListener("click", (event) => {
    const { id } = event.target;
    removeMovieNameFromLocalStorage(id);
    fetchWishListMovie();

    // favoriteIcon.classList.toggle("fa-solid");
  });

  moviesList.appendChild(listItem);
}

async function fetchWishListMovie() {
  const moviesList = document.getElementById("movies-list");
  moviesList.innerHTML = "";
  const moivesNamesList = getMovieNameFromLocalStorage();
  moivesNamesList.forEach(async (movie) => {
    const movieData = await getMovieName(movie);
    showFavorites(movieData);
  });
}

function displayMovies() {
  const sortOpts = document.getElementsByClassName("sort_buttons")[0];
  const pagination = document.getElementsByClassName("pagination")[0];
  if (allTab.classList.contains("active-tab")) {
    renderMovies(movies);
    pagination.style.opacity = "revert";
    sortOpts.style.opacity = "revert";
  } else if (favoritesTab.classList.contains("active-tab")) {
    fetchWishListMovie();
    pagination.style.opacity = "0";
    sortOpts.style.opacity = "0";
  }
}
