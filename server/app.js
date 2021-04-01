const PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const server = require('http').Server(app);
const multer = require('multer');
const bodyParser = require('body-parser')
const path = require('path');
const fs = require('fs')
const WebSocket = require('ws');

/* const server = http.createServer(app); */

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);  
    }
});
const upload = multer({ storage: storage })
/* app.use(express.static(__dirname + '/dist')); */

app.use(express.static('../checkdoc/dist'))
//app.use(bodyParser.text({ type: '*/*' }))

server.listen(PORT, function () {
    console.log('Server started!');
})

/* let mongoClient = require('mongodb').MongoClient;
let url = 'mongodb+srv://egor:egor@cluster0.70pzh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; */

const wss = new WebSocket.Server({ clientTracking: true, server: server });

let checkingDocs=[]

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        console.log('typeof(data)',typeof(data))
        console.log('data',data)
        if(data=="Подписи проверены"){
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send("Подписи проверены");
                }
            });
            return
        }
        data=JSON.parse(data)
        console.log('data',data)
        console.log('data.telNumber',data['telNumber'])
        let chekedDoc=checkingDocs.filter(doc=>doc.tel2==data.telNumber || doc.tel3==data.telNumber)
        console.log('chekedDoc',chekedDoc)
        if(!chekedDoc[0]['signCount']){
            chekedDoc[0]['signCount']=true
            console.log('chekedDoc[0]',chekedDoc[0])
        }else{
            console.log('Документ проверен, две подписи поставлены')
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send("Документ проверен");
                }
            });
        }
    });
  });


app.post("/",upload.single("file"),function (req, res, next) {
    let file = req.file;
    console.log("req.file",req.file)
    if(!file)
        res.send("Ошибка при загрузке файла");
    else{
        let newDocToCheck={
            tel2:req.body.tel2,
            tel3:req.body.tel3,
            date:req.body.date,
            expire:req.body.expire,
            fileName:req.file.originalname,
            file:req.file.path,
            signCount:false,
        }
        checkingDocs.push(newDocToCheck)
        console.log('checkingDocs',checkingDocs)
    }


/*     mongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client)=>{
        if(err) return console.log("ошибка подключения");
        let collection=client.db('docs').collection("docs");
        let newDocToCheck={
            tel2:req.body.tel2,
            tel3:req.body.tel3,
            date:req.body.date,
            expire:req.body.expire,
            fileName:req.file.originalname,
            file:req.file.buffer,
        }
        collection.insertOne(newDocToCheck, (err, result)=>{
            if(err){
                return console.log("ошибка2",err);
            }
            console.log(newDocToCheck)
        })
    }) */
        
});
app.post("/check",upload.none(),function (req, res) {
    let myDocsToCheck=checkingDocs.filter(myDoc=>myDoc.tel2==req.body.telNumber || myDoc.tel3==req.body.telNumber)
    console.log('myDocsToCheck',myDocsToCheck[0])
    if(myDocsToCheck.length==0){
        res.send({ isDocToCheck: 'false' })
    }else {

        res.send(myDocsToCheck[0])
    }
        
})
app.get('/download', function(req, res){
    console.log(req.query)
    res.download( 'uploads/by.docx')
  });