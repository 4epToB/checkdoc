const PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const server = require('http').Server(app);
const multer = require('multer');
const WebSocket = require('ws');

/* Настройки хранилища Multer. Куда сохранять и как называть файл */
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

app.use(express.static('../client/dist'))/* статично отдаем серверу build проекта  */

server.listen(PORT, function () {
    console.log('Server started!');
})

/* let mongoClient = require('mongodb').MongoClient;
let url = 'mongodb+srv://egor:egor@cluster0.70pzh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'; 
Оставит блок подключения кластера на Mongoatlas, если вдруг масштабировать этот мини проект до чего-то самостоятельного
*/

const wss = new WebSocket.Server({ clientTracking: true, server: server });

let checkingDocs=[]/* Можно и не хранить массив документов на првоерку на сервере,тем более что он очистится после перезагрузки, думал это делать в БД
но потом понял что хочется и загрузить оттуда список проверенных документов и список документов ожидающих проверку, поэтому решил просто хранить тут,
хотя на примере одного файла для проверки и он не нужен */

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        /* Поскольку это мини версия приложения, я рассылаю сообщения через WebSocket всем участникам,посколько их всего 3.
        А на месте проверяю что в теле сообщения и отрабатываются соответствующие сценарии.*/
        if(data=="Подписи проверены"){/* Это событие когда 1ая сторона видит что документы проверены 2 и 3 стороной и нажимаем кнопку Подписи проверены.
            И рассылает всем событие,что бы уведомить всех участников об этом */
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send("Подписи проверены");
                }
            });
            return
        }
        /* Во всех других случаях,а их немного, будет отрабаываться события подписания документы стороной 2 и 3 */
        data=JSON.parse(data)
        /* Тут приходит в теле строка с данными о том кто подписал только что документ росписью, парсю ее что бы найти среди всех
        документов на проверке нужный нам и пометить его как подписанный одим их двух раз,путем установки ему свойства signCount в true.
        А если это свойство уже true, то тогда это пришла 2 из 2х необходимых подписей 
        и можно всем разослать уведомление что документ проверен и можно проверять подписи */
        let chekedDoc=checkingDocs.filter(doc=>doc.tel2==data.telNumber || doc.tel3==data.telNumber)
        /* Поиск в массиве гужного документ по ключу тут лишний, т.к. документ один и участкников два. Это задел на масштабирвоание проекта. */
        if(!chekedDoc[0]['signCount']){
            chekedDoc[0]['signCount']=true
        }else{
            /* Документ проверен,обе подписи поставлены,можно говорить 1ой стороне "Проверяй наши подписи" */
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                client.send("Документ проверен");
                /* Тоже рассылаю всем событие,но проверяю его только на первой стороне (компонент App.vue) */
                }
            });
        }
    });
  });
/* Ниже происходит создание объекта с данными о документа из формы и сохранение файла проверки на сервере  */

app.post("/",upload.single("file"),function (req, res, next) {
    let file = req.file;
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
    }
        
});
/* При удачном логине стороны 2 или 3 происходит поиск среди всех документов по номеру телефона. Есть ли что проверять вообще или нет */
app.post("/check",upload.none(),function (req, res) {
    let myDocsToCheck=checkingDocs.filter(myDoc=>myDoc.tel2==req.body.telNumber || myDoc.tel3==req.body.telNumber)
    if(myDocsToCheck.length==0){
        res.send({ isDocToCheck: 'false' })/* Если ничего нет отвечаем соответсвующим тригером,если можно так сказать */
    }else {
        res.send(myDocsToCheck[0])/* Если есть,отправляем то что нашли. Тут тоже можно сказать халтура ,я просто отправляю первый элемент массива
        объектов после фильтрации, т.к. списка отображения документов на проверку не предусмотрено, но оставил как есть на случай если это делать все таки */
    }
        
})/* 
Загрузка файла по Get запросу, в url запроса приходит название файла, отправляем файл.
 */
app.get('/download', function(req, res){
    res.download('./uploads/'+req.query.file)
  });