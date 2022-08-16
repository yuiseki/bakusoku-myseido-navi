import React, { useState } from "react";

export const SearchQueryInput: React.FC<{
  onChange: (value: string) => void;
}> = ({ onChange }) => {
  const [value, setValue] = useState("");

  return (
    <input
      type="text"
      placeholder={"Search items..."}
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
