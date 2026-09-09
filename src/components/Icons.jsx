export function BatIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* cuerpo */}
      <path d="M12 10.2C12 10.2 11.3 8.2 11.8 6.6C12 5.7 12.9 5.1 13.6 5.6C13.2 5.6 12.6 6.4 12.6 7.2M12 10.2C12 10.2 12.7 8.2 12.2 6.6C12 5.7 11.1 5.1 10.4 5.6C10.8 5.6 11.4 6.4 11.4 7.2" opacity="0.9" />
      <ellipse cx="12" cy="11.2" rx="1.4" ry="2.1" fill="currentColor" stroke="none" opacity="0.95" />
      {/* ala izquierda - curva amplia */}
      <path d="M10.6 10.6C8.4 8.1 5.2 6.2 2.1 7.8C2.6 8.6 3 9.8 4.2 10.4C3.2 10.6 2 11.8 2.3 13.1C3.9 12.2 5.6 12.2 7.1 13.2L10.8 11.3" fill="currentColor" stroke="none" opacity="0.95" />
      <path d="M10.6 10.6C8.4 8.1 5.2 6.2 2.1 7.8C2.6 8.6 3 9.8 4.2 10.4C3.2 10.6 2 11.8 2.3 13.1C3.9 12.2 5.6 12.2 7.1 13.2L10.8 11.3" />
      {/* ala derecha */}
      <path d="M13.4 10.6C15.6 8.1 18.8 6.2 21.9 7.8C21.4 8.6 21 9.8 19.8 10.4C20.8 10.6 22 11.8 21.7 13.1C20.1 12.2 18.4 12.2 16.9 13.2L13.2 11.3" fill="currentColor" stroke="none" opacity="0.95" />
      <path d="M13.4 10.6C15.6 8.1 18.8 6.2 21.9 7.8C21.4 8.6 21 9.8 19.8 10.4C20.8 10.6 22 11.8 21.7 13.1C20.1 12.2 18.4 12.2 16.9 13.2L13.2 11.3" />
      {/* ojos sutiles */}
      <circle cx="11.2" cy="10.4" r="0.35" fill="white" opacity="0.9" />
      <circle cx="12.8" cy="10.4" r="0.35" fill="white" opacity="0.9" />
    </svg>
  )
}

export function FlowerIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* pétalos externos dorados */}
      <g fill="currentColor" stroke="none" opacity="0.95">
        <ellipse cx="12" cy="3.8" rx="2" ry="3" />
        <ellipse cx="12" cy="20.2" rx="2" ry="3" />
        <ellipse cx="3.8" cy="12" rx="3" ry="2" />
        <ellipse cx="20.2" cy="12" rx="3" ry="2" />
        <ellipse cx="6.2" cy="6.2" rx="2.2" ry="2.8" transform="rotate(-45 6.2 6.2)" />
        <ellipse cx="17.8" cy="6.2" rx="2.2" ry="2.8" transform="rotate(45 17.8 6.2)" />
        <ellipse cx="6.2" cy="17.8" rx="2.2" ry="2.8" transform="rotate(45 6.2 17.8)" />
        <ellipse cx="17.8" cy="17.8" rx="2.2" ry="2.8" transform="rotate(-45 17.8 17.8)" />
      </g>
      {/* segunda capa pétalos más claros */}
      <g fill="white" opacity="0.18">
        <ellipse cx="12" cy="4.6" rx="1" ry="1.6" />
        <ellipse cx="12" cy="19.4" rx="1" ry="1.6" />
        <ellipse cx="4.6" cy="12" rx="1.6" ry="1" />
        <ellipse cx="19.4" cy="12" rx="1.6" ry="1" />
      </g>
    {/* centro */}
    <circle cx="12" cy="12" r="3.6" fill="#b8941f" stroke="none" />
    <circle cx="12" cy="12" r="2.4" fill="#f9e076" stroke="none" opacity="0.9" />
    <circle cx="11.1" cy="11" r="0.7" fill="white" opacity="0.7" />
  </svg>
  )
}

export function GothicSkullIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* cráneo */}
      <path d="M12 2.6c-4.7 0-7.8 3.3-7.8 7.6 0 2.6 1.3 4.5 3 5.7v2.9c0 .7.5 1.2 1.2 1.2h7.2c.7 0 1.2-.5 1.2-1.2v-2.9c1.7-1.2 3-3.1 3-5.7 0-4.3-3.1-7.6-7.8-7.6z" />
      {/* ojos góticos almendrados */}
      <path d="M7.3 10.6c.5-1.7 1.8-2.7 3.4-2.5.2 1.5-.5 2.9-1.9 3.4-.7.3-1.4 0-1.5-.9z" fill="currentColor" stroke="none" opacity="0.92" />
      <path d="M16.7 10.6c-.5-1.7-1.8-2.7-3.4-2.5-.2 1.5.5 2.9 1.9 3.4.7.3 1.4 0 1.5-.9z" fill="currentColor" stroke="none" opacity="0.92" />
      {/* brillo en ojos */}
      <circle cx="9.1" cy="9.6" r="0.45" fill="#050505" opacity="0.85" />
      <circle cx="14.9" cy="9.6" r="0.45" fill="#050505" opacity="0.85" />
      {/* nariz gótica */}
      <path d="M12 12.4l-1.2 2h2.4z" fill="currentColor" stroke="none" opacity="0.92" />
      {/* diamante en la frente */}
      <path d="M12 4.6l.8 1-.8 1-.8-1z" fill="currentColor" stroke="none" opacity="0.75" />
      {/* grieta fina */}
      <path d="M12 6.6v1.4M12 8l-1 1" opacity="0.55" strokeWidth="1" />
      {/* dientes */}
      <path d="M9.6 16.6v2.1M11.1 16.9v1.9M12.9 16.9v1.9M14.4 16.6v2.1" strokeWidth="1.1" />
    </svg>
  )
}
