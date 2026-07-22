import type { ComponentProps } from "react"

type IconProps = ComponentProps<"svg">

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z" />
    </svg>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.9h2.66l.4-3.1h-3.06V8.1c0-.9.25-1.5 1.54-1.5h1.64V3.84A22 22 0 0 0 14 3.7c-2.35 0-3.96 1.44-3.96 4.07v2.24H7.36v3.1h2.68V21h3.46z" />
    </svg>
  )
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.24 3h2.86l-6.25 7.15L22.2 21h-5.76l-4.51-5.9L6.75 21H3.88l6.68-7.64L2.8 3h5.9l4.08 5.4L18.24 3zm-1 16.17h1.58L7.84 4.74H6.14l11.1 14.43z" />
    </svg>
  )
}
