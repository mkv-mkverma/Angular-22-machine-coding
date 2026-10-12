//!TODO Solve
{
  console.log('start');

  setTimeout(() => {
    console.log('SetTimeOut1');
  }, 1000);

  Promise.resolve().then(() => {
    console.log('microtask');
  });

  new Promise((resolve) => {
    resolve('New Promise');
  }).then((p) => console.log(p));

  const p = new Promise((resolve) => {
    console.log('inside promise');
    setTimeout(resolve, 500);
  });
  p.then(() => console.log('inside then block'));

  console.log('End');

  setTimeout(() => {
    console.log('SetTimeOut2');
  }, 1);
}
{
  // Write a js code Accept a string
  // Exactly 4 or 6 char Only digit from 0 to 9
  // No repeat No sequence no asc no desc Return 0 with 4 char 1 with 6 char 2 invalid length 3 non digit 4 repeat 5 SSC or dec

  /**
 * The string must:

Contain exactly 4 or 6 characters.
Contain digits only (0–9).
Must not contain any repeated digit.
Must not contain an ascending or descending consecutive sequence such as:
1234
4567
9876
6543
Return the following codes:

Condition	Return
Valid 4-digit string	0
Valid 6-digit string	1
Invalid length	2
Contains non-digit character	3
Contains repeated digit	4
Contains ascending/descending sequence	5
 */

  function validate(str) {}

  console.log(validate('1234')); // 5
  console.log(validate('9876')); // 5
  console.log(validate('1238')); // 0
  console.log(validate('123456')); // 5
  console.log(validate('135792')); // 1
  console.log(validate('1123')); // 4
  console.log(validate('12a4')); // 3
  console.log(validate('123')); // 2
  console.log(validate('12345')); // 2
  console.log(validate('987531')); // 1
}

{
  // Two Sum
  const arr = [2, 7, 11, 15, 3, 6];
  const target = 9;
  //   Output: ([2, 7], [3, 6]);

  function twoSum(arr, target) {}

  console.log(twoSum(arr, target));
}

{
  // pair no pair and ignore 0
  const arr = [5, 0, 1, -1, -3, 3, -5, 0];
  // yes
  const arr1 = [5, 0, 1, -1, -3, 3, -5, 0, 2];
  // no
}

{
  const a = { x: 1, nested: { y: 2 } };
  const b = { ...a };
  b.x = 10;
  b.nested.y = 20;
  console.log(a.x, a.nested.y);

  const empty = [];
  console.log(typeof null, empty + empty, empty == !empty, empty === !empty);
}

{
  // Question 3
  function test() {
    console.log(a);
    console.log(foo());

    var a = 10;

    function foo() {
      return a;
    }

    var foo = () => 20;
    console.log(foo());
    20;
  }

  test();
}

{
  // join two array by Id

  const arr1 = [
    { id: 1, x: 10 },
    { id: 2, x: 20 },
  ];

  const arr2 = [
    { id: 2, y: 30 },
    { id: 3, z: 40 },
  ];

  const out = [
    { id: 1, x: 10 },
    { id: 2, x: 20, y: 30 },
    { id: 3, z: 40 },
  ];
}

// !TODO see

{
  // firstNonRepeatingChar -> 1st frequency then 2nd find 1st character
}

