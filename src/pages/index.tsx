import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

type Image = {
  height: string;
  width: string;
  size: string;
  url: string;
};
type Gif = {
  id: string;
  url: string;
  title: string;
  images: Record<"original" | "downsized", Image>;
};

const LIMIT = 10;
export default function Home() {
  const [search, setSearch] = useState({
    term: "",
    offset: 0,
    history: [] as Array<string>,
  });
  const [gifs, setGifs] = useState<Array<Gif>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const debounceValue = useDebounce(search.term);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?q=${debounceValue}&api_key=${process.env.API_KEY}&limit=${LIMIT}&offset=${search.offset}`
        );
        const { data } = await response.json();
        if (data) {
          setGifs(data);
        }
      } catch (err) {
        console.log("An error occurred", err);
      }
    })();
  }, [debounceValue, search.offset]);

  useEffect(() => {
    if (!debounceValue) return;

    setSearch((prev) => ({
      ...prev,
      history: prev.history.includes(debounceValue)
        ? prev.history
        : [...prev.history, debounceValue],
    }));
  }, [debounceValue]);

  const handlePagination = (type: "prev" | "next") => {
    setGifs([]);
    switch (type) {
      case "prev":
        setSearch((prev) => ({ ...prev, offset: prev.offset - LIMIT }));
        return;
      case "next":
        setSearch((prev) => ({ ...prev, offset: prev.offset + LIMIT }));
        return;
    }
  };

  const removeHistoryItem = (item: string) => {
    setSearch((prev) => ({
      ...prev,
      history: prev.history.filter((i) => i !== item),
    }));
  };

  return (
    <div>
      {/* Search */}
      <div className={styles.horizontal}>
        {/* SearchInput */}
        <div>
          <input
            value={search.term}
            onChange={(e) =>
              setSearch((prev) => ({
                ...prev,
                term: e.target.value,
                offset: 0,
              }))
            }
            onFocus={() => setShowHistory(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowHistory(false);
              }, 100);
            }}
          />
          {Boolean(showHistory && search.history.length) && (
            <ul className={styles.history}>
              {search.history.map((item) => (
                <li
                  key={item}
                  onClick={() => setSearch((prev) => ({ ...prev, term: item }))}
                >
                  <span>{item}</span>
                  <button onClick={() => removeHistoryItem(item)}>X</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={() => setSearch((prev) => ({ ...prev, term: "" }))}>
          Clear
        </button>
      </div>

      {/* PaginationButtons */}
      <div className={styles.horizontal}>
        <button
          disabled={search.offset === 0}
          onClick={() => handlePagination("prev")}
        >
          Previous
        </button>
        <button
          disabled={search.offset === 4999 || !search.term}
          onClick={() => handlePagination("next")}
        >
          Next
        </button>
      </div>

      {/* GifList */}
      <ul>
        {gifs?.map((gif) => (
          <img alt={gif.title} key={gif.title} src={gif.images.original.url} />
        ))}
      </ul>
    </div>
  );
}
