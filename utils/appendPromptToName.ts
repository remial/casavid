export default function appendPromptToName(name: string, type: string, theme: string, instruction: string) {
    let insertPos = name.indexOf(".");
    // Construct the prompt string, sanitize it to remove spaces or special characters
    let prompt = `${type}_${theme}_${instruction}`.replace(/[^a-zA-Z0-9]/g, '_');
    let newName = name
      .substring(0, insertPos)
      .concat(`-${prompt}`, name.substring(insertPos));
    return newName;
  }
  