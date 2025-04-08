declare namespace JSX {
  interface IntrinsicElements {
    span: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLSpanElement> & {
        inject_newsvd?: string;
        suppressHydrationWarning?: boolean;
      },
      HTMLSpanElement
    >;
  }
} 