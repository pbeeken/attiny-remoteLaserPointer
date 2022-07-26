# Web App Explorations

This is an exploration of web app built on node. Eventually this will run on a Raspberry Pi that is retreiving data from 
the PIO pins and $I^2C$ devices.  This may include output as well as input.

General things I need to learn:
  - How async operations work with the Promise model of code handling
  - When do I control caching and update content pushed from the server vs being requested by client?

## Naive starting point: Quotes
I have a server file which contains quotes in a text file. I read the file in to a server script and serves pages with a randomly changing choice from the file.  
  - Currently this is driven by the client updating the page using a refresh. **Is there a way the server can push this out?**  
  - I write all the structural elements directly within the code. **Is this the best way to do this or should the static bits be in a file with the program managing the dynamic elements?**

