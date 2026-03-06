// Update in utils/dropdownTypes.ts
export type themeType = string; 

export interface ThemeOption {
  name: themeType; 
}

export const themes: ThemeOption[] = [
  { name: "Light" },
  { name: "Dark" },
  { name: "System" }, 
];
