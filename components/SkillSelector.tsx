type Skill = {
    name: string;
    level: "NEW" | "RELATED" | "STRONG";
  };
  
  type Props = {
    skills: string[]; // backend just gives a string array
    selectedSkills: Skill[];
    setSelectedSkills: (skills: Skill[]) => void;
  };
  
  export default function SkillSelector({
    skills,
    selectedSkills,
    setSelectedSkills,
  }: Props) {
    // Helper to check if a skill is already selected
    const getSelected = (name: string) =>
      selectedSkills.find((s) => s.name === name);
  
    const handleCheckboxChange = (name: string, checked: boolean) => {
      if (checked) {
        setSelectedSkills([...selectedSkills, { name, level: "NEW" }]);
      } else {
        setSelectedSkills(selectedSkills.filter((s) => s.name !== name));
      }
    };
  
    const handleLevelChange = (name: string, level: Skill["level"]) => {
      setSelectedSkills(
        selectedSkills.map((s) => (s.name === name ? { ...s, level } : s))
      );
    };
  
    return (
      <div>
        <h3>Missing / Suggested Skills</h3>
        {skills.map((skillName) => {
          const selected = getSelected(skillName);
  
          return (
            <div key={skillName} style={{ marginBottom: "8px" }}>
              <input
                type="checkbox"
                checked={!!selected}
                onChange={(e) => handleCheckboxChange(skillName, e.target.checked)}
              />
              <span style={{ marginLeft: "8px" }}>{skillName}</span>
  
              {selected && (
                <select
                  value={selected.level}
                  onChange={(e) =>
                    handleLevelChange(skillName, e.target.value as Skill["level"])
                  }
                  style={{ marginLeft: "8px" }}
                >
                  <option value="NEW">NEW</option>
                  <option value="RELATED">RELATED</option>
                  <option value="STRONG">STRONG</option>
                </select>
              )}
            </div>
          );
        })}
      </div>
    );
  }