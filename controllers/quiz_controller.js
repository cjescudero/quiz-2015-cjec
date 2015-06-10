var models=require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz=quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId));}
    }
  );
};

// GET /quizes
exports.index = function(req,res) {
  var busqueda = req.query.search || "";

  busqueda=busqueda.replace(/\s+/g,'%');
  console.log("Filtro: " + busqueda);
  models.Quiz.findAll({
      where: ['pregunta like ?', '%'+busqueda+'%'],
      order: "pregunta ASC"
      }).then(function(quizes) {
    res.render('quizes/index.ejs', {quizes: quizes, errors: []});
  })
};


// GET /quizes/show
exports.show = function(req,res) {
  res.render('quizes/show',{quiz: req.quiz, errors: []});
};

// GET /quizes/answer
exports.answer = function(req,res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer',
    { quiz: req.quiz,
      respuesta: resultado,
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );
  console.log('--->');
  console.log(req.body.quiz);

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes')})
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};
