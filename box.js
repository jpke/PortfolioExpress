// box.folders.create('0', "newFolder", function(err, data) {
//   if(err) console.log("error: ", err);
//   if(data) console.log("data: ", data);
//   console.log("complete");
// })

// var stream = fs.createReadStream(path.resolve(__dirname, 'Example PDF.pdf'));
//
// box.files.uploadFile('18155048374', "Example PDF3.pdf", stream, function(err, data) {
//   if(err) console.log("error: ", err);
//   if(data) console.log("data: ", data);
// })

// box.files.update("130865866472", {shared_link: box.accessLevels.DEFAULT}, function(err, link) {
//     if(err) console.log("error: ", err);
//     if(link) console.log("data: ", link);
//     console.log("complete");
// })

//   box.folders.get(
//     '0',
//     {fields: 'name,shared_link,permissions,collections,sync_state'},
//     function(err, link) {
//         if(err) console.log("error: ", err);
//         if(link) console.log("data: ", link);
//         console.log("complete");
//     }
// );

// box.folders.getItems(
//     '18155048374',
//     {
//         fields: 'name,modified_at,size,url,permissions,sync_state',
//         offset: 0,
//         limit: 25
//     },
//     function(err, link) {
//             if(err) console.log("error: ", err);
//             if(link) console.log("data: ", link);
//             console.log("complete");
//         }
// );

// box.files.getThumbnail('130861063664', null, function(err, response) {
//
//     if (err) {
//         if(err) console.log("error: ", err);
//     }
//     if(response.file) {
//
//     }
//
//     // if (response.location) {
//     //     // fetch thumbnail from URL
//     // } else if (response.file) {
//     //     // use response.file contents as thumbnail
//     // } else {
//     //     // no thumbnail available
//     // }
// });

// box.files.getReadStream('130861063664', null, function(err, stream) {
//   if(err) console.log("error: ", error);
//   var output = fs.createWriteStream('/Users/JP/Desktop/Apps/testDownload.pdf');
//   stream.pipe(output);
// })
// console.log(__dirname);




// var uniqueID = uuid();
// fs.readFile("private_key.pem", 'utf-8', function(err, PRIVATE_KEY) {
//   console.log("KEY: ", PRIVATE_KEY);
  // var claims = {
  //     "iss": CLIENT_ID,
  //     "sub": ENTERPRISE_ID,
  //     "box_sub_type": "enterprise",
  //     "aud": "https://api.box.com/oauth2/token",
  //     "jti": uuid(),
  //     "exp": Date.now() / 1000 | 0 + 60
  // };
  // var options = {
  //   algorithm: 'RS256',
  //   header: {
  //     "alg": "RS256",
  //     "typ": "JWT",
  //     "kid": APP_ID
  //   }
  // };
  // var key = {
  //   key: PRIVATE_KEY,
  //   passphrase: PRIVATE_KEY_PASSPHRASE
  // };
  // var token = jwt.sign(claims, key, options);
  // console.log("token generated: ", token);
