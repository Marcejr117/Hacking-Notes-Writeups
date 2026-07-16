import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import style from "./styles/password-protect.scss";
// @ts-expect-error - inline script import handled by tsup inline loader
import script from "./scripts/password-protect.inline.ts";

export interface PasswordProtectPageComponentOptions {
  /** CSS class name for the component wrapper. */
  className?: string;
}

export default ((_opts?: PasswordProtectPageComponentOptions) => {
  const Component: QuartzComponent = (_props: QuartzComponentProps) => {
    return null;
  };

  Component.css = style;
  Component.afterDOMLoaded = script;

  return Component;
}) satisfies QuartzComponentConstructor;
