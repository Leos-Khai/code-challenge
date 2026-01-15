interface AriaAnnouncerProps {
  message: string;
}

export function AriaAnnouncer({ message }: AriaAnnouncerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
