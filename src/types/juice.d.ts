declare module 'juice' {
  interface JuiceOptions {
    removeStyleTags?: boolean;
    applyStyleTags?: boolean;
    applyLinkTags?: boolean;
    insertPreservedExtraCss?: boolean;
    inlinePseudoElements?: boolean;
    xmlMode?: boolean;
    preserveImportant?: boolean;
    preserveFontFaces?: boolean;
    preserveMediaQueries?: boolean;
    preserveKeyFrames?: boolean;
    webResources?: any;
  }

  function juice(html: string, options?: JuiceOptions): string;
  export default juice;
}
