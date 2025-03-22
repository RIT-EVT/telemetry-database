# Hello and welcome to ramp up!

The purpose of this document is to walk you through and give you an understanding of the things we do here on EVT's telemetry database team.

By the end of rampup you will have:
1. Created a new React project.
2. Gained an understanding of basic front-end development (very basic).
3. Connected a front-end application to back-end logic.
4. Implemented a RestAPI to standardize interactions between front and back-end components.
5. Dissected .MF4 files using .DBC files (Don't worry I don't know what they stand for either)
6. Manipulated data from Controller Area Network (CAN) messages (it is less scary than it sounds I promise)

This is a basic idea of the things we do here and after you have completed the tasks described below you should be ready for anything the DB team throws at you.<br>
Or at least equally as ready as anyone else...<br>

### Part 1

Part 1 of rampup is all about setting up your environment.<br>
First we have to install a bunch of dependencies. This is painful and not fun and usually the part I hate most about projects (because it is boring.) Just bare with me and we will get through it together.

#### If you do not have Nodejs or do not know what that is:

##### Node JS Download
The first step is to install Node JS if you do not already have it installed.<br>

For Windows computers, execute the following commands:

`winget install Schniz.fnm`<br>
You will need to close and reopen your terminal before executing the rest<br>
`fnm env --use-on-cd | Out-String | Invoke-Expression`<br>
`fnm use --install-if-missing 20`<br>

For Mac and Linux, execute the following commands:

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash`<br>
You will need to close and reopen your terminal before executing the rest<br>
`nvm install 20`<br>
<br>
<br>
Verify your install on any platform by running:<br>
`node -v`<br>
`npm -v`<br>

#### After setting up Nodejs: 

You can chose to follow what is written on this page or you can follow the official [reactstrap guide](https://reactstrap.github.io/?path=/story/home-installation--page). <br>

1. Create a new folder somewhere in your files for us to clone a repository into. This is where your EVT work will live so make it somewhere easy to get to.
2. To start open the IDE of your choice (we typically use Visual Studio Code but if you have a different preferred one be my guest.)
3. Open up a terminal/command line and navigate to the folder we just made. If you are unfamiliar with the terminal or command line take a look at [this.](https://www.freecodecamp.org/news/command-line-commands-cli-tutorial/) You are looking for information on directory navigation.
4. Now that we are in the proper folder we can clone the project. The github page you are reading this on will help.
5. Navigate to the main page of the github repo and click the green button that says "< > Code". Make sure the middle option "SSH" is picked.
6. Click the copy button and return to your command line.
7. In the cmd write the following: `git clone ` then paste the copied text and hit enter.
8. Congrats you have cloned the repo. At this point it is customary to stand up, raise your hands above your head and say "I have cloned the repo!"
10. Now enter the rampup folder in your code. If you do not do this it will definitely break things...
11. Run the following command `npx create-react-app rampup-client`. This will create a new react folder called rampup-client and should take a little while sit back and chat with your neighbor if they don't smell too bad.
12. In the cmd write the following: `npm install reactstrap react react-dom` This will install the npm depenencies we use for development. This can take a while. When it tells you we have vulnerabilities... no we dont (don't worry about it these are expected).
13. Next run this command `npm install --save bootstrap`.
14. In the new rampup-client folder navigate to the index.js file and add this to the top with the other imports `import 'bootstrap/dist/css/bootstrap.min.css'`
15. You have officialy set up your react project, great job! Similar to before you may now stand up, raise both hands once more and say "I have finished Part 1 of rampup!" and someone will come over to check your work.

Reactstrap is the love child of two popular front-end development tools: React, and Bootstrap. Experience with either of these is helpful but certainly not needed.




