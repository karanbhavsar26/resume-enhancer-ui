type Props = {
    jd: string;
    setJd: (val: string) => void;
    onAnalyze: () => void;
  };
  
  export default function JDInput({ jd, setJd, onAnalyze }: Props) {
    return (
      <div>
        <textarea
          placeholder="Paste Job Description..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={8}
          style={{ width: "100%" }}
        />
  
        <button onClick={onAnalyze}>Analyze</button>
      </div>
    );
  }