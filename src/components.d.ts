/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';


export namespace Components {
  interface AeIcon5Component {
    'aesize': string;
    'aetype': string;
    'arialabel': string;
    'color': string;
    'name': string;
  }
}

declare global {


  interface HTMLAeIcon5ComponentElement extends Components.AeIcon5Component, HTMLStencilElement {}
  var HTMLAeIcon5ComponentElement: {
    prototype: HTMLAeIcon5ComponentElement;
    new (): HTMLAeIcon5ComponentElement;
  };
  interface HTMLElementTagNameMap {
    'ae-icon5-component': HTMLAeIcon5ComponentElement;
  }
}

declare namespace LocalJSX {
  interface AeIcon5Component {
    'aesize'?: string;
    'aetype'?: string;
    'arialabel'?: string;
    'color'?: string;
    'name'?: string;
  }

  interface IntrinsicElements {
    'ae-icon5-component': AeIcon5Component;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements {
      'ae-icon5-component': LocalJSX.AeIcon5Component & JSXBase.HTMLAttributes<HTMLAeIcon5ComponentElement>;
    }
  }
}


