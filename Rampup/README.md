# Hello and welcome to ramp up!

The purpose of this document is to walk you through and give you an understanding of the things we do here on EVT's telemetry database team.

By the end of rampup you will have:
1. Created a new React project.
2. Connected a front-end application to back-end logic.
3. Implemented a RestAPI to standardize interactions between front and back-end components.
4. Dissected .MF4 files using .DBC files (Don't worry I don't know what they stand for either)
5. Manipulated data from Controller Area Network (CAN) messages (it is less scary than it sounds I promise)

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

1. Create a new folder somewhere in your files for us to clone a repository into name it Rampup.
2. To start open the IDE of your choice (we typically use Visual Studio Code but if you have a different preferred one be my guest.)
3. Open up a terminal/command line and navigate to the folder we just made. If you are unfamiliar with the terminal or command line take a look at [this.](https://www.freecodecamp.org/news/command-line-commands-cli-tutorial/) You are looking for information on directory navigation.
4. Now that we are in the proper folder we can clone the project. In your github create a new repository. We are making a classic ToDo list so name it thusly.
5. I recommend making this project public as recruiters love to see project history. I also recommend using a personal email for this as you will not want your school email hooked up to your personal git repo forever (I made this mistake and it makes me sad).
6. Navigate to the main page of the github repo and click the green button that says "< > Code". Make sure the middle option "SSH" is picked.
7. Click the copy button and return to your command line.
8. In the cmd write the following: `git clone ` then paste the copied text and hit enter.
9. Congrats you have cloned the repo. At this point it is customary to stand up, raise your hands above your head and say "I have cloned the repo!"
10. Before we go any further, lets setup your local branch, in your console, type `git checkout rampup` followed by `git branch my_special_project`. One more step, type `git checkout my_special_project`.
11. Now create and enter a folder named rampup. If you do not do this it will definitely break things... (You can make this wherever you want, but I would recommend entering the Rampup folder first)
12. Run the following command `npx create-react-app rampup-client`. This will create a new react folder called rampup-client and should take a little while sit back and chat with your neighbor if they don't smell too bad.
13. In the cmd write the following: `npm install reactstrap react react-dom` This will install the npm dependencies we use for development. This can take a while. When it tells you we have vulnerabilities... no we don't (don't worry about it these are expected).
14. Next run this command `npm install --save bootstrap`.
15. In the new rampup-client folder navigate to the index.js file and add this to the top with the other imports `import 'bootstrap/dist/css/bootstrap.min.css'`
16. You have officially set up your react project, great job! Similar to before you may now stand up, raise both hands once more and say "I have finished Part 1 of rampup!" and someone will come over to check your work.

