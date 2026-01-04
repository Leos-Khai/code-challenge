def sumNumber2(firstNumber, secondNumber):
    if firstNumber > secondNumber:
        return 0
    if firstNumber == secondNumber:
        return firstNumber
    if firstNumber != 1:
        return (secondNumber * (secondNumber + 1) / 2) - (
            firstNumber * (firstNumber + 1) / 2
        )
    return secondNumber * (secondNumber + 1) / 2
