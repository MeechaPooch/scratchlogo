import express from 'express'
import https from 'https'
import cors from 'cors'
import bodyParser from 'body-parser'
import webp from 'webp-converter'
import fs from 'fs'
import sizeOf from 'image-size'
import sharp from 'sharp'
import path from 'path'
const inp = './img'
const resized = './resized.png'
const frameOutput = 'outp.webp'
const animOutput = 'final.png'
const maxDim = '499'
webp.grant_permission();
const logs = 'logs.txt'

const privateKey  = fs.readFileSync('/home/ubuntu/ssl-keys/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/home/ubuntu/ssl-keys/cert.pem', 'utf8');
const credentials = {key: privateKey, cert: certificate};


let app = express()
app.use(cors({origin:'*'}))
app.use(bodyParser.raw({
  type:'application/image',
  limit: '50mb'
}))

let lastId=0

function startConversion() {
  lastId++;
  let id=""+lastId;
  try{fs.rmSync(id,{recursive:true,force:true});}catch(e){}
  fs.mkdirSync(id);
  return id;
}
function finishConversion(id) {
  try{fs.rmSync(id,{recursive:true,force:true})}catch(e){}
}
async function create(image,id) {
  let size = sizeOf(image);

  // let ratio = Math.min(1,maxDim / Math.max(size.height, size.width));
  let ratio = maxDim / Math.max(size.height, size.width);

  // resize input image
  await new Promise(res=>{
  sharp(image)
  .resize(Math.round(size.width * ratio), Math.round(size.height * ratio),ratio>10?{kernel: sharp.kernel.nearest}:{})
  .toFile(id+path.sep + resized, (err, info) => { res() })});

  // remove previous progress dudes
  fs.rmSync(id+path.sep + frameOutput,{force:true})
  fs.rmSync(id+path.sep + animOutput,{force:true})

  // convert resized to webp
  await webp.cwebp(id+path.sep + resized, id+path.sep + frameOutput, "", "-v");

  // convert webp to webp animated
  let input = [{ "path": id+path.sep + frameOutput, "offset": "+100" },
               { "path": id+path.sep + frameOutput, "offset": "+200" },
               { "path": id+path.sep + frameOutput, "offset": "+300" },];
  input = [input[0], input[0], input[0],]
  let result = await webp.webpmux_animate(input, id+path.sep + animOutput, "0", "0,0,0,0", '');

  // let finalImage = fs.readFileSync(animOutput)
  // return finalImage;
  // console.log(result)
}
// await test();

function createWebp(image) {

}

app.post('/image', async (req, res) => {
  fs.appendFile(logs,'~image')
  console.log('hi')
  console.log(req.body)
  let id = startConversion()
  try{
  let output = await create(req.body,id)
  // res.send(output)
  console.log(process.cwd() + path.sep + id + path.sep + animOutput)
  res.sendFile(process.cwd() + path.sep + id + path.sep + animOutput,()=>{finishConversion(id)})
  // res.end();
  return;
  } catch (e) {
    res.status(400)
    res.send('could not convert file. make sure to use a common image format.')
    finishConversion(id)
  }
})

app.post('/user', async (req, res) => {
  fs.appendFile(logs,req.body)
  let id = startConversion()
  try{
  console.log('hi')
  console.log(req.body)
  let userRes = await fetch('https://api.scratch.mit.edu/users/' + req.body)
  let userResJson = await userRes.json()
  let userResPFPLinkRaw = userResJson['profile']['images']['90x90']
  let imageLink = userResPFPLinkRaw.replace('90x90','500x500');

  let imageBlob = await (await fetch(imageLink)).blob()
  console.log(imageBlob)
  let output = await create(Buffer.from(await imageBlob.arrayBuffer()),id)
  // res.send(output)
  console.log(process.cwd() + path.sep + id + path.sep + animOutput)
  res.sendFile(process.cwd() + path.sep + id + path.sep + animOutput,()=>{finishConversion(id)})
  // res.end();

  return;
  } catch (e) {
    res.status(400)
    res.send('could not convert user "' + req.body + '"')
    finishConversion(id)
  }
})


const port=4560
let httpsServer = https.createServer(credentials, app);
httpsServer.listen(port)
// app.listen(port)
console.log(`hosted at ${(await (await fetch('https://ipinfo.io/json')).json()).ip}:${port}`)