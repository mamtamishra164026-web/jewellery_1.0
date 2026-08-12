// High-performance, zero-dependency classname merger utility compatible with Tailwind CSS v4
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
