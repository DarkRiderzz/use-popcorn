import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  // react call the function in useState in initail render and used whatever the value return by it as inital value of state
  // but these function should be a pure function and it can not received any arguement
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(key); //'watched' is the key that we used to store the data
    return storedValue ? JSON.parse(storedValue) : initialState; //intialstate is empty array
  });
  // const [watched, setWatched] = useState(localStorage.getItem("watched"))  This we should not do

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
      // this will work here becuse this effect will run after the watched movie have already changed
    },
    [value, key]
  );

  return [value, setValue];
}
