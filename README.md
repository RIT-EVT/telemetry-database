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

This react-strap based website is responsible for gathering all the context relating to the data we gather.<br>

Ideally, mechies will just download the files and run it on their computer. This includes running both the website and backend api that goes along with it.<br>

In the future, I hope to host at least the backend restful api, and eventually the website itself, on a web server, but that is not going to happen for a long time. To anyone that works on this in the future, if this message is still here, that means I never went back and fixed the mess I made, and for that I sincerely apologize for. This was meant to be quick and dirty, but I attempted to follow best practices and self document the code where I could. <br>

### Download Instructions


#### Node JS
The first step is to install Node JS if you do not already have it installed.<br>

1. Follow the download instructions found here [Node JS](https://nodejs.org/en/download/package-manager)
2. Verify download by running `npm --version` or `node -v`<br>

After Node JS has been installed, clone this repo onto your computer. If you have installed, open the project in VS Code. If you don't have in installed, just follow along in the command window. <br>

#### Running the Website

In the terminal, `cd` into the `~...\Telemetry-Database\TelemetrySite\client` folder and run the command `npm install`. <br>

Once that has finished running, run the command `npm start`. This should start the website, and should display an error saying the server is offline. If your website didn't start, check that you are in the correct folder and you installed Node JS. <br>

After your sever is online, make sure you keep that terminal open. **Closing that terminal for any reason will kill your website**.<br>

#### Running the Server

Open a new terminal and `cd` into the `~...\Telemetry-Database` folder. Run the command `pip instal -r requirements.txt`. <br>

If `pip` isn't being recognized, run `python -V`. If python isn't recognized, download the installer here [Python][(https://www.python.org/downloads/)] and make sure you click **Add as environment variable**.<br>

If you are using VS Code, or some other Python compiler, compile and run the **server.py** file. Your server should now be online. <br>

If you don't have a compiler installed, in your terminal `cd` into the `~...\Telemetry-Database\TelemetrySite\server` folder and run `python .\server.py`






