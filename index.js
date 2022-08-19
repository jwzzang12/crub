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
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: false }));
//post 방식으로 데이터를 넘겨 받기 위해서 필요한 것
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/write", (req, res) => {
  res.render("write");
});
app.post("/add", (req, res) => {
  db.collection("counter").findOne({ name: "total" }, (err, result) => {
    const total = result.totalPost;
    const subject = req.body.subject;
    const contents = req.body.contents;
    //id 대신 name으로 받기 때문에 name이 중요한 것!
    const insertData = {
      no: total + 1,
      subject: subject,
      contents: contents,
    };
    db.collection("crud").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "total" }, { $inc: { totalPost: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log("잘들어갔음");
        res.send(`<script>alert("글이 입력되었습니다");location.href="/list"</script>`);
      });
    });
  });
});
//데이터를 밀어넣을떄
app.get("/list", (req, res) => {
  //crud에서 데이터 받아보기
  db.collection("crud")
    .find()
    .toArray((err, result) => {
      console.log(result);
      // res.json(result); // front가 알아서 처리해서 가져다 쓰기
      res.render("list", { list: result, title: "테스트dd" }); //페이지를 내가 만들어서 보내주기
    });
});
app.get("/detail/:no", (req, res) => {
  console.log(req.params.no);
  const no = parseInt(req.params.no);
  db.collection("crud").findOne({ no: no }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.render("detail", { subject: result.subject, contents: result.contents });
      //받은 데이터를 단순히 뿌릴 때
    }
  });
});
app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기 중`);
});
