import React, { useCallback, useEffect, useState } from "react";

export const SearchQueryInput: React.FC<{
  inputValue?: string;
  onChange: (value: string) => void;
}> = ({ inputValue, onChange }) => {
  const [value, setValue] = useState(inputValue);

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  return (
    <form
      style={{
        width: "100%",
        display: "flex",
        backgroundColor: "#f6f5f3",
        border: "none",
      }}
    >
      <input
        style={{
          fontSize: "1em",
          padding: "10px",
          flexGrow: "1",
          backgroundColor: "#f6f5f3",
          border: "none",
        }}
        type="text"
        placeholder={"制度を爆速で検索..."}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
      />
      <input
        style={{
          fontSize: "1.4em",
          minWidth: "40px",
          padding: "10px",
          backgroundColor: "#f6f5f3",
          border: "none",
        }}
        type="reset"
        value="✕"
        onClick={() => {
          setValue("");
          onChange("");
        }}
      />
    </form>
  );
};
