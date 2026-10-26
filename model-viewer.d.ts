declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      src?: string;
      alt?: string;
      "auto-rotate"?: boolean | string;
      "camera-controls"?: boolean | string;
      "touch-action"?: string;
      "interaction-prompt"?: string;
      "shadow-intensity"?: string;
      exposure?: string;
    }, HTMLElement>;
  }
}