### Part 2
#### Starting off
ReactStrap is the love child of two popular front-end development tools: React, and Bootstrap. Experience with either of these is helpful but certainly not needed.<br>
For Part 2 we will be creating some very simple front end code to familiarize you with ReactStrap please refer to the ReactStrap documentation [here.](https://reactstrap.github.io/?path=/story/home-installation--page)<br>

To begin we will be making a simple tv color screen using Rows and Cols your screen should look like this:
![TV color bars](https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/SMPTE_Color_Bars.svg/1200px-SMPTE_Color_Bars.svg.png)<br>
To do this we will edit the code in App.js. Remove all of the code in there between the parent divs. Create a grid of Cols and Rows then style them to change their sizing and background colors. Don't worry too much about exact coloring we just want something that is recognizable.<br>

To run your site run the command `npm start`. The libraries we use are super cool and allow us to make changes to our sites live simply make the changes in your code. This is a very helpful thing to keep in mind when making changes to get it "just right."<br>

Once you have made something that you feel is good call a senior member over and they will review what you made and let you know how to proceed. <br>

#### Time For More Fun!
Now we will be making that planner I was talking about earlier.
1. Create a new folder in the base directory of your project (navigate until you are in the Rampup folder you made at the beginning of this).
2. We are going to repeat the process from steps 10 - 15. Just use different names for the folders and project names. This is where the ToDo list will be so name it accordingly.
3. You are welcome to style this in any way you want so long as you meet these requirements:
    1. TODO items are displayed in an organized manner with a title, description, and a checkbox that allows you to select it.
    2. There is a method by which to Add, Edit, Complete, and Delete TODOs.
    3. I do not expect the changes to perpetuate when you reload the page we will make that happen when we hook up the backend.
    4. Bonus points if you can reorder the TODOs but this is not required.
4. If you want to follow a more standardized template you can make your page look like this:
![image](https://github.com/user-attachments/assets/32830620-639c-4323-bf04-c9c7e9f14eee)
5. This section may take a while especially if you have not used React before, we are happy to help so ask questions and break things. Front-end involves a lot of experimentation and niche messaging boards from 6+ years ago where someone had the same problem you did, solved it, then did not explain further.
6. Once you have something that meets the requirements call over a senior member and we will take a look. 

### Part 3
#### Now, the backend
A lot of our work on the database team is backend engineering. The front end is important as it provides a means to interact with things but since only EVT members will be looking we aren't *too* concerned with if it looks beautiful. (This is a cry for help, if you like front-end please make our site look pretty).

For the backend section we will be continuing work on the front-end project we began in Part 2.
We will be completing the following:
1. Setting up a local hosted MongoDB server (sounds scarier than it is)
2. Migrating the TODOs to be stored in the local hosted MongoDB
3. Use RestAPI calls to manage TODOs in the database (this can be scary but is so so cool)

Before we get started lets do some learning time:
##### Databases (DBs)
What is a database? If you ask most mechies, they will say a google drive with files named bike_run_test_201831.mf4. This is in fact NOT a database and is also the reason we exist as a team.<br>
<br>
A database is a place where we can (usually remotely) store data in an organized manner such that any number of people can access and manage it.<br>
There are two major types of databases: Relational and Non-Relational.<br>
<br>
Historically, relational DBs have been very popular but recently have been overtaken by Non-Relational DBs<br>
<br>
A relational database typically correlates a series of values with an object. For instance a student in a school database might have information about their grade, name, and student id. These values would be stored in a table and each student would be given an assigned (and hopefully single value) for each field.<br>
<br>
Relational databases require structured data schemas and will break if you do not follow them this makes them very fast at the expense of flexibility.<br>
<br>

A non-relational database is a little different instead of tables, data is stored in "documents". A document is a fancy way of saying a (or many) massive json files.<br>
<br>
At EVT we use non-relational databases because of our unique data structure and need for flexibility.<br>
<br>
Non-relational DBs are used for large amounts of either unstructured or unpredictable data (we tend to fall in the unpredictable group).<br>
<br>
If you are interested in learning more about these DB structures I recommend reading [this](https://www.mongodb.com/resources/compare/relational-vs-non-relational-databases) post by MongoDB.<br>
<br>
Admittedly, a non-relational DB is probably a terrible method to manage TODO lists as they are predictable and usually well structured but this is the rampup for EVT so we want you to learn what we do and how.<br>
<br>
##### Getting started
1. To start this off you will need to install MongoDB on your computer. Do so at [this link](https://www.mongodb.com/docs/manual/installation/)
2. You will also want to install Studio 3T, a program used to view and manage non-relational DBs. Install that at [this link](https://studio3t.com/free/). Make sure to enable cookies because they will not let you breathe on that website without them.
3. Now that the things we need are installed we need to create the server side of our application. Make a new folder at the same level as the client folder and name it server.
4. Within the server folder create a file and name it server.py. In the Rampup folder of the EVT github there is is a file also called server.py. You can copy paste that into your new file.
5. You will also need to copy the requirements.txt from the Rampup folder into your own then in the terminal run `pip install -r requirements.txt`. If you run into problems with this it is likely a versioning issue with your Python. You may need to manually call `pip install <library name here>`
6. Your server logic will have one endpoint but with 4 methods "GET", "PUT", "POST", "DELETE". Some wack jobs will tell you to add "PATCH", the proper response is to smile, wave, nod your head and pretend to listen. They are in enough pain as is, no reason to make it worse.
7. Each of these methods maps to a different general goal
   1. GET is focused on retrieving data from the server but not modifying it in any way. THERE ARE NO BODIES IN A GET CALL 💀. (Terrifying out of context)
   2. PUT allows us to modify data in the server/DB
   3. POST is used to send new data objects to the server/DB
   4. DELETE is used to remove data objects from the server/DB 
8. Note, there is literally nothing holding you to upkeeping these rules but I *BEG* you to follow them lest yee be judged harshly
9. Lets start by making our endpoint:
    1. Take a look at the sample endpoint that was provided ours will look very similar
    2. Create a new endpoint, following the design of the sample but name it "todo_manager" and with the 4 methods listed above in the methods array
    3. Your function name SHOULD match the endpoint name and you will want to include the if statements to check each of the methods.
10. Now comes the actual logic. We will start with the GET.
11. To turn your server on, cd into the folder with sever.py and run `python .\server.py`

#### GET

As stated above, a get request needs to get data (duh), so for our purposes we're going to use it to get all the events the user currently has to do. 
<br>
To save yourself a headache later, I would recommend setting up a way to test your queries outside of a server (test.py) so you can easily print the results. To actually establish a connection to the db, checkout `create_db_connection()` in server.py
<br>
1. Make the get request (follow format in the example server.py)
2. Build your query. Check out [this link](https://www.mongodb.com/docs/manual/reference/method/db.collection.find/) for help building a query. You may also want to familiarize yourself with how collections work
3. Return all data found in the collection along with code 200 (See [this link](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) for http response code info)
4. As of now, don't worry to much about how the front end receives the data, we'll work on that in a minute

#### POST
Now that we have a get endpoint, lets make a POST endpoint. To make this simple, we're going to make each new task be its own document.
<br>
1. Create the POST endpoint if statement in server.py
2. Read incoming data. For this, we're going to use something called request, which is a feature of Flask
3. Format the data how you want it (I would highly recommend some key: pair system)
4. Submit the data to the db
5. Return the new event to the frontend with code 201
 
#### PUT 
We have reached the point where we now want to modify an existing element.
<br>

Per normal comp sci practices, we almost always want to keep all data we are given, so rather than removing a task when the user finish it, we're just going to give it a flag of "Complete". How you actually do this is up to you (but please use a boolean)
1. Create the endpoint in code (you're going to be doing this a lot)
2. Figure out how to identify individual tasks in the db. There are two main ways to do this. Create some id property for each task or use the id number each document has in mongodb.
3. Add a flag to the task
4. Save task and return 200 code

#### DELETE
For this part, we are going to violate the comp sci practice we followed above and actually delete data from the database. 
<br>
We're doing this since you should know how to delete something from a mongo db, but pls pls pls, don't just delete data from our db 😨

1. Create endpoint (last time for now)
2. Identify target for deletion
3. Delete element
4. Return code 204 

<b>CONGRATULATIONS</b>
<br>
You have officially built an api!
<br>
Unfortunately, the work isn't done yet. You still have the fun experience of integrating it with the frontend!
<br>
This process is often as enjoyable as a 8 am math lecture, but it has to be done

#### Putting It All Together

On the frontend, we need to start making some fetch calls to the backend for data. As part of this, you will have to process each request and decide what to do.
<br>
If you don't know what a fetch call is, please refer to [this](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) website for more info.
<br>
From here, all you have to do is set it up so the frontend so it will make the correct request to the backend!
<br>
This is often the part when you have to completely rewrite your api (Oh JOY)!
<br>
But once this is all done, you should have a todo web app that fully functions and can save user information! (Now go post it on linkedin like ever other web dev)

### Part 4

Ok, now that you have a basic idea of how to build a web app and an api, lets move on to how we do our main job... decoding CAN messages!

#### What Is CAN?
Controller Area Network (CAN) is a communication protocol used by most automotive vehicles, including ours. 
<br>
Before CAN, each electric component was connect to each other via individual wires and used different communications protocols. Picture a spaghetti of wires that is different for every vehicle. PURE CHAOS!
<br>
Now picture the beauty of CAN, one high wire and one low wire connecting all the devices onto one network!

![image](https://blog.seeedstudio.com/wp-content/uploads/2019/11/image-158.png)

<br>
Don't worry why there is a 120 Ohm resistor, no one knows why it exists. It just does.
<br>

#### How Does CANA Function?

So CAN allows for communication, but how does it actually function?
<br>
In the case of our bikes, we use CAN to communicate between our boards. Since you are a part of our database team, you should be familiar with the boards we are collecting data on. As of writing this documentation, we have 5 (6?) things we are collecting data from (you'll understand the 6 in a second).

1. BMS - Battery Management System
<br>Controls the battery and reports voltage data 

2. TMS - Thermal Management System
<br>Controls our cooling loop and temperature monitors

3. TMU - Thermocouple Measurement Unit
<br>Reporting temperature data from thermocouples around the bike

4. PVC - Powertrain Voltage Controller
<br>Controls high voltage discharge from battery (ON/OFF)

5. MC - Motor Controller
<br>Controls the motor (duh) and describes power draw and torque output.

6. IMU - Inertial Management Unit (?)
<br>Measures things like acceleration and rotation. Some of our bikes have it and some don't. As a team, we may remove it as well

<br>
<br>
To communicate, each board sends a CAN frame, which sounds fancy, but its just a special order of bits (Don't worry, you won't need to interact with these directly). All CAN frames are saved by our bike and are exported to a .mf4 file for us to read after
<br>
We only care about a few sections of the CAN frame.
<br>

1. Time
<br>How many seconds have passed since the bike started
2. Signal
<br>Name of the message/type (Pack_1_Voltage, Pack_1_Temp, etc)
3. CanId
<br>Unique id for each message type
4. Data 
<br>Value sent. Each can message can send up to 8 bytes/64 bits of data 

<br>
<br>
This sounds super simple right? Well, you're partially right. There is another piece to this puzzle that we haven't talked about yet. 
<br>

#### DBC Files
A DBC file is a fancy little file that tells both the bike and people how to decode different CAN frames. As part of making CAN frames more efficient, they can patrician parts of the bits of their data for certain things. For example, the TMU will send one message, where the first 2 bytes are Temp_0, second 2 bytes are Temp_1, third 2 bytes are Temp_2, and fourth 2 bytes are Temp_3. 
<br>
<br>
The DBC files describes how each CAN frame is formatted, whether the data is signed or unsigned, and which board is sending the message. 
<br>
The good news is, this process is made fairly simple for us. We'll talk about how we do this in the next section

#### Decoding Time!

If I were really evil, I would make you do what we originally did at the beginning of the life of this db. You'd have to decode a mf4 file by looking at the individual bits of data, figure out how to organize them for a SQL database (this was the original plan), and how to decode the DBC file.

<br>
<b>BUT...</b>
<br>

Why would we do that when there is a perfectly good python library to do it for us!
<br>
[asammdf](https://asammdf.readthedocs.io/en/latest/) is the industry standard for doing anything with automotive measurement data and [cantools](https://github.com/cantools/cantools) is my personal preference for decoding the dbc file

I would recommend looking at `.database.load_file` from cantools and `MDF` from asammdf.
<br>

Once you have figured out how to read data, now we get to play with it.

### Part 4

This section is short (I promise).
<br>

For your challenge, I want you to use the decoded data you generated, and parse the list of messages in the form:


    {

        "time": xxx,

        "signal": xxx,

        "canID": xxx,

        "data": xxx,

        "board": xxx,
     
    },

Save the result to a json file and show a member of the database team.
<br>
Remember, some CAN messages send multiple pieces of data in a single CAN message and some data is unsigned, so you need to account for that. If you want more information about what this means, talk to the super cool lead of the Database team for more info.


## You're all done!
And with that, you have finished the rampup!
<br>
It is now customary to walk up to the current head of the club (Magee) and give him a big hug! It is heavily preferred that he's busy when you do this, so don't worry if it looks like he's in an important meeting.
<br>
Just make sure you get checkoff and you're officially ready to start adding your own special touch to our beautiful database.