{
  // Flat Array Depth
  let arr = [[1, [2, [3, 4]]], 5];

  function flatArray(arr, depth) {
    return arr.reduce((acc, curr) => {
      if (Array.isArray(curr) && depth > 0) {
        acc.push(...flatArray(curr, depth - 1));
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);
  }

  console.log(flatArray(arr, (depth = 3)));
}

{
  // sum of array
  let arr = [[1, [2, [3, 4]]], 5];

  function sumOfArray(arr) {
    return arr.reduce((acc, curr) => {
      if (Array.isArray(curr)) {
        acc += sumOfArray(curr);
      } else {
        acc += curr;
      }
      return acc;
    }, 0);
  }

  console.log(sumOfArray(arr));
}

{
  // Question 2;
  const input = [1, 2, 3, 4, 5, 6];

  /**
{
 "odd": [1,3,5],
 "even": [2,4,6]
}
 */

  // solution

  const out = input.reduce(
    (acc, curr) => {
      if (curr % 2 == 0) {
        acc.even.push(curr);
      } else {
        acc.odd.push(curr);
      }
      return acc;
    },
    { odd: [], even: [] },
  );

  console.log(out);
}

{
  // Input
  const products = [
    { name: 'Laptop', category: 'Electronics', price: 1200 },
    { name: 'Phone', category: 'Electronics', price: 800 },
    { name: 'Shirt', category: 'Clothing', price: 40 },
    { name: 'Jeans', category: 'Clothing', price: 60 },
    { name: 'Blender', category: 'Home Appliances', price: 100 },
    { name: 'TV', category: 'Electronics', price: 1500 },
  ];

  // Output
  // {
  //   Electronics: { count: 3, totalPrice: 3500, averagePrice: 1166.67 },
  //   Clothing: { count: 2, totalPrice: 100, averagePrice: 50 },
  //   'Home Appliances': { count: 1, totalPrice: 100, averagePrice: 100 }
  // }

  const output = products.reduce((acc, curr) => {
    if (acc[curr.category]) {
      const count = acc[curr.category].count + 1;
      const totalPrice = acc[curr.category].totalPrice + curr.price;
      const averagePrice = totalPrice / count;
      acc[curr.category] = {
        count,
        totalPrice,
        averagePrice,
      };
    } else {
      acc[curr.category] = {
        count: 1,
        totalPrice: curr.price,
        averagePrice: curr.price,
      };
    }
    return acc;
  }, {});

  console.log(output);
}

{
  var obj = {
    num: 2,
  };

  const fun = (x = { ...obj }) => {
    console.log((x.num /= 2));
  };

  fun(); // 1

  fun(); // 1

  fun(obj); // 1

  fun(obj); // 0.5
}

{
  const users = [
    { name: 'A', department: 'IT' },
    { name: 'B', department: 'HR' },
    { name: 'C', department: 'IT' },
    { name: 'D', department: 'HR' },
  ];

  function groupBy(users) {
    return users.reduce((acc, curr) => {
      if (acc[curr.department]) {
        acc[curr.department].push(curr);
      } else {
        acc[curr.department] = [];
        acc[curr.department].push(curr);
      }
      return acc;
    }, []);
  }

  console.log(groupBy(users));
}

{
  function sum(...args) {
    return args.reduce((acc, curr) => acc + curr, 0);
  }

  //For the purpose of user debugging.
  sum(100, 200, 300, 400);
}

{
  // finbinacci n = 7
  let n = 7;
  function generateFibonacci(n) {
    if (n <= 0) return [];
    if (n === 1) return [0];

    const output = [0, 1];

    for (let i = 2; i < n; i++) {
      output.push(output[i - 2] + output[i - 1]);
    }

    return output;
  }
  console.log(generateFibonacci(7));
}

{
  const empty = [];
  console.log(typeof null, empty + empty, empty == !empty, empty === !empty); // object, , true, false
}

{
  // reverse
  let arr = [1, 2, 3, 4, 5];
  //output: 5, 4, 3, 2, 1

  // Setps, n = 5 , 0 -> 4
  for (let i = 0; i < arr.length / 2; i++) {
    [arr[i], arr[arr.length - i - 1]] = [arr[arr.length - i - 1], arr[i]];
  }

  console.log(arr);
  console.log(arr.reverse());
}

{
  // reverse
  let str = 'hello';
  // olleh, 5, 0->4
  let strArray = [...str];
  for (let i = 0; i < strArray.length / 2; i++) {
    [strArray[i], strArray[strArray.length - i - 1]] = [
      strArray[strArray.length - i - 1],
      strArray[i],
    ];
  }
  console.log(strArray.join(''));
  console.log([...str].reverse().join(''));
}

{
  // Move Zeros to End
  const input = [0, 1, 0, 3, 12]; // 5, 0-> 4

  // Output:
  // [1, 3, 12, 0, 0]

  let index = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== 0) {
      [input[i], input[index]] = [input[index], input[i]];
      index++;
    }
  }

  console.log(input);
}

/// TODO
/* ==========================================================================
 * SECTION D — IMPLEMENTATION
 * ========================================================================== */

{
  // Q3  All subsets
  //
  // Given an array of DISTINCT numbers, return ALL possible subsets (the power set).
  // Order of subsets does not matter. Each subset must keep the original element order.
  //
  // Examples:
  //   [1, 2, 3] -> [[], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]]   (8 subsets)
  //   []        -> [[]]                                                  (1 subset)
  //   [5]       -> [[], [5]]
  //
  // Before coding: how many subsets will there be for n elements?
  //
  // Follow-up: subsetsWithSum(nums, target) -> only the subsets whose sum equals target.
  //   [1, 2, 3, 4], 5 -> [[1,4], [2,3]]
}

{
  // max depth:
  //   PASS depth [] -> 1 (expected 1)
  // FAIL depth [1,[2,[3]]] -> 2 (expected 3)
  // PASS depth [[1],[[2]]] -> 3 (expected 3)
  // PASS depth [[]] -> 2 (expected 2)
  // FAIL depth [[[]]] -> 2 (expected 3)
  // PASS depth [1,2,3,4,5,[6]] -> 2 (expected 2)
  // PASS depth [[1],[2],[[[3]]]] -> 4 (expected 4)
  // FAIL depth <deep nesting (500 levels)> -> 2 (expected 501)
}

const socket = new WebSocket('wss://example.com');

console.log(socket.readyState); // 0: CONNECTING

socket.onopen = () => {
  console.log(socket.readyState); // 1: OPEN
  socket.send('Hello Server');
};

socket.onmessage = (event) => {
  console.log(event.data); // Message received from server
  // If the server sends JSON:
  // const data = JSON.parse(event.data);
  // console.log(data);
};

socket.onclose = () => {
  console.log(socket.readyState); // 3: CLOSED
};

socket.onerror = (error) => {
  console.error('WebSocket error', error);
};

// CRM - customer relationship management

// salesforce
// jira
// monday
// hubspot

// teach claud he understand and check the skill

// when i do some task he watch and update the skill

// skill - what task need to perform

// connect gmail drive and local file

// Automate sales call create agent - preform action on your behalf

console.log([10, 9, 1, 100].sort()); // 1,9,10,100

// nestedSum([1, [2, [3, 4]], 5])
function maxDepth(arr) {
  // TODO (follow-up)

  const out = arr.reduce(
    (acc, curr) => {
      if (Array.isArray(curr)) {
        acc.depth += 1;
        acc.arr1.push(maxDepth(curr));
      } else {
        acc.arr1.push(curr);
      }
      return acc;
    },
    { arr1: [], depth: 1 },
  );

  return out.depth;
}

console.log(maxDepth([1, [2, [4, 6]]]));
console.log(maxDepth([1, [2, [3]]]));
console.log(maxDepth([1, [2, [3, 4]], 5]));

console.log(typeof null);

function subsets(arr) {
  let result = [[]];

  for (let num of arr) {
    const newSubsets = result.map((subset) => [...subset, num]);
    result = [...result, ...newSubsets];
  }

  return result;
}

console.log(subsets([1, 2, 3]));
console.log(subsets([]));
console.log(subsets([5]));
