import React, { useEffect, useState } from "react";

export const SearchQueryInput: React.FC<{
  inputValue?: string;
  onChange: (value: string) => void;
}> = ({ inputValue, onChange }) => {
  const [value, setValue] = useState(inputValue);

  useEffect(() => {
    setValue(inputValue);
  }, [inputValue]);

  return (
    <input
      type="text"
      placeholder={"制度を爆速で検索..."}
      style={{
        maxWidth: "90%",
        minWidth: "30%",
        fontSize: "1.5em",
        padding: "10px",
        backgroundColor: "#f6f5f3",
        border: "none",
      }}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
};
