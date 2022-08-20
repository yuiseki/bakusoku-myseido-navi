import React, { useEffect, useState } from "react";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Highlighter from "react-highlight-words";
import { findAll } from "highlight-words-core";

import { SearchQueryInput } from "./components/SearchQueryInput";
import { useDebounce } from "./hooks/debounce";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = [
  "life_stage_categories",
  "personal_purpose_categories",
  "personal_service_categories",
  "request_categories",
  "situation_categories",
  "support_categories",
  "target_categories",
  "purpose_categories",
];

const highlightedText = (searchWords: string[], textToHighlight: string) => {
  const chunks = findAll({
    searchWords,
    textToHighlight,
  });
  const highlightedText = chunks
    .map((chunk) => {
      const { end, highlight, start } = chunk;
      const text = textToHighlight.substr(start, end - start);
      if (highlight) {
        return `<mark>${text}</mark>`;
      } else {
        return text;
      }
    })
    .join("");
  return highlightedText;
};

function App() {
  const { data } = useSWR("/supports.json", fetcher);
  const [supports, setSupports] = useState<any[] | undefined>(undefined);

  const debounce = useDebounce(200);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchWords, setSearchWords] = useState<string[]>([]);

  useEffect(() => {
    if (!data) {
      return;
    }
    const newSupports = data.items.map((support: any) => {
      const cats = categories
        .map((cat) => support[cat].map((c: any) => c.name))
        .flat();
      support.all_categories = [...new Set(cats)];
      return support;
    });
    const newSearchWords = debouncedQuery.split(/[\x20\u3000]+/);
    if (!newSearchWords || newSearchWords.length === 0) {
      setSupports(newSupports);
      return;
    }
    const filteredSupports = newSupports.filter((support: any) => {
      return newSearchWords
        .map((q) => {
          return (
            q.length === 0 ||
            support.title.includes(q) ||
            support.summary.includes(q) ||
            support.target.includes(q) ||
            support.body.includes(q) ||
            support.inquiry.includes(q) ||
            support.usage.includes(q) ||
            support.governing_law.includes(q) ||
            support.all_categories.some((cat: string) => cat.includes(q)) ||
            support.competent_authorities.some((auth: any) =>
              auth.name.includes(q)
            )
          );
        })
        .every((v) => v === true);
    });
    setSupports(filteredSupports);
    setSearchWords(newSearchWords);
  }, [data, debouncedQuery]);

  return (
    <div
      style={{
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
          marginBottom: "10px",
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
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "flex",
          marginBottom: "10px",
        }}
      >
        {supports && supports.length + "件の制度を爆速で検索"}
      </div>
      <div style={{ width: "100%", overflowWrap: "break-word" }}>
        {supports &&
          supports.map((support) => {
            console.log(support);
            return (
              <div
                key={support.id}
                style={{
                  border: "1px solid black",
                  margin: "20px 5px",
                  padding: "10px",
                }}
              >
                <h2>
                  <Highlighter
                    searchWords={searchWords}
                    textToHighlight={support.title}
                  />
                </h2>
                {support.competent_authorities.map((auth: any) => {
                  return (
                    <h3>
                      <Highlighter
                        searchWords={searchWords}
                        textToHighlight={auth.name}
                      />
                    </h3>
                  );
                })}
                <h3>概要</h3>
                <h4>
                  <Highlighter
                    searchWords={searchWords}
                    textToHighlight={support.summary}
                  />
                </h4>
                <h3>対象</h3>
                <div>
                  <ReactMarkdown
                    children={highlightedText(searchWords, support.target)}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  />
                </div>
                <h3>内容</h3>
                <div>
                  <ReactMarkdown
                    children={highlightedText(searchWords, support.body)}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  />
                </div>
                {support.inquiry && support.inquiry.length > 0 && (
                  <>
                    <h3>問い合わせ先</h3>
                    <div>
                      <ReactMarkdown
                        children={highlightedText(
                          searchWords,
                          support.inquiry.replace(/\n/gi, "\r\n  ")
                        )}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      />
                    </div>
                  </>
                )}
                {support.usage && support.usage.length > 0 && (
                  <>
                    <h3>利用方法</h3>
                    <div>
                      <ReactMarkdown
                        children={highlightedText(
                          searchWords,
                          support.usage.replace(/\n/gi, "\r\n  ")
                        )}
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      />
                    </div>
                  </>
                )}
                {support.governing_law && support.governing_law.length > 0 && (
                  <>
                    <h3>根拠法令</h3>
                    <p>
                      <Highlighter
                        searchWords={searchWords}
                        textToHighlight={support.governing_law}
                      />
                    </p>
                  </>
                )}
                {support.catalogs && support.catalogs.length > 0 && (
                  <>
                    <h3>収録制度集</h3>
                    <div>
                      {support.catalogs.map((catalog: any) => {
                        return (
                          <p>
                            <Highlighter
                              searchWords={searchWords}
                              textToHighlight={catalog.name}
                            />
                          </p>
                        );
                      })}
                    </div>
                  </>
                )}
                <Highlighter
                  searchWords={searchWords}
                  textToHighlight={support.all_categories.join(", ")}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
