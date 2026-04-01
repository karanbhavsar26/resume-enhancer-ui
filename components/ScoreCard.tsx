type Props = {
    score: number;
    missing: string[];
  };
  
  export default function ScoreCard({ score, missing }: Props) {
    return (
      <div>
        <h3>Match Score: {score}%</h3>
  
        <p>Missing Skills:</p>
        <ul>
          {missing.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    );
  }