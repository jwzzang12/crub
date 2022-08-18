const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv").config();

//mongodb 관련 모듈
const MongoClient = require("mongodb").MongoClient;
let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("연결");
  if (err) {
    console.log(err);
  }
  db = client.db("crudapp");
});

app.use(express.urlencoded({ extended: false }));
//post 방식으로 데이터를 넘겨 받기 위해서 필요한 것
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/index", (req, res) => {
  res.render("index");
});
app.get("/write", (req, res) => {
  // res.sendFile(path.join(__dirname, "public/html/write.html"));
  res.render("write");
});
app.post("/add", (req, res) => {
  const subject = req.body.subject;
  const contents = req.body.contents;
  //id 대신 name으로 받기 때문에 name이 중요한 것!
  const insertData = {
    subject: subject,
    contents: contents,
  };
  db.collection("crud").insertOne(insertData, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.log("잘들어갔음");
  });
  // res.sendFile(path.join(__dirname, "public/html/result.html"));
  res.send(`<script>alert("까꿍"); location.href="/list"</script>`);
  //node에서는 브라우저 스크립트가 작동하지 않기 때문에 알림창과 같은 브라우저 스크립트를
  //사용하고 싶으면 이렇게 하는 수 밖에 없음
  res.redirect("/list");
  // res.send, res.redirect 동시에 쓸 수 없음
  // 이유는 send를 통해 데이터 보내고 나면 종료

  // 1. db 접속
  // 2. 데이터 밀어넣기
});
//데이터를 밀어넣을떄
app.get("/list", (req, res) => {
  //crud에서 데이터 받아보기
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      // res.json(result); // front가 알아서 처리해서 가져다 쓰기
      res.render("list", { list: result, title: "테스트" }); //페이지를 내가 만들어서 보내주기
    });
  // res.send("list페이지 입니다.");
});
app.get("/detail/:subject", (req, res) => {
  console.log(req.params.subject);
  const subject = req.params.subject;
  db.collection("crud").findOne({ subject: subject }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.render("detail", { subject: result.subject, contents: result.contents });
    }
  });
});
//받은 데이터를 단순히 뿌릴 때
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기 중`);
});
