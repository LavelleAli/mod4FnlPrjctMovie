const API_KEY = "e8773e4";

const movieListEl = document.querySelector(".movies");


const filterTypeEl = document.querySelector("#filterType");
const searchTermEl = document.querySelector("#movieSearchTerm");
const searchYearEl = document.querySelector("#movieSearchYear");


function escapeHTML(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function movieCard(movie) {
  const poster =
    movie.Poster && movie.Poster !== "N/A"
      ? movie.Poster
      : "https://via.placeholder.com/300x450?text=No+Poster";

  return `
    <div class="movie__card" onclick="showMovie('${movie.imdbID}')">
      <div class="movie__card--container">
        <p class="movie__card--poster"><img src="${poster}" alt="${escapeHTML(movie.Title)} poster"></p>
        <p><b>${escapeHTML(movie.Title)}</b></p>
        <p><b>${escapeHTML(String(movie.Year || ""))}</b></p>
        <p style="opacity: .85;">${escapeHTML(movie.imdbID)}</p>
      </div>
    </div>
  `;
}

function renderMessage(msg) {
  movieListEl.innerHTML = `<p class="colored__words--white">${escapeHTML(msg)}</p>`;
}

function renderFromOmdbResponse(data) {

  if (Array.isArray(data.Search)) {
    movieListEl.innerHTML = data.Search.map(movieCard).join("");
    return;
  }

  if (data && data.imdbID) {
    movieListEl.innerHTML = movieCard(data);
    return;
  }

  
  if (data && data.Error) {
    renderMessage(data.Error);
    return;
  }

  renderMessage("No results found.");
}


function showMovie(imdbID) {
  localStorage.setItem("movieTag", imdbID);
  // window.location.href = `${window.location.origin}/movie.html`
}


async function fetchOmdb(url) {
  const res = await fetch(url);
  return await res.json();
}


async function loadFeatured() {
  const data = await fetchOmdb(`https://www.omdbapi.com/?apikey=${API_KEY}&s=Avengers`);
  renderFromOmdbResponse(data);
}
loadFeatured();


let debounceTimer = null;

function updateYearInputVisibility() {
  const mode = filterTypeEl.value;
  if (mode === "year") {
    searchYearEl.style.display = "inline-block";
    searchTermEl.placeholder = "Title keyword (required for year search)";
  } else {
    searchYearEl.style.display = "none";
    searchYearEl.value = "";
    searchTermEl.placeholder = "Type a title, year, or imdbID";
  }
}

async function runFilteredSearch() {
  const mode = filterTypeEl.value;
  const term = searchTermEl.value.trim();
  const year = searchYearEl.value.trim();

  
  if (!term) {
    await loadFeatured();
    return;
  }

  try {
    if (mode === "title") {
      const data = await fetchOmdb(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(term)}`
      );
      renderFromOmdbResponse(data);
      return;
    }

    if (mode === "year") {
      
      if (!year) {
        renderMessage("Type a year to filter, for example 2019.");
        return;
      }

      const data = await fetchOmdb(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(
          term
        )}&y=${encodeURIComponent(year)}`
      );
      renderFromOmdbResponse(data);
      return;
    }

    if (mode === "imdbID") {
      const data = await fetchOmdb(
        `https://www.omdbapi.com/?apikey=${API_KEY}&i=${encodeURIComponent(term)}`
      );
      renderFromOmdbResponse(data);
      return;
    }

    renderMessage("Unknown filter selected.");
  } catch (err) {
    renderMessage("Something went wrong fetching the movies.");
    console.error(err);
  }
}


filterTypeEl.addEventListener("change", () => {
  updateYearInputVisibility();
  runFilteredSearch();
});

searchTermEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runFilteredSearch, 350);
});

searchYearEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runFilteredSearch, 350);
});


updateYearInputVisibility();