"use client";
import React, { useState } from "react";

export default function InterestForm() {
  const [interests, setInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addInterest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const interest = inputValue.trim();
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest]);
      setInputValue("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
        Add Your Interests
      </h2>
      <form onSubmit={addInterest} className="flex flex-col gap-3">
        <input
          name="interest"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your interests"
          className="border-2 border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-md p-2 w-full hover:bg-blue-600 transition-colors"
        >
          Add Interest
        </button>
      </form>

      {interests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Interests:</h3>
          <ul className="flex flex-wrap gap-2">
            {interests.map((item, index) => (
              <li
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {item}
                <button
                  onClick={() => removeInterest(index)}
                  className="text-blue-500 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
