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
  const { data: requestsData } = useSWR(
    "/categories/request_categories.json",
    fetcher
  );
  const { data: situationsData } = useSWR(
    "/categories/situation_categories.json",
    fetcher
  );

  const [supports, setSupports] = useState<any[] | undefined>(undefined);
  const [wordHints, setWordHints] = useState<string[] | undefined>(undefined);
  const [questions, setQuestions] = useState<string[] | undefined>(undefined);

  const debounce = useDebounce(200);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchWords, setSearchWords] = useState<string[]>([]);

  useEffect(() => {
    if (!targetsData || !wordsData) {
      return;
    }
    const newUsers: string[] = targetsData.map((target: any) => {
      return target.sub_categories.map((cat: any) => {
        return cat.name;
      });
    });
    const newUsersUniq = [...new Set(newUsers.flat())];
    const newWords = wordsData;
    const newWordHints = [...new Set([...newUsersUniq, ...newWords])].sort(
      () => Math.random() - 0.5
    );
    setWordHints(newWordHints);
  }, [targetsData]);

  useEffect(() => {
    if (!requestsData || !situationsData) {
      return;
    }
    const newRequests: string[] = requestsData.map((target: any) => {
      return target.sub_categories.map((cat: any) => {
        return target.name + " " + cat.name;
      });
    });
    const newSituations: string[] = situationsData.map((target: any) => {
      return target.sub_categories.map((cat: any) => {
        return target.name + " " + cat.name;
      });
    });
    const newQuestionsUniq = [
      ...new Set([...newRequests.flat(), ...newSituations.flat()]),
    ].sort(() => Math.random() - 0.5);
    setQuestions(newQuestionsUniq);
  }, [requestsData, situationsData]);

  useEffect(() => {
    if (!supportsData) {
      return;
    }
    const newSupports = supportsData.items
      .map((support: any) => {
        const mainCats = categories
          .map((cat) => support[cat].map((c: any) => c.name))
          .flat();
        const subCats = subCategories
          .map((cat) =>
            support[cat].map((c: any) =>
              c.sub_categories.map((s: any) => s.name)
            )
          )
          .flat();
        const cats = [...mainCats, ...subCats, ...support.keywords].flat();
        support.all_categories = [...new Set(cats)];
        return support;
      })
      .sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
    if (debouncedQuery.length === 0) {
      setSupports(newSupports.sort(() => Math.random() - 0.5));
      setSearchWords([]);
      return;
    }
    const newSearchWords = debouncedQuery.split(/[\x20\u3000]+/);
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
      <h2>爆速AIマイ制度ナビ</h2>
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
      <h3>よくある悩みをAIに伝える</h3>
      <div
        style={{
          justifyContent: "center",
          width: "100%",
          height: "140px",
          overflow: "hidden scroll",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "5px",
          marginBottom: "10px",
        }}
      >
        {questions &&
          questions.map((request: any) => {
            return (
              <button
                style={{ height: "3em", lineHeight: "1.4em" }}
                key={request}
                value={request}
                onClick={(event) => {
                  setDebouncedQuery(event.currentTarget.value);
                }}
              >
                {request}
              </button>
            );
          })}
      </div>
      <h3>気になる言葉をAIに教える</h3>
      <div
        style={{
          width: "100%",
          height: "140px",
          overflow: "hidden scroll",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "start",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        {wordHints &&
          wordHints.map((word: string) => {
            return (
              <button
                style={{
                  display: "block",
                  margin: "5px",
                  height: "3.4em",
                  lineHeight: "1.4em",
                }}
                key={word}
                value={word}
                onClick={(event) => {
                  setDebouncedQuery(event.currentTarget.value);
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
        <h3>
          {debouncedQuery.length === 0 ? (
            <>{supports && supports.length + "件の制度をAIが爆速で検索..."}</>
          ) : (
            <mark>
              {supportsData && supportsData.items.length + "件中 "}
              {supports && supports.length + "件の制度をAIが爆速で検索！！"}
            </mark>
          )}
        </h3>
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
                        key={auth.name}
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
                          <p key={catalog.name}>
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
                {searchWords &&
                  support.all_categories.map((cat: string) => {
                    return (
                      <button
                        style={{
                          margin: "5px",
                          height: "3.4em",
                          lineHeight: "1.4em",
                        }}
                        key={cat}
                        value={cat}
                        disabled={searchWords.includes(cat)}
                        onClick={(event) => {
                          setDebouncedQuery(event.currentTarget.value);
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                <p>管理番号：{support.id}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
