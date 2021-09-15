# The Maintenance Sheet
## Clipit News

_Note: this code serves solely demonstrative purposes._

At Clipit News we scraped newssources using XSL templates. If generic, smart templates to achieve this did not work, we had to resort to writing XSL templates specifically for that particular newssource. There were quite a lot of these newssources, which meant a lot of maintenance.

### The workflow before
Before I interfered, the workflow was really tedious:
1. You open the error log of the web scraping application, so that you have a list of websites for which scraping failed and thus maintenance is necessary.
2. You paste these newssources into a Google Sheet, so that developers could distribute the work and make transparant what they were doing.

It was nice to have a central place where we could see in real time what we were claiming and fixing, but having to manually update this list every day was very tedious and error-prone. Also, among other things, there were many errors that we knew about and could actually ignore.

### The improvement
So, I wrote this script you are looking at here to achieve those two desired features. It is written in Google Apps Script, in the _Script Editor_ in the Google Sheet. What it does in summary:

1. It retrieves the error log of the scraping application automatically.
2. It applies filters to make sure only revelant errors remain in the list. Adding a filter is as easy as adding a filter function to the `Filter` object.
3. It updates the sheet with the new work.
4. It also provides handy UI features such as automatically graying out rows if the corresponding newssource has been fixed.

Also, to make it accessible to some of the less experienced users, I tried to make as much configurable through easy `Config.gs` settings as possible.

### Notes
* I have anonimized the code completely, so all possible kinds of sensitive information have been replaced by dummy data.
* This code is from 2016, so naturally it doesn't use the most modern of language features. Also, the Google Apps Script language and the Google Sheets API limit you in what you are able to do.
* This is purely demonstrative and it is not indended nor necessarily expected to run.
