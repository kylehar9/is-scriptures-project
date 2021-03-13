# Project 2 Learning Notes
## My Learning Experience
- Learning & mastering CSS must be more deliberate than other, standard programming languages.  The cascading and puzzle-like nature of it makes it too chaotic to keep organized unless you have a direction in which to head from the get-go.
- As a QA guy, I decided that in future endeavors with fellow software devs, it will be important for me to consider their limits and not assume that because something is not perfect that they should be able to make it such.
- I discovered that jQuery doesn't work on raw HTML elements - they must be the right kind of JS object (through modules)
- It's easy to overthink things! Sometimes, even with CSS, the desired solution is just one step away (e.g., figuring out how to eliminate the extra scoll bar by using overflow-y)
- I found it much more convenient to specify separate css files for the different device sizes (small/large), rather than separating all the different device sizes within a single file using @media queries.
- I'm beginning to realize just how powerful React.js and SCSS are with functionality and customization - building a static webpage like this using mostly vanilla JS is a lot more picky








# Project 1 Learning Notes
> Note: I think this is a really cool project.  Dr. Liddle has done an amazing job at creating this and teaching us how to do it ourselves.
## Things I accomplished
- Implementing previous & next chapter buttons, dynamically handling when each of those buttons is displayed if clicking them wouldn't make sense (e.g., clicking "Previous" in Genesis 1)
- Loading Google Map via the API
- Preventing placing duplicate markers on the map when the same location is repeated multiple times in a chapter
- Zooming to an appropriate altitude to view all markers in one screen
- Adjust the map zoom to view a single marker if clicked on the 'a' tag in the scripture verse or the marker on the map

## Lessons learned
- Using const declarations for constant variables is much better than having "magic" values within the code.
- Even if there are easier ways to shorten the written code (e.g., multiple `if` statments), it may still be a good idea to write it all out in order to make it more understandable for me in the future.
    - I.e., I should "be nice to \[myself\]".
- I've also been messing around with custom linting through eslint.  Once I figured out how to create & customize the config file, it is a very nice aid to my coding!
- With all the html creation via JavaScript strings, I am beginning to get a sense for how exactly React works (components, etc.).  It must be doing a very similar sort of thing...
- I thought it interesting to see how the `slice` method can be used in an array as well (e.g., `volumes.slice(-1)[0].id`).
- Understanding how to read API documentation is a bit challenging, but once I understood how to make sense of and utilize it, it became key to solving the various problems with the map.
- It's very important to understand the properties of objects that are getting passed around, like markers, so we can access and know how to parse their attributes as needed (e.g., appending multiple titles to an already existing lat/lng combination).
- Sometimes getting dynamic HTML to work/look properly requires creativity. I thought it was cool to be able to use JavaScript to handle the Prev/Next HTML buttons appropriately.
- If I could have approached this project differently, I would have:
    - Spent more time paying attention to what the purpose of each function was.
    - Spend more time understanding the fundamentals of function encapsulation so I can utilize them more readily for custom functions I need to write.
