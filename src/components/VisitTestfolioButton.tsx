'use client';

import { Button } from '@/components/ui/button';
import { View } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const VisitTestfolioButton = () => {
  const searchParams = useSearchParams();
  const strategyLinkId = searchParams.get('s');
  const testfolioLink = `https://www.testfol.io/tactical?s=${strategyLinkId}`;

  return (
    <Button type="button" variant="outline" asChild>
      <Link href={testfolioLink} target="_blank">
        <View /> View on Testfol.io
      </Link>
    </Button>
  );
};

export default VisitTestfolioButton;
