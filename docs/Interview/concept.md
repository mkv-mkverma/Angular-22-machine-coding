A && B : If A is truthy, give me B. Otherwise give me A.

A || B: Give me the first value that is truthy.

?? — Nullish Coalescing : similar to || but check for only null undefined

?. - optional chaining or SAFE ACCESS : user?.name : Is user available? Yes → get name, No → return undefined

?. = "If it exists, go ahead. If not, give undefined."

conversion

LEFT → RIGHT

Rule 1: + is special

- does string concatenation if either side is a string.

1 + "1" // "11"

"1" + 1 // "11"

"1" + 1 + 1 // "111"

1 + 1 // 2

Rule 2: -, *, / convert strings to numbers

"11" - 1 // 10

"11" * 2 // 22

"11" / 1 // 11

Sepcial

console.log(1 + "1" - 1 + "2" * 2)

1 + "1" = '11'
'11' - 1 = 10
"2" * 2 = 4 (* has higher precedence)
10 + 4 = 14
