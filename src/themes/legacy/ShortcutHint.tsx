interface ShortcutHintProps {
  text: string | null;
}

export function ShortcutHint({ text }: ShortcutHintProps) {
  return (
    <div className={`shortcut-hint${text ? ' show' : ''}`} id="shortcut-hint">
      {text}
    </div>
  );
}
