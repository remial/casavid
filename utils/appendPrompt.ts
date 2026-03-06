export default function appendPrompt(type: string, theme: string, instruction: string) {
  let name = "image";
  let insertPos = name.indexOf(".");
  
  // Construct the prompt string, sanitize it to remove spaces or special characters
  let prompt = `${type}_${theme}_${instruction}`.replace(/[^a-zA-Z0-9]/g, '_');
  
  let newName = name
    .substring(0, insertPos)
    .concat(`-${prompt}`, name.substring(insertPos));
    
  return newName;
}

  