import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { headers } from 'next/headers';

const DEFAULT_LOCALE = 'en-US';

export async function resolveLocales(): Promise<Intl.LocalesArgument> {
  const headersList = await headers();
  const nh = Object.fromEntries(headersList.entries());
  const languages = new Negotiator({
    headers: nh,
  }).languages();
  return match(languages, [DEFAULT_LOCALE], DEFAULT_LOCALE);
}
