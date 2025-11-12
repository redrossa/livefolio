import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const formatterCompact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short', // or 'long' for "1.2 million"
});

const GitHubStarButton = async () => {
  const res = await fetch('https://api.github.com/repos/redrossa/livefolio');
  const info: { stargazers_count: number } = await res.json();
  return (
    <Button type="button" variant="outline" asChild>
      <Link href="https://github.com/redrossa/livefolio" target="_blank">
        <Star />{' '}
        <Badge variant="secondary">
          {formatterCompact.format(info.stargazers_count)}
        </Badge>
      </Link>
    </Button>
  );
};

export default GitHubStarButton;
