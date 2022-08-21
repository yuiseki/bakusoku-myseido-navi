import React, { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Highlighter from "react-highlight-words";

import { SearchQueryInput } from "./components/SearchQueryInput";
import { useDebounce } from "./hooks/debounce";
import { highlightText } from "./lib/highlightText";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const categories = [
  "life_stage_categories",
  "personal_purpose_categories",
  "personal_service_categories",
  "support_categories",
  "purpose_categories",
];

const subCategories = [
  "request_categories",
  "situation_categories",
  "target_categories",
];

function App() {
  const { data: supportsData } = useSWR("/supports.json", fetcher);
  const { data: wordsData } = useSWR("/words.json", fetcher);
  const { data: targetsData } = useSWR(
    "/categories/target_categories.json",
    fetcher
  );

  const [supports, setSupports] = useState<any[] | undefined>(undefined);
  const [users, setUsers] = useState<string[] | undefined>(undefined);

  const debounce = useDebounce(200);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchWords, setSearchWords] = useState<string[]>([]);

  useEffect(() => {
    if (!targetsData) {
      return;
    }
    const newUsers: string[] = targetsData.map((target: any) => {
      return target.sub_categories.map((cat: any) => {
        return cat.name;
      });
    });
    const newUsersUniq = [...new Set(newUsers.flat())];
    setUsers(newUsersUniq);
  }, [targetsData]);

  useEffect(() => {
    if (!supportsData) {
      return;
    }
    const newSupports = supportsData.items.map((support: any) => {
      const mainCats = categories
        .map((cat) => support[cat].map((c: any) => c.name))
        .flat();
      const subCats = subCategories
        .map((cat) =>
          support[cat].map((c: any) => c.sub_categories.map((s: any) => s.name))
        )
        .flat();
      const cats = [...mainCats, ...subCats, ...support.keywords];
      support.all_categories = [...new Set(cats)];
      return support;
    });
    const newSearchWords = debouncedQuery.split(/[\x20\u3000]+/);
    if (!newSearchWords || newSearchWords.length === 0) {
      setSupports(newSupports.sort(() => Math.random() - 0.5));
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
  }, [supportsData, debouncedQuery]);

  const appendQuery = useCallback(
    (query: string) => {
      if (debouncedQuery && debouncedQuery.length > 0) {
        setDebouncedQuery(debouncedQuery + " " + query);
      } else {
        setDebouncedQuery(query);
      }
    },
    [debouncedQuery]
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: "110vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2>爆速マイ制度ナビ</h2>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "flex",
          marginBottom: "10px",
        }}
      >
        <SearchQueryInput
          inputValue={debouncedQuery}
          onChange={(value) => {
            debounce(() => {
              setDebouncedQuery(value);
            });
          }}
        />
      </div>
      <h3>あてはまる言葉をクリック</h3>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        {users &&
          users.map((user: any) => {
            return (
              <button
                style={{ height: "3.4em", lineHeight: "1.4em" }}
                value={user}
                onClick={(event) => {
                  appendQuery(event.currentTarget.value);
                }}
              >
                {user}
              </button>
            );
          })}
      </div>
      <h3>制度検索ガチャ</h3>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        {wordsData &&
          wordsData
            .sort(() => Math.random() - 0.5)
            .slice(0, 8)
            .map((word: string) => {
              return (
                <button
                  style={{ height: "3.4em", lineHeight: "1.4em" }}
                  value={word}
                  onClick={(event) => {
                    appendQuery(event.currentTarget.value);
                  }}
                >
                  {word}
                </button>
              );
            })}
      </div>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          display: "flex",
        }}
      >
        <h3>{supports && supports.length + "件の制度を爆速で検索"}</h3>
      </div>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          overflowWrap: "break-word",
        }}
      >
        {supports &&
          supports.map((support) => {
            return (
              <div
                key={support.id}
                style={{
                  border: "1px solid black",
                  margin: "5px",
                  padding: "10px",
                }}
              >
                <h2>
                  <Highlighter
                    searchWords={searchWords}
                    textToHighlight={support.title}
                  />
                  ,{" "}
                  {support.competent_authorities.map((auth: any) => {
                    return (
                      <Highlighter
                        searchWords={searchWords}
                        textToHighlight={auth.name}
                      />
                    );
                  })}
                </h2>
                <h3>
                  <Highlighter
                    searchWords={searchWords}
                    textToHighlight={support.summary}
                  />
                </h3>
                <h3>対象</h3>
                <div>
                  <ReactMarkdown
                    children={highlightText(searchWords, support.target)}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  />
                </div>
                <h3>内容</h3>
                <div>
                  <ReactMarkdown
                    children={highlightText(searchWords, support.body)}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  />
                </div>
                {support.inquiry && support.inquiry.length > 0 && (
                  <>
                    <h3>問い合わせ先</h3>
                    <div>
                      <ReactMarkdown
                        children={highlightText(
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
                        children={highlightText(
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
                <h3>キーワード</h3>
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
