import React from 'react';
import Select from 'react-select';

const voiceOptions = [
  { value: 'Kore', label: 'Kore' },
  { value: 'Puck', label: 'Puck' },
  { value: 'Charon', label: 'Charon' },
  { value: 'Fenrir', label: 'Fenrir' },
  { value: 'Aoede', label: 'Aoede' },
  { value: 'Calliope', label: 'Calliope' },
  { value: 'Thalia', label: 'Thalia' },
  { value: 'Echo', label: 'Echo' },
];

interface VoiceSelectorProps {
  value: string;
  onChange: (voice: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="voice-selector">
      <Select
        className="react-select"
        classNamePrefix="react-select"
        value={voiceOptions.find(option => option.value === value)}
        options={voiceOptions}
        onChange={(option) => option && onChange(option.value)}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            background: "var(--Neutral-15)",
            color: "var(--Neutral-90)",
            minHeight: "33px",
            maxHeight: "33px",
            border: 0,
          }),
          option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isFocused
              ? "var(--Neutral-30)"
              : isSelected
                ? "var(--Neutral-20)"
                : undefined,
          }),
        }}
      />
    </div>
  );
};
