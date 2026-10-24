import { getRequiredElement } from '../../../../shared/dom';
import { replaceOptions } from '../../../../shared/form-utils/replace-options';
import { COUNTRIES, EXPORT_REASONS } from '../../schema/schema';

/**
 * This function populates the select options for the country and export reason fields in the new shipment form.
 * It replaces the existing options with the predefined lists of countries and export reasons, while preserving any previously selected values if they are still valid.
 *
 * @param root - The form element or a parent element containing the form.
 */
export function populateSelectOptions(root: ParentNode): void {
  // Selectors
  const country = getRequiredElement<HTMLSelectElement>(root, '#country');
  const exportReason = getRequiredElement<HTMLSelectElement>(root, '#export_reason');
  // Values
  const selectedCountry = country.value;
  const selectedReason = exportReason.value;
  // Populate options
  replaceOptions(country, 'Select a country', COUNTRIES);
  replaceOptions(exportReason, 'Select an export reason', EXPORT_REASONS);
  // Preserve previously selected values if they are still valid - Might be useful if we want to re-use this to update the shipment
  if (COUNTRIES.some((option) => option.value === selectedCountry)) country.value = selectedCountry;
  if (EXPORT_REASONS.some((option) => option.value === selectedReason)) {
    exportReason.value = selectedReason;
  }
}
