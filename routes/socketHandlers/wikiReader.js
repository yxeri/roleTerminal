require('request').get('http://wiki.bbreloaded.se/api.php?action=query&prop=revisions&rvprop=content&rvlimit=1&rvparse&format=json&titles=Water_Federation', (err, response, body) => {
  if (err || response.statusCode !== 200) {
    console.log('Error request', response, err);

    return;
  }

  const wikiQuery = JSON.parse(body).query;
  const wikiBody = wikiQuery.pages[Object.keys(wikiQuery.pages)[0]];

  console.log('Title:', wikiBody.title);
  console.log(wikiBody.revisions[0]);
});
