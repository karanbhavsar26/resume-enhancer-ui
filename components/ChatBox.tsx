import { useState } from "react";

type Props = {
  onSend: (msg: string) => void;
};

export default function ChatBox({ onSend }: Props) {
  const [msg, setMsg] = useState("");

  return (
    <div>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask to edit resume..."
      />
      <button
        onClick={() => {
          onSend(msg);
          setMsg("");
        }}
      >
        Send
      </button>
    </div>
  );
}