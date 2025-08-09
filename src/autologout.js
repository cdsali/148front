import { useEffect } from 'react';
import { handleLogout } from '../api/utils'; // adjust path

export default function useAutoLogout() {
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      // You can call logout here (sync or async)
      // Async might not always complete on unload but let's try
      await handleLogout();

      // Some browsers require returnValue set to show confirmation dialog (optional)
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
