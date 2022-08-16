import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { SearchQueryInput } from "./components/SearchQueryInput";
import { useDebounce } from "./hooks/debounce";

const fetcher = (url) => fetch(url).then((r) => r.json());

function App() {
  const { data } = useSWR("/supports.json", fetcher);
  const [supports, setSupports] = useState<any[] | undefined>(undefined);

  const debounce = useDebounce(200);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }
    console.log(debouncedQuery);
    const filteredSupports = data.items.filter((support) => {
      if (debouncedQuery && debouncedQuery.length > 0) {
        const isMatch = debouncedQuery
          .split(/[\x20\u3000]+/)
          .map((q) => {
            return (
              q.length === 0 ||
              support.title.includes(q) ||
              support.summary.includes(q) ||
              support.target.includes(q) ||
              support.body.includes(q) ||
              support.governing_law.includes(q) ||
              support.inquiry.includes(q)
            );
          })
          .every((v) => v === true);
        return isMatch;
      } else {
        return true;
      }
    });
    setSupports(filteredSupports);
  }, [data, debouncedQuery]);

  return (
    <div
      style={{
        marginTop: "30px",
        width: "100%",
        minHeight: "110vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flexStart",
        alignItems: "center",
      }}
    >
      <h1>爆速マイ制度ナビ</h1>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "flex",
          marginBottom: "30px",
        }}
      >
        <SearchQueryInput
          onChange={(value) => {
            debounce(() => {
              setDebouncedQuery(value);
            });
          }}
        />
      </div>
      <div>
        {supports &&
          supports.map((support) => {
            return (
              <div
                key={support.id}
                style={{
                  border: "1px solid black",
                  margin: "20px 5px",
                  padding: "10px",
                }}
              >
                <h2>{support.title}</h2>
                <h3>概要</h3>
                <p>{support.summary}</p>
                <h3>対象</h3>
                <p>{support.target}</p>
                <h3>内容</h3>
                <p>{support.body}</p>
                <h3>根拠法令</h3>
                <p>{support.governing_law}</p>
                <h3>収録制度集</h3>
                <p>
                  {support.catalogs.map((catalog) => {
                    return <p>{catalog.name}</p>;
                  })}
                </p>
                <h3>問い合わせ先</h3>
                <p>{support.inquiry}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
