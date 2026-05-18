'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PdfSmartBack() {
  const router = useRouter();

  useEffect(() => {
    // Push a state into history to trap the immediate popstate event
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // Direct escape to homepage when back is clicked/swiped
      router.push('/');
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return null;
}
