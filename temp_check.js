const checkLiveSite = async () => {
  try {
    const htmlRes = await fetch('https://aitycoon.in/');
    const html = await htmlRes.text();
    
    // Extract the JS bundle URL
    const jsMatch = html.match(/\/assets\/(index-[^\"']+\.js)/);
    if (!jsMatch) {
      console.log('No JavaScript bundle found in the HTML!');
      return;
    }
    
    const jsUrl = 'https://aitycoon.in/assets/' + jsMatch[1];
    console.log('Fetching live bundle:', jsUrl);
    
    const jsRes = await fetch(jsUrl);
    const jsContent = await jsRes.text();
    
    // Fast check for GET Method or URLSearchParams
    if (jsContent.includes('method:"GET"') || jsContent.includes('URLSearchParams')) {
      console.log('\n✅ SUCCESS: The live website has successfully updated to use the new GET request!');
    } else {
      console.log('\n❌ FAILED: The active JavaScript file is still using the old POST method. GitHub Pages is still caching the old version.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

checkLiveSite();
