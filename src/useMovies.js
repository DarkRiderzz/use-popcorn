import { useEffect, useState } from "react";

const KEY = "5acdce6";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [isLoding, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      callback?.(); //Optional chaining in funcion we only call funtion if it exist

      const controller = new AbortController(); // to avoid the rave condition while searching the movie le-17
      //It is a browser api
      // we connect the AbortController to the fetch() by passing another argument in it

      async function fecthMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal } //here we connect the fetch function with the AbortController()
          );
          if (!res.ok) throw new Error("Somthing went Wrong");
          const data = await res.json();

          // if the movie seach not found then then object is return with response false
          //{Response: 'False', Error: 'Movie not found!'} this is the object we get

          if (data.Response === "False") {
            throw new Error("Movie not found!");
          }

          setMovies(data.Search);
          setError("");
        } catch (err) {
          // console.log(err);
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false); //this block of code is always is always executed
        }
      }

      fecthMovies();

      //clanUp function to avoid the race condition while searching the movie
      // All the other req apart form the last one will be cancelled
      //Each time there is a new keystroke here the component is rerender and between each of the rerender the
      // cleanup function is  called and controller abort the current fetch req.
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoding, error };
}
