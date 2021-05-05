const db = require('./database.js');
const format = require('pg-format');

let decks = [];

module.exports = function(app){

  //get all decks
  app.get("/decks", async (req, res) => {
    decks = await getAllDecksDatabase();
  	res.send(decks);
  });

  //upload new deck / cards
  app.post("/decks/upload", async (req, res) => {
    let message = checkDeckReqBody(req.body, req.files);

    //something is not right with the info received, send error code
    if (typeof message === "string"){
      console.log(message);
      res.json({
        state:"error",
        error_code:message
      });
    }
    else {
      const rows = await createNewDeckDatabase(req.body, res);
      if (rows[0] && typeof rows[0].id === "number"){
        const cards = await createNewCards(req.body.cards, req.body.type, rows[0].id, res);
        res.json({state:"success"});
      }
    }
  });

}

//check posted data for creating a new deck
function checkDeckReqBody(body, files){
  let message = true;

  if (!body){
    message = "no_deck";
  }
  else if (!body.name || body.name === ""){
    message = "no_deck_name";
  }
  else if (["member", "commentator", "event", "goal"].indexOf(body.type) === -1){
    message = "no_deck_type";
  }
  else if (!checkDate(body.createdOn)){
    console.log(body.createdOn, checkDate(body.createdOn));
    message = "incorrect_created_date";
  }
  else if (!body.cards || body.cards.length === 0){
    message = "no_deck_cards";
  }
  else {

    //no card specific info
    for (let x = 0 ; x < body.cards.length ; x++){
      if (!body.cards[x].name || body.cards[x].name === ""){
        message = "no_card_name";
        break;
      }

      //member/commentator card specific
      if (body.type === "member" || body.type === "commentator"){
        if (!body.cards[x].age || !Number.isInteger(Number.parseInt(body.cards[x].age))){
          message = "no_card_age";
          break;
        }
        else if (!body.cards[x].job || body.cards[x].job === ""){
          message = "no_card_job";
          break;
        }
        else if (!body.cards[x].japaneseName || body.cards[x].japaneseName === ""){
          message = "no_card_japaneseName";
          break;
        }
        else if (!body.cards[x].image || !body.cards[x].image.url){
          message = "no_card_image";
          break;
        }
      }
      //event/goal card specific
      else if (!body.cards[x].description || !body.cards[x].description === ""){
        message = "no_card_description";
        break;
      }
    }

  }

  //uploading image
  if (files){
    for (let x = 0 ; x < files.length ; x++){
      try {
        let cardIndex = Number.parseInt(files[x].fieldname.replace("cards[", "").replace("][image][file]", ""));
        body.cards[cardIndex].image.url = `/uploads/${files[x].filename}`;
      }
      catch(err) {
        message = "image_upload_error";
        break;
      }
    }
  }

  return message;
}

//check if provided data is a valid date
function checkDate(data){
  let newDate = new Date(Number.parseInt(data));
  if (Object.prototype.toString.call(newDate) === "[object Date]"){
    if (isNaN(newDate.getTime())) {
      return false;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

//catch any errors with database
function errorCatch(err, res){
  console.log(err);
  if (res){
    res.json({
      state:"error",
      error_code:"database_error"
    });
  }
}

//get all decks from the database
async function getAllDecksDatabase(res){
  const sql = `SELECT json_build_object(
      'name', d.name,
      'createdOn', d."createdOn",
      'description', d.description,
      'type', d.type,
      'cards',
        (
          SELECT json_agg(json_build_object(
            'name', c.name,
            'age', c.age,
            'job', c.job,
            'japaneseName', c."japaneseName",
            'image', c.image,
            'description', c.description
          ))
          FROM cards c
          WHERE d.id = c."deckId"
        )
      ) deck
    FROM decks d
  `;
  const results = await db.query(sql).catch((err)=>{errorCatch(err, res)});
  const { rows } = results || {};     //destructuring for rows
  return rows;
}

//create a new deck and return the ID
async function createNewDeckDatabase(deckObj, res){
  const sql = 'INSERT INTO decks("name", "createdOn", type, description) VALUES($1, $2, $3, $4) RETURNING id';
  const values = [
    deckObj.name,
    new Date(Number.parseInt(deckObj.createdOn)),
    deckObj.type,
    deckObj.description,
  ]

  const results = await db.query(sql, values).catch((err)=>{errorCatch(err, res)});
  const { rows } = results || {};     //destructuring for rows
  return rows;
}

//need cards in nested arrays and a card type
async function createNewCards(cards, type, deckId, res){
  let sql = (type === "member" || type === "commentator")
    ? 'INSERT INTO cards ("deckId", "name", "age", "job", "japaneseName", "image") VALUES %L RETURNING id'
    : 'INSERT INTO cards ("deckId", "name", "description") VALUES %L RETURNING id';

  let formattedCards = [];
  for (let x = 0 ; x < cards.length ; x++){
    if (type === "member" || type === "commentator"){
      formattedCards.push([
        deckId,
        cards[x].name,
        cards[x].age,
        cards[x].job,
        cards[x].japaneseName,
        JSON.stringify(cards[x].image),
      ]);
    }
    else {
      formattedCards.push([
        deckId,
        cards[x].name,
        cards[x].description,
      ]);
    }
  }

  let query = format(sql, formattedCards);

  const results = await db.query(query).catch((err)=>{errorCatch(err, res)});
  const { rows } = results || {};     //destructuring for rows
  return rows;
}
