var models=require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
    function(quiz) {
      if (quiz) {
        req.quiz=quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId));}
    }
  ).catch(function(error) {next(error);});
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
    res.render('quizes/index.ejs', {quizes: quizes});
  })
};


// GET /quizes/show
exports.show = function(req,res) {
  res.render('quizes/show',{quiz: req.quiz});
};

// GET /quizes/answer
exports.answer = function(req,res) {
  if (req.query.respuesta === req.quiz.respuesta) {
    res.render('quizes/answer', { quiz: req.quiz, respuesta: 'Correcto'});
  } else {
    res.render('quizes/answer', {quiz: req.quiz, respuesta: 'Incorrecto'});
  };
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  console.log(quiz.pregunta +' / '+quiz.respuesta);
  res.render('quizes/new', {quiz: quiz});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );
        quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
          res.redirect('/quizes');
        })
};
