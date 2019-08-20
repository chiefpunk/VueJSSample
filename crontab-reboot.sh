#npm run forever
export NODE_ENV=production 
export PATH=/usr/local/bin:$PATH
cd /home/ikongps/dealercampaign/cm-web || exit
forever start -a --minUptime 1000 --spinSleepTime 2000 --uid campaign-cm-web server/index.js
