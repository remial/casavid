casavid

Steps from Framework
1. Cleanup non useful SaaSFramework pages and tidy Navbar. Remove GTags and MetaTags from layout and success page. Empty Blog posts and blog images
2. npm install
3. go through pages and correct red links with manual install (if lots of red lines on div etc, might need to  npm install --save @types/react @types/react-dom)
4. Create firebase store 
5. Populate .env data (the first 2 are from https://console.cloud.google.com/ (use create credentials at the top (OAuth Client ID) and fill uri and callbacks. you'll get the 2 after create), while the rest are from firebase. After you register your app as a web app)> For email and key .env go to console.cloud.google.com "Service Accounts" Keys. Create new keys as json
6. Edit what users see when they click continue with google (https://console.cloud.google.com/apis/credentials/consent)
6b. In Firebase (where database, storage bucket etc will appear) go to project setting and add web app. Copy the config to firebase.ts
7. Edit Firebase database settings and Storage stettings to allow writing
8. Get the 2 API keys from stripe and fill
9. Go through code and update price id
10. Update src/config/stripe with new price ids, name change?
11. Edit Pricing/page.tsx to reflect any name change
12. Install the Stripe firebase extension (not the stripe official one)
13. Setup webhook in stripe and connect to firebase extenstion
13a. Edit api/webhook and skip to 21
13b. Initialise firebase functions in the project folder using firebase init functions
14. Setup firebase functions. cd to Project Folder, then firebase init functions; firstname = project name, second name = functions. If there's need to restart, make sure to delete firebase.json
15. Edit index.ts to https://github.com/remial/framework-saas/blob/master/app/_functionbackup/index.ts (Remove logs if still there)
16. Check and edit credit update logic in index.ts
16b. npm install stripe inside the functions folder
***Probably advisable to go Live on stripe here***. getsecrets for the two functions set
17. on the Command line firebase functions:config:set stripe.secret="<YOUR_STRIPE_SECRET_KEY>" (Use restricted key rk_ for this one.)
18. Then, firebase deploy --only functions (make sure region is same as region of other functions)
19. Copy function address from firebase and use as webhook endpoint on stripe listening for checkout.session.completed and invoice.payment_succeeded
20. Copy the stripe webhook secret and on the Command line firebase firebase functions:config:set stripe.endpointsecret="your_stripe_endpoint_secret"
21. Then, firebase deploy --only functions (again, to make the change take effect)
21b. Chek public folder and update sitemap and robots files.
22. npm run lint to check any pre-deployment message
23. Deploy to vercel. Pick a .vercel.app name that's the name of your website (for ease later)
24. Update google authentication links and redirect uri (https://console.cloud.google.com/apis/credentials?project=<yourproject>)
25. Create Live stripe products
26. Update your stripe product ids with the Live ones in src/config/stripe.ts
26b. change the "const priceId = planDetails?.price.priceIds." line in the pricing page to production
26c update vercel with your live stripe keys
27. Hook vercel to Live website
28. In Firebase, delete test customers
29. In Firebase Add Live website to authorised domains in Authentication > Settings



Setting up a Digital Ocean Server
1. Create droplet
2. View droplet console
3. Update package list
sudo apt update
sudo apt install -y build-essential curl
4. Install Node.js (check current version if bigger than 24)
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
5. Verify node and npm
node -v
npm -v
6. Install ffmpeg? if needed.
sudo apt update
sudo apt install -y ffmpeg
7. Verify ffmpeg
ffmpeg -version
8. If api has to call firebase, install firebase admin SDK 
mkdir ffmpeg-api
cd ffmpeg-api
npm install firebase-admin
9. Make a directory to create firebase
mkdir -p /root/firebase
cd /root/firebase
Then open...
nano firebase-admin-sdk.json
Copy and paste firebase admin json contents (e.g. vidnarrate-1a0...(.json) content) to ...
(Write and Exit, is that Ctrl O then Ctrl X? verify that it's true)
10. install all code dependencies e.g.
npm install express multer fluent-ffmpeg node-fetch uuid
11. Create api directory
mkdir -p /root/ffmpeg-api
cd /root/ffmpeg-api
Open server.js with nano server.js
copy and paste api code into it. (Make sure api code first few rows start with "import" not const xxx = require('***'))
(Write and Exit, is that Ctrl O then Ctrl X? verify that it's true)
11.b Might need to open package.json and add "type": "module",
e.g.
{
  "name": "ffmpeg-api",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.19.2",
    "firebase-admin": "^12.4.0",
    "fluent-ffmpeg": "^2.1.3",
    "multer": "^1.4.5-lts.1",
    "node-fetch": "^3.3.2",
    "uuid": "^10.0.0"
  }
}

12. Navigate to project directory
cd /root/ffmpeg-api
13. Start server
node server.js
(If all is okay, you should see output like... FFmpeg API running at http://localhost:3000)

-------------------PM2 -----------------

14. VERY VERY OPTIONAL PM2 to keep server running (CAN IGNORE)
npm install -g pm2
pm2 start server.js
Use pm2 list to see the running processes, 
and pm2 logs to see the logs.
pm2 stop my-ffmpeg-api (or name of api) to stop the process
pm2 delete my-ffmpeg-api (or name of api) to delete the process
pm2 flush to clear the logs

edits
pm2 list to see running server
pm2 stop server
cd /root/ffmpeg-api
nano server.js
make changes


CREATING A SCHEDULER


nano .env
Copy the contents of your local .env file and paste them here. Press Ctrl + O to save and Ctrl + X to exit.

Create ecosystem.config.js:


nano ecosystem.config.js
Copy the contents of your local ecosystem.config.js file, paste them, then save and exit.

Create firebaseConfig.js:


nano firebaseConfig.js
Copy and paste the contents of your local firebaseConfig.js file, then save and exit.

Create your-schedule-scripts.js:


nano your-schedule-scripts.js
Copy and paste the contents of your local your-schedule-scripts.js file, then save and exit.

Create scheduledTasks.js:


nano scheduledTasks.js
Copy and paste the contents of your local scheduledTasks.js file, then save and exit.

Install Dependencies

Run the following commands to initialize a new package.json file and install the necessary dependencies for the scheduling code:


npm init -y
npm install dotenv firebase-admin node-cron axios
Ensure Firebase Admin SDK Configuration

Make sure your Firebase Admin SDK credentials are stored in the appropriate place. If you’re using a service account key (e.g., firebase-admin-sdk.json), ensure it's stored in /root/firebase. Double-check the .env file to confirm the correct project configuration.

Start the Scheduler Using PM2

To start the scheduling job with PM2, run the following command inside /root/SchedulingCode:

pm2 start ecosystem.config.js
Check the Running PM2 Processes

Use the following commands to manage and monitor your PM2 processes:

List running processes:

pm2 list
View logs for the scheduler:

pm2 logs scheduler
Auto-Start Scheduler on Reboot

To ensure that the scheduling job restarts automatically after a system reboot, run the following commands:

pm2 startup
pm2 save


Starting scheduler:
cd /root/SchedulingCode
pm2 start ecosystem.config.js

-------------CURRENT SERVERS------
pm2 stop all
pm2 delete all
pm2 start /root/ffmpeg-api/server.js --name ffmpeg-api
pm2 start /root/SchedulingCode/ecosystem.config.js --name scheduler
pm2 start /root/puppeteer-api/server.js --name puppeteer-api
pm2 start /root/stitch-api/server.js --name stitch-api







