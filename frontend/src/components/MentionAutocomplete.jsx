import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

export default function MentionAutocomplete({ text, onTextChange, onTaggedUsersChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [taggedUsers, setTaggedUsers] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await api.get(`/user/search-mention?q=${query}`);
        const filtered = res.data.users.filter(
          (u) => !taggedUsers.some((t) => t._id === u._id)
        );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch (err) {
        console.error("Failed to fetch mention suggestions:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, taggedUsers]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    onTextChange(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setQuery(mentionMatch[1]);
      setSelectedIndex(-1);
    } else {
      setQuery("");
      setShowSuggestions(false);
    }
  };

  const selectUser = (user) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.substring(0, mentionMatch.index);
      const newText = `${beforeMention}@${user.name} ${textAfterCursor}`;
      onTextChange(newText);
      
      const newTaggedUsers = [...taggedUsers, user];
      setTaggedUsers(newTaggedUsers);
      onTaggedUsersChange(newTaggedUsers);
    }
    
    setQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectUser(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const removeTaggedUser = (userId) => {
    const newTaggedUsers = taggedUsers.filter((u) => u._id !== userId);
    setTaggedUsers(newTaggedUsers);
    onTaggedUsersChange(newTaggedUsers);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        rows={3}
        className="w-full px-4 py-3 border border-[#D8CFBC] rounded-md text-sm text-[#202A22] focus:outline-none focus:ring-1 focus:ring-[#35503F] focus:border-[#35503F] transition resize-none placeholder:text-[#9A9384]"
        placeholder="Tell the story behind this place... Use @username to tag friends"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#D8CFBC] rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((user, index) => (
            <button
              key={user._id}
              type="button"
              onClick={() => selectUser(user)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F2ECE0] transition ${
                index === selectedIndex ? "bg-[#F2ECE0]" : ""
              }`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#35503F] text-[#F2ECE0] flex items-center justify-center text-[10px] font-semibold">
                  {user.name?.charAt(0)}
                </div>
              )}
              <span className="text-sm text-[#202A22]">{user.name}</span>
            </button>
          ))}
        </div>
      )}

      {taggedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {taggedUsers.map((user) => (
            <span
              key={user._id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E7DFCE] text-[#202A22] rounded-full text-xs font-medium"
            >
              @{user.name}
              <button
                type="button"
                onClick={() => removeTaggedUser(user._id)}
                className="text-[#9A9384] hover:text-[#A23B3B] transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
