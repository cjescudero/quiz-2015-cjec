var models=require('../models/models.js');

// Autoload
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
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
    {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
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
        .save({fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes')})
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;

/*  switch (quiz.tema) {
    case 'otro':
      quiz.otro='selected';
      break;
    case 'humanidades':
      quiz.humanidades='selected';
      break;
    case 'ocio':
      quiz.ocio='selected';
      break;
    case 'ciencia':
      quiz.ciencia='selected';
      break;
    case 'tecnologia':
      quiz.tecnologia='selected';
  }*/
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "tema"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};


// GET /quizes/statistics
exports.statistics = function(req,res) {
  var npreguntas=4;
  var ncomentarios=10;
  var npreguntas_nocomment=1;

  models.Quiz.count().then(function(nr) {
      npreguntas=nr;
      models.Comment.count().then(function(nc) {
        ncomentarios=nc;
        models.Quiz.count({
            where: ['texto IS NULL'],
            include: [{model: models.Comment}]
          }).then(function(nr_wc) {
            npreguntas_nocomment = npreguntas-nr_wc;
            res.render('quizes/statistics.ejs', {errors: [], npreguntas: npreguntas, ncomentarios: ncomentarios, npreguntas_nocomment: npreguntas_nocomment});
        })
      })
  })
};
