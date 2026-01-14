import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./functions";

interface TestCase {
  name: string;
  n: number;
}

interface TestResult {
  functionName: string;
  testCase: string;
  result: number;
  timeMs: number;
}

const testCases: TestCase[] = [
  { name: "Small", n: 100 },
  { name: "Mid", n: 10_000 },
  { name: "Large", n: 1_000_000 },
  { name: "Extra Large", n: 100_000_000 },
];

const functions = [
  { name: "sum_to_n_a (loop)", fn: sum_to_n_a },
  { name: "sum_to_n_b (formula)", fn: sum_to_n_b },
  { name: "sum_to_n_c (array/reduce)", fn: sum_to_n_c },
];

function measureTime(
  fn: (n: number) => number,
  n: number
): { result: number; timeMs: number } {
  const start = performance.now();
  const result = fn(n);
  const end = performance.now();
  return { result, timeMs: end - start };
}

function formatTime(ms: number): string {
  return `${ms.toFixed(4)} ms`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function main() {
  console.log("=".repeat(80));
  console.log("Performance Benchmark: Sum Functions Comparison");
  console.log("=".repeat(80));
  console.log();

  const allResults: TestResult[] = [];

  for (const testCase of testCases) {
    console.log(`\n${"─".repeat(80)}`);
    console.log(
      `Test Case: ${testCase.name} (n = ${formatNumber(testCase.n)})`
    );
    console.log("─".repeat(80));

    for (const { name, fn } of functions) {
      const { result, timeMs } = measureTime(fn, testCase.n);

      allResults.push({
        functionName: name,
        testCase: testCase.name,
        result,
        timeMs,
      });

      console.log(
        `  ${name.padEnd(28)} | Result: ${formatNumber(result).padStart(
          20
        )} | Time: ${formatTime(timeMs).padStart(12)}`
      );
    }
  }

  // Summary comparison
  console.log(`\n${"=".repeat(80)}`);
  console.log("Summary: Time Comparison by Test Case");
  console.log("=".repeat(80));

  for (const testCase of testCases) {
    const caseResults = allResults.filter((r) => r.testCase === testCase.name);
    const fastest = caseResults.reduce((a, b) => (a.timeMs < b.timeMs ? a : b));

    console.log(`\n${testCase.name}:`);
    for (const result of caseResults) {
      const isFastest = result === fastest;
      const ratio =
        fastest.timeMs > 0
          ? (result.timeMs / fastest.timeMs).toFixed(1)
          : "N/A";
      const marker = isFastest ? " ★ FASTEST" : ` (${ratio}x slower)`;
      console.log(
        `  ${result.functionName.padEnd(28)} ${formatTime(
          result.timeMs
        ).padStart(12)}${marker}`
      );
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("Conclusion");
  console.log("=".repeat(80));
  console.log(`
- sum_to_n_a (loop): O(n) time, O(1) space - iterates through each number
- sum_to_n_b (formula): O(1) time, O(1) space - uses arithmetic series formula
- sum_to_n_c (array/reduce): O(n) time, O(n) space - creates array then reduces

The mathematical formula (sum_to_n_b) is fastest for large inputs
as it computes the result in constant time regardless of input size.
`);
}

main();
