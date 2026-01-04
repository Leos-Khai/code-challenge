from functools import reduce


def sumNumber3(firstNumber, secondNumber):
    sum = reduce(lambda a, b: a + b, range(firstNumber, secondNumber + 1))
    return sum
