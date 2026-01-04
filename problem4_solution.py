from src.problem4 import method1, method2, method3
import time
import sys


def format_number(num):
    """Format large numbers with commas for readability."""
    return f"{num:,}"


def run_performance_test(test_name, first_num, second_num):
    """Run performance test for all three methods."""
    print(f"\n{'='*80}")
    print(f"Test: {test_name}")
    print(f"Range: {format_number(first_num)} to {format_number(second_num)}")
    print(f"{'='*80}\n")

    methods = [
        ("Method 1 (Loop)", method1.sumNumber1),
        ("Method 2 (Formula)", method2.sumNumber2),
        ("Method 3 (Reduce)", method3.sumNumber3),
    ]

    results = {}

    for method_name, method_func in methods:
        try:
            # Measure execution time
            start_time = time.perf_counter()
            result = method_func(first_num, second_num)
            end_time = time.perf_counter()

            execution_time = (end_time - start_time) * 1000  # Convert to milliseconds

            results[method_name] = {
                "result": result,
                "time": execution_time,
                "status": "✓ Success",
            }

            print(f"{method_name}:")
            print(f"  Result: {format_number(int(result))}")
            print(f"  Time: {execution_time:.6f} ms")
            print(f"  Status: {results[method_name]['status']}")
            print()

        except Exception as e:
            results[method_name] = {
                "result": None,
                "time": None,
                "status": f"✗ Error: {str(e)}",
            }
            print(f"{method_name}:")
            print(f"  Status: {results[method_name]['status']}")
            print()

    # Compare times
    print(f"{'-'*80}")
    print("Performance Comparison:")
    print(f"{'-'*80}\n")

    valid_results = {k: v for k, v in results.items() if v["time"] is not None}

    if valid_results:
        fastest = min(valid_results.items(), key=lambda x: x[1]["time"])
        slowest = max(valid_results.items(), key=lambda x: x[1]["time"])

        for method_name, data in valid_results.items():
            if method_name == fastest[0]:
                multiplier = 1.0
                marker = "🏆 FASTEST"
            else:
                multiplier = data["time"] / fastest[1]["time"]
                marker = f"({multiplier:.2f}x slower)"

            print(f"{method_name}: {data['time']:.6f} ms {marker}")

    print()


if __name__ == "__main__":
    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + " " * 78 + "║")
    print(
        "║"
        + "PERFORMANCE TEST: Sum Number Methods (Method1 vs Method2 vs Method3)".center(
            78
        )
        + "║"
    )
    print("║" + " " * 78 + "║")
    print("╚" + "=" * 78 + "╝")

    # Test 1: Small numbers
    run_performance_test("Small Range Test", 1, 100)

    # Test 2: Medium numbers
    run_performance_test("Medium Range Test", 1, 10_000)

    # Test 3: Large numbers
    run_performance_test("Large Range Test", 1, 1_000_000)

    # Test 4: Very Large numbers
    run_performance_test("Very Large Range Test", 1, 10_000_000)

    # Test 5: Giant numbers
    run_performance_test("Giant Range Test (EXTREME)", 1, 100_000_000)

    print("\n")
    print("╔" + "=" * 78 + "╗")
    print("║" + "TESTING COMPLETE".center(78) + "║")
    print("╚" + "=" * 78 + "╝")
    print("\n")
