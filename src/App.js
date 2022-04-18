import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Photo from "./Photo";
const clientID = `?client_id=${process.env.REACT_APP_ACCESS_KEY}`;
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;

function App() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1); // default is page 1 on unsplash.
  const [query, setQuery] = useState("");
  const mounted = useRef(false);
  const [newImages, setNewImages] = useState(false);

  // __ FETCH __
  const fetchImages = async () => {
    // console.log("@fetchImages:", page);
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`;
    const urlQuery = `&query=${query}`;

    if (query) {
      url = `${searchUrl}${clientID}${urlPage}${urlQuery}`;
    } else {
      url = `${mainUrl}${clientID}${urlPage}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      setPhotos((oldPhotos) => {
        if (query && page === 1) {
          return data.results; // reset data to reflect new search
        } else if (query) {
          return [...oldPhotos, ...data.results]; // main vs search results have different structure
        } else {
          return [...oldPhotos, ...data];
        }
      });
      setNewImages(false);
      setLoading(false);
    } catch (error) {
      setNewImages(false);
      setLoading(false);
    }
  };

  // __ INITIAL RENDER AND PAGE CHANGE __
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, [page]);

  // __ SCROLL __
  // technique - will prevent running rest of code on initial render and only run after based on dependency supplied.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // On initial run code below will not run.  Code below will only run after initial render if dependency changes
    if (!newImages) return;

    if (loading) return;

    // Trigger useEffect dependent on page
    setPage((oldPage) => {
      return oldPage + 1;
    });
  }, [newImages]);

  const event = () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      setNewImages(true); // trigger the useEffect dependent on newImages state
    }
  };

  // set up listener after initial render
  useEffect(() => {
    window.addEventListener("scroll", event);
    return () => window.removeEventListener("scroll", event);
  }, []);

  // __ SEARCH __
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query) return; // prevent submit if no query

    // if there is a query and page state is 1 then we still want to fetch images based on that query. fetchImages() will handle setting photos state.
    if (page === 1) {
      fetchImages();
      return;
    }

    // if there is a query and page > 1 (cause by scroll event that increments page) then we want to reset page to 1 which will cause re-render.
    setPage(1);
  };

  return (
    <main>
      <section className="search">
        <form className="search-form">
          <input
            type="text"
            placeholder="search"
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="submit-btn" onClick={handleSubmit}>
            <FaSearch />
          </button>
        </form>
      </section>
      <section className="photos">
        <div className="photos-center">
          {photos.map((image, index) => {
            return <Photo key={image.id + index} {...image} />;
          })}
        </div>
        {loading && <h2 className="loading">Loading...</h2>}
      </section>
    </main>
  );
}

export default App;
