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
[Entity Relationship Diagram](https://lucid.app/lucidchart/ff611a92-9484-4606-a11d-d142f54ee428/edit?viewport_loc=-2095%2C-830%2C4919%2C2456%2CMMHz0DLYv6yU&invitationId=inv_5c98f0bf-e268-4e23-afe7-0b5b771f8459)
