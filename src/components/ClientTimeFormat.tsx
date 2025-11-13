'use client';

interface ClientTimeFormatProps {
  formatOptions: Intl.DateTimeFormatOptions;
  date: Date;
}

const ClientTimeFormat = ({ formatOptions, date }: ClientTimeFormatProps) => {
  const formatter = new Intl.DateTimeFormat('en-US', formatOptions);
  return formatter.format(date);
};

export default ClientTimeFormat;
