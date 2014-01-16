function ClassController(configure) {
}

ClassController.prototype.showClassPage = function(req, res) {
  res.render('class.html', {
    title: req.param('name'),
    sections: ['Classes']
  });
}

module.exports = ClassController;
