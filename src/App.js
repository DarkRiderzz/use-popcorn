import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

// ALL THE HOOKS ALLWAYS CALL IN THE SAME ORDER

/////////////////////////////////////
/// USE EFFECT CLEANUP FUNCTIONS/////
//0. to handle component unmounting in a functional component we can use useEffect() hook with cleanup function
//1. these are the function that we can return from an effect
//2.Runs on
//  1.befroe the effect executed again
//    in order to cleanup the previous side effect
//  2.after a component is unmount
//    in order to reset the side effect that we created, if it is necessary

//////////////////
//////useRef/////
//1.Object with mutable .current property that persisted across render.
//2. Two big use cases
//   1.creating a variable that stays same between renders.
//   2.Select and store DOM elemetn. **
//3. Do not read or write .current in render logic. (like state)
//4. Updating states cause the component to rerender while updating ref does not.
//5. States are immutable but refs are not
//6. In states the updates are asynchronous so we cannot use the new state immediately after updating it
//   while refs updates are not asynchronous so we can read a new current property immediately after updating it

/////////////////////
/////CUSTOM HOOKS///
//1.Rools of hooks are applied to the custom hooks
//2. Custom hooks name must start with use otherwise react treats as normal function
//3.It needs to use one or more hooks

const KEY = "5acdce6";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");

  const { movies, isLoding, error } = useMovies(query, handleCloseMovie); //Distructure the returning object
  const [watched, setWatched] = useLocalStorageState([], "watched");

  // useEffect(function () {
  //   console.log("A");
  // });
  // console.log("B");
  // // B will be executed first then A because effect is only run after the browser paint
  // // while render logic run during render

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id)); //this is to when we click on the same movie again it will close
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
    // to add in local storage
    // localStorage.setItem("watched", watched); // this will not work because these updating is happening is asynchronous way
    // localStorage.setItem("watched", JSON.stringify([...watched, watched]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <Numresult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {/* {isLoding ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoding && <Loader />}
          {!isLoding && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
          {/* as only one of these can true at a time */}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteMovie={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );

  // another way to avoid prop driling problen is passing elelment as props
  // eg. <Box element={<MovieList movies={movies} />}> and use as the same way as children
}

function Loader() {
  return <p className="loader">Loading..</p>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({}); //default is empty object
  const [isLoding, setIsLoding] = useState(false);
  const [userRating, setUserRating] = useState("");

  // Not implemented in project just to learn
  const countRef = useRef(0);
  //if we use  normal varaible {let count=0} it wil not work
  // because count will reset on each render to 0, as normal varaibe not persisted on render
  useEffect(
    function () {
      if (userRating) countRef.current++; //here is the mutation.
    },
    [userRating]
  );

  const isWatched = watched
    .map((watched) => watched.imdbID)
    .includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  //object distructuring
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // function to remove Movie Details on clicking escape
  useEffect(function () {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("closing movie");
      }
    }
    document.addEventListener("keydown", callback);

    // we need cleanup function there because each time the a new movie detail component mount
    // a new event listner is added to the document
    // so we need the clean the eventListner
    return function () {
      document.removeEventListener("keydown", callback);
    };
  });

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)), // runtime is as "138 min" we only want 138
      imdbRating: Number(imdbRating),
      userRating,
      countRatingDecision: countRef.current,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      async function getMoviesDetails() {
        setIsLoding(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoding(false);
      }
      getMoviesDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "UsePopcorn";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoding ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={() => handleAdd()}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedUserRating} <sapn>🌟</sapn>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null); //lec-9 sec-13

  //This effect run after the dom element is loaded
  useEffect(function () {
    function callback() {}
    document.addEventListener("keydown", callback);
    inputEl.current.focus();
  }, []);
  //By this function whenever we render the application we foucus on the searc bar

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl} //ref is added to this Dom element by doing this
    />
  );
}

function Numresult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length.toFixed(2)} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteMovie={onDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchMovie({ movie, onDeleteMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
