type Props = {
    html: string;
  };
  
  export default function ResumePreview({ html }: Props) {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          height: "600px",
          overflow: "auto",
          background: "#fff",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }