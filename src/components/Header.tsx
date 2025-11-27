import ThemeToggle from '@/components/ThemeToggle';
import { Suspense } from 'react';
import SearchForm from '@/components/SearchForm';
import Link from 'next/link';
import GitHubStarButton from '@/components/GitHubStarButton';

const Header = () => (
  <header className="space-y-8">
    <div className="flex justify-between items-center">
      <h4>
        <Link href="/">Livefol.io</Link>
      </h4>
      <div className="space-x-2">
        <GitHubStarButton />
        <ThemeToggle />
      </div>
    </div>
    <Suspense fallback={<SearchSkeleton />}>
      <SearchForm />
    </Suspense>
  </header>
);

const SearchSkeleton = () => (
  <div className="space-y-2 max-w-md">
    <div className="flex items-center gap-4">
      <div className="h-10 flex-1 rounded-xs bg-foreground/10 animate-pulse" />
      <div className="h-10 w-24 rounded-xs bg-foreground/10 animate-pulse" />
    </div>
    <div className="h-4 w-32 rounded-xs bg-foreground/10 animate-pulse" />
  </div>
);

export default Header;
