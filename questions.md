# Problem 4: Three ways to sum to n

**Category**
Backend · Fullstack

**Duration:** You should not spend more than **2 hours** on this problem.
*Time estimation is for internship roles, if you are a software professional you should spend significantly less time.*

## Task

Provide **3 unique implementations** of the following function in TypeScript.

* Comment on the complexity or efficiency of each function.

**Input:**
`n` - any integer
Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`.

**Output:**
`return` - summation to `n`, i.e.
`sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`

```ts
func sum_to_n_a(n: number): number {
  // your code here
}

func sum_to_n_b(n: number): number {
  // your code here
}

func sum_to_n_c(n: number): number {
  // your code here
}
```

---

# Problem 5: A Crude Server

**Category**
Backend · Fullstack

**Duration:** You should not spend more than **16 hours** on this problem.
*Time estimation is for internship roles, if you are a software professional you should spend significantly less time.*

## Task

Develop a backend server with ExpressJS. You are required to build a set of CRUD interface that allow a user to interact with the service. You are required to use TypeScript for this task.

### Interface functionalities

1. Create a resource.
2. List resources with basic filters.
3. Get details of a resource.
4. Update resource details.
5. Delete a resource.

### Additional Requirements

1. You should connect your backend service with a simple database for data persistence.
2. Provide `README.md` for the configuration and the way to run application.

---

# Problem 6: Architecture

**Category**
Backend · Fullstack

**Duration:** You should not spend more than **8 hours** on this problem.
*Time estimation is for internship roles, if you are a software professional you should spend significantly less time.*

## Task

Write the specification for a software module on the API service (backend application server).

1. Create a documentation for this module on a `README.md` file.
2. Create a diagram to illustrate the flow of execution.
3. Add additional comments for improvement you may have in the documentation.
4. Your specification will be given to a backend engineering team to implement.

## Software Requirements

1. We have a website with a score board, which shows the top 10 user's scores.
2. We want live update of the score board.
3. User can do an action (which we do not need to care what the action is), completing this action will increase the user's score.
4. Upon completion the action will dispatch an API call to the application server to update the score.
5. We want to prevent malicious users from increasing scores without authorisation.

