export async function logMessage(message: string) {
    try {
        
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
  
      if (!response.ok) {
        console.error('Failed to log message:', await response.text());
      }
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }
  