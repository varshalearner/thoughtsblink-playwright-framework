import { test } from '@playwright/test';

type AsyncMethod<This, Args extends unknown[], Return> = (
  this: This,
  ...args: Args
) => Promise<Return>;

/**
 * Reports a page-object method as a named step, e.g. "HomePage.openGallery".
 * Not boxed: with `box: true` the step's location is this decorator, which Playwright then
 * hides, so failures lost both the page-object line and the calling test line.
 */
export function step(title?: string) {
  return function <This extends object, Args extends unknown[], Return>(
    target: AsyncMethod<This, Args, Return>,
    context: ClassMethodDecoratorContext<This, AsyncMethod<This, Args, Return>>,
  ): AsyncMethod<This, Args, Return> {
    return function (this: This, ...args: Args): Promise<Return> {
      const name = title ?? `${this.constructor.name}.${String(context.name)}`;
      return test.step(name, () => target.call(this, ...args));
    };
  };
}
