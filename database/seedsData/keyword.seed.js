const fs = require('fs');
const csv = require('csv-parser');

const campaigns = [];
const domains = [];
const keywords = [];

// Read campaigns from CSV
fs.createReadStream('./csv/campaigns_rows.csv')
  .pipe(csv())
  .on('data', (row) => {
    campaigns.push(row);
  })
  .on('end', () => {
    // Read domains from CSV
    fs.createReadStream('./csv/domains_rows.csv')
      .pipe(csv())
      .on('data', (row) => {
        domains.push(row);
      })
      .on('end', () => {
        // Generate keywords based on campaigns and domains
        campaigns.forEach((campaign, campaignIndex) => {
          devices = []
          if (campaign.devices === 'both') {
            devices = ['desktop', 'mobile']
          } else {
            devices = [campaign.devices]
          }
          domains.forEach((domain, domainIndex) => {
            if (domain.campaign_id !== campaign.id) {
              return;
            }
            for (let keywordIndex = 0; keywordIndex < 50; keywordIndex++) {
              const keywordId = campaignIndex * domains.length * 50 + domainIndex * 50 + keywordIndex + 1;

              // Generate history with approximately 20 entries
              const history = {};
              let maxPosition = 100;
              for (let i = 0; i < 20; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const positionValue = Math.floor(Math.random() * 100);

                // Format date to "yyyy-mm-dd hh:mm:ss"
                const formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);
                // Ensure the date is a string key in the history object
                history[`"${formattedDate}"`] = positionValue;

                if (positionValue < maxPosition) {
                  maxPosition = positionValue;
                }
              }

              for (const device of devices) {
                keywords.push({
                  domain_id: domain.id, // Assuming domain CSV has an 'id' field
                  keyword: `keyword_${domain.id}_${keywordIndex}`,
                  device: device,
                  country_code: campaign.country_code || ['VN', 'US', 'UK'][Math.floor(Math.random() * 3)], // Assuming campaign CSV has a 'country_code' field
                  language: campaign.language || ['Vietnamese', 'English'][Math.floor(Math.random() * 2)], // Assuming campaign CSV has a 'language' field
                  added: new Date().toISOString(),
                  position: maxPosition,
                  volume: Math.floor(Math.random() * 1000),
                  sticky: Math.random() < 0.5,
                  history: history,
                  last_result: JSON.stringify([]),
                  url: `http://example.com/${keywordId}`,
                  tags: JSON.stringify([]),
                  updating: Math.random() < 0.5,
                  last_update_error: JSON.stringify({}),
                  sc_data: new Date().toISOString(),
                  uid: `uid_${keywordId}`,
                  city: `City ${keywordId}`,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              }
            }
          });
        });

        console.log('Keywords generated:', keywords);
        // change json keywords to csv keywords
        const csvKeywords = keywords.map(keyword => {
          // Convert the history object to a JSON string and wrap it with additional double quotes
          const historyJson = `"${JSON.stringify(keyword.history)}"`;
          // Replace the history object with its JSON string representation
          return Object.values({ ...keyword, history: historyJson }).join(',');
        });
        // add header to csv keywords
        csvKeywords.unshift('domain_id,keyword,device,country_code,language,added,position,volume,sticky,history,last_result,url,tags,updating,last_update_error,sc_data,uid,city,created_at,updated_at');

        // Write keywords to a csv file
        fs.writeFile('keywords_rows.csv', csvKeywords.join('\n'), (err) => {
          if (err) {
            console.error('Error writing to file', err);
          } else {
            console.log('Keywords successfully written to keywords_rows.csv');
          }
        });
      });
  });
