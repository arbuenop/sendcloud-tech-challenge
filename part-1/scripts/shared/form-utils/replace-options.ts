import { SelectOption } from '../types';

/**
 * Replaces the options of a select element with the options sent through parameters.
 * Despite those options are fixed and I could hardcode them in the HTML,
 * I decided to populate them through JS to have a single source of truth for all the options.
 *
 * @param select - Select html element
 * @param placeholder - Self descriptive
 * @param options - Options to populate the select element with
 */
export function replaceOptions(
  select: HTMLSelectElement,
  placeholder: string,
  options: readonly SelectOption[],
): void {
  select.replaceChildren(new Option(placeholder, ''));
  for (const option of options) {
    select.add(new Option(option.label, option.value));
  }
}
