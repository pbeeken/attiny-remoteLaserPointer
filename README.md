# Web App Explorations

This is an exploration of web app built on node. Eventually this will run on a Raspberry Pi that is retreiving data from
the PIO pins and $I^2C$ devices.  This may include output as well as input.

General things I need to learn:
  - How async operations work with the Promise model of code handling
    - looks like any function declared with an 'async' prefix automatically becomes a promise object.
      - *YES.*
    - Promise objects need to be provided functions (or lambda functions) that complete the transaction or respond to various options of what the promise can transfer.
      - *If you are constructing your own manually yes, but you should not need to do that*
  - When do I control caching and update content pushed from the server vs being requested by client?
    - If the data is static then cache. If it is fluid then get it on the fly.  The interesting thing with the experiments is that if the returned data isn't querried or operated on it loads more slowly. (or appears to)
    - *If you're getting really detailed you can control caching with an http header, but its not necessary.*

  - With help I have a good working knowledge of the promise model of asynchronous programming. There are some interesting issues that arrise when dealing with physical devices attached to the processor. Software timing  and control has to be included in the design of the control elements.

## Naive starting point: Quotes
I have a server file which contains quotes in a text file. I read the file in to a server script and serves pages with a randomly changing choice from the file.
  - Currently this is driven by the client updating the page using a refresh. **Is there a way the server can push this out?**
  - I write all the structural elements directly within the code. **Is this the best way to do this or should the static bits be in a file with the program managing the dynamic elements?** *Yes, Use templates and modify as they are fed through. Consider, if the project gets more complicated, a framework like **koajs** (just an example)*
    - Jury's still out on this one. Getting information back and forth might be a bit tricky but I am now looking at wrtiting code that does requests through fetch calls.  Push tech is still above my paygrade right now.  I am still thinking a simple socket layer would be OK. *Use REST calls not the overhead of sockets*
    - [Methods for transferring data](https://www.c-sharpcorner.com/UploadFile/suthish_nair/different-ways-to-pass-data-between-web-forms/) gives a nice summary of options.
    - Now that I have a handle on the backend communications I have embraced POST as the means to transfer information from the client to the server. REST calls are nice but I can hide much of the messy details using POST of stringified JSON.

## Growth
Now that the work infrastructure is better developed pay attention to how the `eslinter` and `eslint-prettier` do their job. They will provide internal on the fly documentation.

## REST call experimentation
remarkably easy parsing of query portion of url. Started with <abbr title="import * as querystring from 'node:querystring';">`querystring`</abbr> knowing it was legacy (I saw why immediately because the first term doesn't get the `?` stripped off.)  I moved to <abbr title="import * as url from 'node:url';">`url`</abbr> which produces a nice json structure from the response.

Next trick is to move this to the Rasp $\!\pi$.
> side note, works well from phone, not unexpected.

## Setup
I have to move between many platforms and machines I just want to outline the tool chain for things needed or suggested so I can unify the operations.
  - Load the latest version of node
    - use [Latest Version Installer](https://github.com/nodesource/distributions/blob/master/README.md#debinstall) *don't cowboy `apt install` as it may be behind the curve without proper updating*
    - the above usually includes installation of <abbr title="node package installer">`npm`</abbr>  check versions
    - get <abbr title="node version manager">`nvm`</abbr> using: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
  - setup vsCode by installing the `eslint` add-on
  - install typescript `sudo apt install node-typescript`
  - use `npm i` to update dependancies
  - [Get the i2c](https://www.npmjs.com/package/i2c) libraries

Test connection to the pizero with `http://raspzero01.local:8080/`

## Hardware Notes
The device consists of 2 servo motors arranged in a way as to control the azumuth and assension of a platform to which is attached a laser pointer. All devices respond to $I^2C$ commands. Fortunately on the $\Pi$ there are node libraries that make this easy to control.

### **Laser peripheral**
DEVICE ADDR 0x14
>  v1.0 treated the control infrastucture as if it were command $\rightarrow$ instruction. This isn't standard protocol for $I^2C$.

>  v2.0 refactored all the firmware to look more like the usual internal address $\rightarrow$ data.
>> internal address 0 $\rightarrow$ 7 reset<br/>
>> internal address 1 $\rightarrow$ 1|0 on/off<br/>
>> internal address 2 $\rightarrow$ 0-255 intensity<br/>
>> internal address 3 $\rightarrow$ (0|1|2 mode $\ll$ 4) | (0-9 period)

All internal addesses except for 0 are R/W. The hardware project has served as a model for how to design an [I2C peripheral using an attiny85](https://github.com/pbeeken/attiny-I2CPeripheral).

### **Servo peripheral**
DEVICE ADDR 0x40 (0x70 global commands only)
Driven using the PCA9685 chip. Sparkfun has a carrier board for this and developed a nice toolkit for talking to it.  ArduCam sells a nice 2D servo motor pointing platform based on this chip as well. This chip can control up to 16 PWM pins with different frequencies.  The chip that is installed in the ArduCam only has 4 wired up (two are reserved for other hardware).  The only ones that work for us are internal address 0, and 1.  Looking at the c code I was able to implement the control functions in node.

### **Software details**
We have a nice interface (though utilitarian) for the laser. It is time to build it our to control the direction.
