'use client';

import { ChangeEvent, FormEvent, useState } from 'react';

export default function Subscribe() {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState<string>();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Sorry, strategy alerts subscription is still in development.');
  };

  return (
    <div className="space-y-2">
      <form
        className="flex items-center gap-4 max-w-md"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col space-y-2">
          <label htmlFor="email">Get notified when reallocation occurs</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            className="w-full h-10 px-3 rounded-xs border border-solid border-foreground/10 outline-none focus:border-accent"
            value={value}
            onChange={onChange}
          />
        </div>
        <button className="self-end h-10 px-3 rounded-xs bg-foreground text-background hover:bg-foreground/80 font-medium transition-colors">
          Subscribe
        </button>
      </form>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
