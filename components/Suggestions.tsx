type Props = {
    suggestions: any[];
    onApprove: () => void;
    onSelect?: (s: any) => void;
  };
  
  export default function Suggestions({ suggestions, onApprove, onSelect }: Props) {
    if (!suggestions.length) return null;
  
    return (
      <div>
        <h3>Suggestions</h3>
  
        {suggestions.map((s, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <p>
              {typeof s === "string"
                ? s
                : s.suggestion || JSON.stringify(s)}
            </p>
  
            {onSelect && (
              <button onClick={() => onSelect(s)}>
                Refine with AI
              </button>
            )}
          </div>
        ))}
  
        <button onClick={onApprove}>Approve All</button>
      </div>
    );
  }