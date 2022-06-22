import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { Http2ServerResponse } from 'http2';
import { stringify } from 'querystring';

(async () => {

  // Source : https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  const urlImageRegex = /([/|.|\w|\s|-])*\.(?:jpg|gif|png)/
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/filteredimage", async (req : express.Request, res : express.Response) => {
    var queryURL : string = req.query.image_url;
    if (!queryURL || queryURL == "") {
      return res.status(400).send({ message: `image_url is required` })
    }
    //regex url
    if (!queryURL.match(urlRegex)) {
      return res.status(402).send({ message: `url wrong format` })
    }

    //regex url is a image url
    var urlIsSplited = String(queryURL).split("/")
    var imageName :string= urlIsSplited[urlIsSplited.length - 1]
    if (!imageName.match(urlImageRegex)) {
      return res.status(402).send({ message: `image_url wrong format` })
    }
    var imageRes :string = await filterImageFromURL(queryURL)
    res.status(200).sendFile(imageRes, async () => {
      await deleteLocalFiles([imageRes])
    })
  });

  // health check for ec2 loadbalancer
  app.get("/", async (req : express.Request, res : express.Response) => {
      return res.status(200).send({msg:"qua ok "});
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();