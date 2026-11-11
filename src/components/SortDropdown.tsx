import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

const options = [
  { value: 'asc', label: 'Price, low to high' },
  { value: 'desc', label: 'Price, high to low' },
] as const;

export function SortDropdown({ value, onChange }: { value: string; onChange: (value: 'asc' | 'desc') => void }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [above, setAbove] = useState(false);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [open]);

  function show(index = selectedIndex) {
    const bounds = trigger.current?.getBoundingClientRect();
    if (bounds) {
      const below = window.innerHeight - bounds.bottom;
      setAbove(below < 120 && bounds.top > below);
    }
    setActiveIndex(index);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!open) show();
        else setActiveIndex(index => Math.max(0, Math.min(options.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1))));
        break;
      case 'Home':
      case 'End':
        event.preventDefault();
        show(event.key === 'Home' ? 0 : options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) choose(activeIndex);
        else show();
        break;
      case 'Escape':
        if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false); }
        break;
      case 'Tab':
        if (open) choose(activeIndex);
        break;
    }
  }

  return <div ref={root} className="sort-control" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" className="sort-trigger" role="combobox" aria-label="Sort rooms by price" aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined} onKeyDown={onKeyDown} onClick={() => { if (open) setOpen(false); else show(); }}>
      <span>Sort: {options[selectedIndex].label}</span><span className="sort-arrow" aria-hidden="true">↓</span>
    </button>
    {open && <ul id={id} className="sort-options" role="listbox" aria-label="Sort rooms by price" data-side={above ? 'above' : 'below'} data-lenis-prevent>
      {options.map((option, index) => <li id={`${id}-option-${index}`} key={option.value} role="option" aria-selected={value === option.value} data-active={activeIndex === index} className="sort-option" onPointerMove={() => setActiveIndex(index)} onPointerDown={event => event.preventDefault()} onClick={() => { choose(index); trigger.current?.focus(); }}>
        <span>{option.label}</span><span className="sort-check" aria-hidden="true">{value === option.value ? '✓' : ''}</span>
      </li>)}
    </ul>}
  </div>;
}
