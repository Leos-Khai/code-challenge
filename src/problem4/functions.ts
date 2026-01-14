/**
 * Implementation A: Iterative loop approach
 * Time Complexity: O(n) - loops through all numbers from 1 to n
 * Space Complexity: O(1) - only uses a single variable for the total
 */
export function sum_to_n_a(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

/**
 * Implementation B: Mathematical formula approach
 * Uses the arithmetic series formula: n * (n + 1) / 2
 * Time Complexity: O(1) - constant time calculation
 * Space Complexity: O(1) - no additional space needed
 */
export function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Implementation C: Array with reduce approach
 * Creates an array of numbers 1 to n and reduces them to a sum
 * Time Complexity: O(n) - creates array and iterates through it
 * Space Complexity: O(n) - allocates an array of size n
 */
export function sum_to_n_c(n: number): number {
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
}
