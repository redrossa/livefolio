'use client';

import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';
import { CheckIcon, Share2 } from 'lucide-react';

const ShareButton = () => {
  const [localIsCopied, setLocalIsCopied] = useState(false);

  const handleIsCopied = useCallback((isCopied: boolean) => {
    setLocalIsCopied(isCopied);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        handleIsCopied(true);
        setTimeout(() => handleIsCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Error copying command', error);
      });
  }, [handleIsCopied]);

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {localIsCopied ? (
        <>
          <CheckIcon /> Copied
        </>
      ) : (
        <>
          <Share2 /> Share
        </>
      )}
    </Button>
  );
};

export default ShareButton;
