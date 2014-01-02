var User = require('../../models/user');

function minLen(pass, min) {
  if (pass.length < min) {
    return false;
  }
  return true;
}

function maxLen(pass, max) {
  if (pass.length > max) {
    return false;
  }
  return true;
}

exports.fieldsNotEmpty = function () {
  return function (req, res, next) {
    var data = req.body.user;
    if (!data.name) {
      res.send(400, 'Username can\'t be empty')
    } else if (!data.pass) {
      res.send(400, 'Password can\'t be empty')
    } else {
      next();
    }
  };
};

exports.userNotTaken = function () {
  return function (req, res, next) {
    var data = req.body.user;
    User.findOne({ username: data.name }, function (err, doc) {
      if (err) return next(err);
      if (doc) {
        res.send(400, 'Username already taken');
      } else {
        next();
      }
    });
  };
};

exports.passwordsEqual = function () {
  return function (req, res, next) {
    var data = req.body.user;
    if (data.pass !== data.confirm) {
      res.send(400, 'Passwords do not match')
    } else {
      next();
    }
  };
};

/**
Verifies user's password meets all rules specified.

Options String format: 'option1 [#]|option2'

There must only be one space between the option and specified number.
Case matters.

Supported rules:
minlen # - minimum password length,
maxlen # - maximum password length

*/
exports.checkAgainstRules = function (optionString) {
  var options = optionString.split('|');
  var rulesRef = ['num', 'minlen', 'maxlen'];

  return function (req, res, next) {
    var data = req.body.user,
        command, op, i, count, arg1, arg2;

    for (i = 0; i < options.length; ++i) {
      command = options[i].trim().split(' ');
      if (command.length === 2) {
        arg1 = command[0];
        arg2 = parseInt(command[1], 10);
        if (isNaN(arg2)) return next(new Error('Bad argument: ' + arg2));
          if (arg1 === 'minlen') {
            if (!minLen(data.pass, arg2)) {
              res.error('Password needs to be at least ' + arg2 + 
                        ' characters long');
              return res.redirect('back');
            }
          } else if (arg1 === 'maxlen') {
            if (!maxLen(data.pass, arg2)) {
              res.error('Password needs to be fewer than ' + arg2 + 
                        ' characters long');
              return res.redirect('back');
            }
          } else {
            return next(new Error('Unknown command: ' + arg1));
          }
        } else {
          if (rulesRef.indexOf(command[0]) === -1) {
            return next(new Error('Unknown command: ' + command[0]));
          }
          return next(new Error('Wrong number of arguments for ' + 
                                command[0]));
        }
      }
      next();
    };
  };

exports.isValidEmail = function () {
  return function (req, res, next) {
    var email = req.body.user.email;
    if (email) {
      email = email.trim();
      var patt = new RegExp(/\S+@\S+\.\S+/);
      if (!patt.test(email)) return res.send(400, 'Invalid email');
    }
    next();
  }
}

exports.checkCellInfo = function () {
  return function (req, res, next) {
    var number = req.body.user.cell;
    if (number) {
      // Not valid for production
      if (number.length !== 10) return res.send(400, 'Invalid cell number');
      var carrier = req.body.user.carrier;
      if (carrier === 'Choose one') return res.send(400, 'No carrier chosen');
    }
    next();
  }
}