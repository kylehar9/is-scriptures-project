# Kyle Harline HW 5 Submission
## Lessons learned from HW 5

- Why is it worth it to use code in place of jQuery? So we don't have to load the entire jQuery library (large)
- Callback functions are very useful, especially when making API calls, to allow for dynamic function calls
- When dealing with a server returning data, it is important for us to retrieve that data at a proper time.
    - We can use a bool value to keep track of whether the resource was loaded, then proceed once it is
    - Otherwise we may be trying to modify data (e.g., array within the volumes object) that doesn't exist yet.
- The contents of the _books_ and _volumes_ variables can only be seen via console *during* runtime
    - i.e., we have to look at them before the last callback gets called

- How to follow/be sure about which callback function is being called?This is the repo for Project 1 in IS 542
