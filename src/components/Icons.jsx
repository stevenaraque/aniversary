export function BatIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2C10 2 8.5 3 7.5 4.5C6 4.5 4.5 5.5 3.5 7C2 7 1 8 1 9.5C1 11 2 12 3 12.5C2.5 13.5 2 14.5 2 16C2 18 4 20 6 20.5C7 22 9 22 10 21C10.5 22 11 22 12 22C13 22 13.5 22 14 21C15 22 17 22 18 20.5C20 20 22 18 22 16C22 14.5 21.5 13.5 21 12.5C22 12 23 11 23 9.5C23 8 22 7 20.5 7C19.5 5.5 18 4.5 16.5 4.5C15.5 3 14 2 12 2Z" />
      <path d="M12 2V22" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

export function FlowerIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
      <path d="M12 2C12 2 14 5 14 7C14 9 12 10 12 10C12 10 10 9 10 7C10 5 12 2 12 2Z" />
      <path d="M22 12C22 12 19 14 17 14C15 14 14 12 14 12C14 12 15 10 17 10C19 10 22 12 22 12Z" />
      <path d="M12 22C12 22 10 19 10 17C10 15 12 14 12 14C12 14 14 15 14 17C14 19 12 22 12 22Z" />
      <path d="M2 12C2 12 5 10 7 10C9 10 10 12 10 12C10 12 9 14 7 14C5 14 2 12 2 12Z" />
      <path d="M5.6 5.6C5.6 5.6 8 6.5 9 5.5C10 4.5 9.5 3 9.5 3C9.5 3 7 2.5 5.5 4C4 5.5 5.6 5.6 5.6 5.6Z" />
      <path d="M18.4 5.6C18.4 5.6 16 6.5 15 5.5C14 4.5 14.5 3 14.5 3C14.5 3 17 2.5 18.5 4C20 5.5 18.4 5.6 18.4 5.6Z" />
      <path d="M5.6 18.4C5.6 18.4 8 17.5 9 18.5C10 19.5 9.5 21 9.5 21C9.5 21 7 21.5 5.5 20C4 18.5 5.6 18.4 5.6 18.4Z" />
      <path d="M18.4 18.4C18.4 18.4 16 17.5 15 18.5C14 19.5 14.5 21 14.5 21C14.5 21 17 21.5 18.5 20C20 18.5 18.4 18.4 18.4 18.4Z" />
    </svg>
  )
}
