/**
 * DoubleN Realty — Company constants
 *
 * Founded: 2024
 * Premium rental properties in Thailand for expats and foreigners
 */

export const COMPANY_NAME = 'DoubleN Realty';
export const COMPANY_EMAIL = 'hello@doublen-realty.com';
export const COMPANY_WEBSITE = 'https://doublen-realty.com';

export const FOUNDED_YEAR = 2024;

/**
 * Number of years in operation (calculated from current year)
 */
export function getYearsOfExperience(): number {
  return new Date().getFullYear() - FOUNDED_YEAR;
}

/**
 * Use in JSX: "1+" or "1 year" etc.
 */
export function getYearsLabel(): string {
  return `${getYearsOfExperience()}+`;
}
