# Telemetry Database

## Welcome

If you are reading this you are prolly pretty cool. I likely saved you from doing firmware or you were extra cool and asked to be on the database team to begin with. Do not fret those firmware losers aren't having fun anyways.<br>

Please excuse my inablity to create something that isn't laced with immense quantities of sarcasm, I hope that it only makes it more fun to get through this readme.<br>

This is the repository for the Telemetry Database project for EVT. A little backstory, we previously stored all of our data in MF4 files(Don't worry if you don't know what that is, neither did I). These files were then converted to .mat files (Eww; Matlab bad) for parsing. From there we would pretend that we used the data stored in those files but in reality they would sit and we would eventually lose them.<br>

---

This database has a few goals:

- Data Retention
  - As a "small" team we **CANNOT** afford to lose what little data we get.
  - We want to build a backlog of data so we can look back and compare, learn, and ✨*grow*✨!
  - Also, I have pipe dreams of automated fault detection and that requires a lot of past data.
- Data Analysis
  - Data is a beautiful thing and can point us to problems and new ideas otherwise invisible to us.
  - Running diagnostics on our data can help find mechanical issues with our bikes.
  - Again, pipe dream, I want to have data streamed live from the bike to the database so we have a live feed of the state of the bike.
- Ease of Access
  - Prior to any database set up, you had to give away your right arm and first born to get any of our data.
  - Providing the database will give the MechEs and the Integration team greater access to data which (allegedly) they need.

---

## Documentation

The documentation for this system will be provided anywhere I can put it but I would like for this readme to have everything we could ever want or need.<br>
<br>
This should at **minimum** include the Entity Relationship(ER) Diagram, Data Definition Language(DDL) Diagram, and the Reduction to Tables document.<br>
<br>
To the poor soul who takes my place; I beg of you, keep this up to date. It will be so much cooler when I put it on my resume and show it to future employers.<br>
<br>

Entity Relationship Diagram:<br>
I want to move this off of Lucid Chart but for now there it shall lie.<br>
[Entity Relationship Diagram](https://lucid.app/lucidchart/ff611a92-9484-4606-a11d-d142f54ee428/edit?viewport_loc=-2095%2C-830%2C4919%2C2456%2CMMHz0DLYv6yU&invitationId=inv_5c98f0bf-e268-4e23-afe7-0b5b771f8459)<br>

[Reduction to Tables](https://docs.google.com/document/d/1Dq0fAyz-GOTDRLL4TS9-DYxf0agS83yGcmjXoaB-jjU/edit?usp=sharing)<br>

[Software Design Document](https://docs.google.com/document/d/1QV6rSz8Uj5yaqdDihSC-XkMlvNX5aUmDrTravnWL-ts/edit?usp=sharing)<br>



## Data Upload Script

The script which is responsible for streaming the raw CAN data into the database.<br>

Currently to use the script run main and when prompted input the path to the .mf4 file you want to have uploaded.<br>

As we do not have means to collect context data yet, we use a dummy context with an id of 1. This is gross and bad. We will be removing that as soon as we have a way to query the user for context data.<br>

## Web UI 

This react-strap-based website allows users to input context and configuration information and to upload CAN data files.<br>

Ideally, MECE's will just download the files and run it on their computer. This includes running both the website and backend api that goes along with it.<br>

In the future, I hope to host at least the backend restful api, and eventually the website itself, on a web server, but that is not going to happen for a long time. To anyone that works on this in the future, if this message is still here, that means I never went back and fixed the mess I made, and for that I sincerely apologize for. This was meant to be quick and dirty, but I attempted to follow best practices and self document the code where I could. <br>

## RESTful API

The RESTful API is built with Python using Flask. <br>

Someday, this will be hosted on a central server, but for now it runs locally. To run this application, see directions below under **Running the Server**. <br>

For any future developers, standard practices should be followed when building this API. This includes separating calls into different classes and using the `GET`, `PUT`, `POST`, and `DELETE` calls correctly. Additionally, any changes to the url path for a call should be updated in the ServerPath.json file.

### Download Instructions


#### Node JS
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

After Node JS has been installed, the next step is to clone the repo and all needed components. <br>

Open your command terminal and 'cd' into the desired folder location and run the following commands <br>

`git clone https://github.com/RIT-EVT/telemetry-database.git` <br>
`npm install react`<br>
`npm install reactstrap` <br>

If you have it installed, you can use VS Code to open the project. If you don't have it installed, just follow along in the command window. <br>

#### **Running the Website**

In the terminal, `cd` into the `~...\Telemetry-Database\TelemetrySite\client` folder. Once there, run the following commands: <br>

`npm install`<br>
`npm start` <br>

If your website didn't start, check that you are in the correct folder and you installed Node JS. <br>

After your sever is online, make sure you keep that terminal open. **Closing that terminal for any reason will kill your website**.<br>


#### **Running the Server**

Open a new terminal and `cd` into the `~...\Telemetry-Database` folder. <br>
Run the command `pip install -r requirements.txt`. <br>

If `pip` isn't being recognized, run `python -V`. If python isn't recognized, download the installer here [Python](https://www.python.org/downloads/). Python should add itself as environmental variable automatically, but you may need to click **Add As Environmental Variable** on the last page before you close the installer.<br>

In your terminal `cd` into the `~...\Telemetry-Database\TelemetrySite\server` folder and run `python .\server.py`

#### **.env File**

In order to connect to the database, you must contact one of the database leads for the .env file.<br> 

Once they have sent it to you, place it in the `~...\Telemetry-Database` folder in a file names **credentials.env**.

> **WARNING**

>**.env files should never be shared or the contents sent anywhere without the Firmware Team's permission** <br>
>**DO NOT ADD credentials.env TO GIT**