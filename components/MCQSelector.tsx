type Props = {
    mcqOptions: any;
    setSelectedExperience: any;
  };
  
  export default function MCQSelector({
    mcqOptions,
    setSelectedExperience,
  }: Props) {
    return (
      <div>
        <h3>Select Experience</h3>
  
        {Object.entries(mcqOptions).map(([skill, options]: any) => (
          <div key={skill}>
            <h4>{skill}</h4>
  
            {options.map((opt: string, i: number) => (
              <div key={i}>
                <input
                  type="radio"
                  name={skill}
                  onChange={() =>
                    setSelectedExperience((prev: any) => ({
                      ...prev,
                      [skill]: opt,
                    }))
                  }
                />
                {opt}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }