import React, { useState } from 'react';

export function Avatar({ className = '', children, ...props }) {
  return (
    <div
      className={`relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700/60 bg-slate-800 text-slate-100 items-center justify-center font-semibold text-xs select-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = '', className = '', ...props }) {
  const [hasError, setHasError] = useState(false);
  if (hasError || !src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

export function AvatarFallback({ className = '', children, ...props }) {
  return (
    <span
      className={`flex h-full w-full items-center justify-center rounded-full bg-slate-800 font-medium text-xs text-slate-200 uppercase ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function AvatarBadge({ className = '', ...props }) {
  return (
    <span
      className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-[var(--bg-card)] bg-emerald-500 ${className}`}
      {...props}
    />
  );
}

export function AvatarGroup({ className = '', children, ...props }) {
  return (
    <div
      className={`flex items-center -space-x-2 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarGroupCount({ className = '', children, ...props }) {
  return (
    <span
      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-[11px] font-semibold text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function AvatarDemo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-6 md:gap-12 p-4">
      <Avatar>
        <AvatarImage
          src="https://github.com/shadcn.png"
          alt="@shadcn"
          className="grayscale"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage
          src="https://github.com/evilrabbit.png"
          alt="@evilrabbit"
        />
        <AvatarFallback>ER</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
      </Avatar>
      <AvatarGroup className="grayscale">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            src="https://github.com/maxleiter.png"
            alt="@maxleiter"
          />
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit"
          />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}
