const colorNames = [
  'purple',
  'blue',
  'teal',
  'amber',
  'red',
  'orange',
  'green',
  'sky',
  'pink',
  'slate',
];

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: colorNames.flatMap((color) => [
    `border-${color}-300`,
    `bg-${color}-50`,
    `text-${color}-500`,
    `text-${color}-700`,
  ]),
  theme: {
    extend: {
      boxShadow: {
        canvas: '0 12px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
